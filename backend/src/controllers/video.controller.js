// src/controllers/video.controller.js
import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Reaction } from "../models/reaction.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

/**
 * GET /videos
 * Enhanced search with filters: duration, upload date, category, user
 * Query params:
 *  - page, limit, search, sort, userId
 *  - category, minDuration, maxDuration, uploadDate, tags
 */
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sort = "newest",
    userId,
    category,
    minDuration,
    maxDuration,
    uploadDate,
    tags,
    isShort,
    minViews,
    maxViews,
    creator
  } = req.query;

  // build filter
  const filter = {};
  if (search && String(search).trim()) {
    filter.$or = [
      { title: { $regex: String(search).trim(), $options: "i" } },
      { description: { $regex: String(search).trim(), $options: "i" } },
      { tags: { $in: [new RegExp(String(search).trim(), "i")] } }
    ];
  }
  if (userId) {
    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid userId");
    filter.owner = new mongoose.Types.ObjectId(userId);
  }
  if (category) {
    filter.category = category;
  }
  if (minDuration || maxDuration) {
    filter.duration = {};
    if (minDuration) filter.duration.$gte = Number(minDuration);
    if (maxDuration) filter.duration.$lte = Number(maxDuration);
  }
  if (uploadDate) {
    const date = new Date();
    switch (uploadDate) {
      case "today":
        filter.createdAt = { $gte: new Date(date.setHours(0, 0, 0, 0)) };
        break;
      case "week":
        filter.createdAt = { $gte: new Date(date - 7 * 24 * 60 * 60 * 1000) };
        break;
      case "month":
        filter.createdAt = { $gte: new Date(date - 30 * 24 * 60 * 60 * 1000) };
        break;
    }
  }
  if (tags) {
    const tagArray = String(tags).split(",").map(tag => tag.trim());
    filter.tags = { $in: tagArray };
  }
  
  // filter by isShort if provided
  if (isShort !== undefined) {
    filter.isShort = isShort === 'true';
  }

  // filter by views range
  if (minViews || maxViews) {
    filter.views = {};
    if (minViews) filter.views.$gte = Number(minViews);
    if (maxViews) filter.views.$lte = Number(maxViews);
  }

  // build sort
  let sortObj;
  switch (sort) {
    case "oldest":
      sortObj = { createdAt: 1 };
      break;
    case "views":
      sortObj = { views: -1 };
      break;
    case "likes":
      sortObj = { likes: -1 };
      break;
    default: // newest
      sortObj = { createdAt: -1 };
  }

  const p = Math.max(1, Number(page) || 1);
  const l = Math.max(1, Number(limit) || 10);

  // fetch videos with user reactions
  const videos = await Video.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "reactions",
        let: { videoId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$video", "$$videoId"] },
                  { $eq: ["$user", new mongoose.Types.ObjectId(req.user?._id || "000000000000000000000000")] }
                ]
              }
            }
          }
        ],
        as: "userReaction"
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner"
      }
    },
    { $unwind: "$owner" },
    {
      $addFields: {
        userReaction: { $arrayElemAt: ["$userReaction.type", 0] }
      }
    },
    {
      $project: {
        "owner.password": 0,
        "owner.refreshToken": 0,
        "owner.email": 0,
        "owner.fullName": 0,
        "owner.coverImage": 0,
        "owner.watchHistory": 0
      }
    },
    { $sort: sortObj },
    { $skip: (p - 1) * l },
    { $limit: l }
  ]);

  const total = await Video.countDocuments(filter);
  const totalPages = Math.ceil(total / l);

  return res.status(200).json(
    new ApiResponse(200, {
      videos,
      meta: { page: p, limit: l, total, totalPages }
    }, "Videos fetched")
  );
});

/**
 * POST /videos
 * Expects multipart/form-data with fields:
 *  - title (required)
 *  - description (optional)
 *  - duration (required)
 *  - videoFile (file, required)
 *  - thumbnail (file, optional)
 *
 * Multer places files in req.files (upload.fields). We handle a few possible keys for robustness.
 */
const publishAVideo = asyncHandler(async (req, res) => {

  const { title, description, duration } = req.body || {};

  // tolerant file extraction: support multiple naming patterns
  let videoFileObj = null;
  if (req.files && req.files.videoFile && req.files.videoFile[0]) videoFileObj = req.files.videoFile[0];
  else if (req.file && req.file.mimetype?.startsWith("video")) videoFileObj = req.file;
  else if (req.files && req.files.video && req.files.video[0]) videoFileObj = req.files.video[0];
  else if (req.files && req.files.file && req.files.file[0]) videoFileObj = req.files.file[0];

  // if no video file found -> return helpful error
  if (!videoFileObj) {
    const present = Object.keys(req.files || {}).join(",") || "(none)";
    throw new ApiError(400, `Video file is required. Received file keys: ${present}`);
  }

  // For memory storage, we have buffer instead of path
  const videoBuffer = videoFileObj.buffer;
  // optional thumbnail
  const thumbnailObj = req.files && req.files.thumbnail ? req.files.thumbnail[0] : null;
  const thumbBuffer = thumbnailObj ? thumbnailObj.buffer : null;

  // validate text fields
  if (!title || !String(title).trim()) {
    throw new ApiError(400, "Title is required");
  }
  if (!duration || isNaN(Number(duration))) {
    throw new ApiError(400, "Duration (in seconds) is required and must be a number");
  }

  // Upload video to Cloudinary using buffer
  let videoUpload;
  try {
    videoUpload = await uploadOnCloudinary(videoBuffer, { resource_type: "auto", folder: "videos" });
  } catch (err) {
    throw new ApiError(500, "Failed to upload video: " + (err?.message || "unknown"));
  }

  // Upload thumbnail (optional). If it fails we continue (thumbnail not required)
  let thumbUpload = null;
  if (thumbBuffer) {
    try {
      thumbUpload = await uploadOnCloudinary(thumbBuffer, { resource_type: "image", folder: "thumbnails" });
    } catch (err) {
      thumbUpload = null;
    }
  }

  // create Video document
  const videoDoc = await Video.create({
    videoFile: videoUpload?.url || videoUpload?.secure_url || videoUpload?.raw?.secure_url || "",
    thumbnail: thumbUpload?.url || thumbUpload?.secure_url || "",
    title: String(title).trim(),
    description: description ? String(description) : "",
    duration: Number(duration),
    owner: req.user._id,
    views: 0,
    likes: 0,
    isPublished: true,
    isShort: Number(duration) <= 60
  });

  // populate owner for response
  const created = await Video.findById(videoDoc._id).populate("owner", "username avatar");

  return res.status(201).json(new ApiResponse(201, created, "Video published"));
});

/**
 * GET /videos/:videoId
 * Return video by id, increment views by 1, include user reaction.
 */
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid videoId");

  // increment views and get video with user reaction
  await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

  const video = await Video.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
    {
      $lookup: {
        from: "reactions",
        let: { videoId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$video", "$$videoId"] },
                  { $eq: ["$user", new mongoose.Types.ObjectId(req.user?._id || "000000000000000000000000")] }
                ]
              }
            }
          }
        ],
        as: "userReaction"
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner"
      }
    },
    { $unwind: "$owner" },
    {
      $addFields: {
        userReaction: { $arrayElemAt: ["$userReaction.type", 0] }
      }
    }
  ]);

  if (!video[0]) throw new ApiError(404, "Video not found");

  return res.status(200).json(new ApiResponse(200, video[0], "Video fetched"));
});

/**
 * PATCH /videos/:videoId
 * Update title, description, thumbnail (if provided). Only owner can update.
 */
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid videoId");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  // only owner can edit
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to update this video");
  }

  const { title, description } = req.body || {};

  if (title) video.title = String(title).trim();
  if (description !== undefined) video.description = String(description);

  // handle thumbnail update if file present (multer single("thumbnail") used in route)
  if (req.file && req.file.mimetype && req.file.mimetype.startsWith("image")) {
    // upload thumbnail using buffer
    try {
      const thumb = await uploadOnCloudinary(req.file.buffer, { resource_type: "image", folder: "thumbnails" });
      video.thumbnail = thumb?.url || thumb?.secure_url || video.thumbnail;
    } catch (err) {
      // do not block update; just warn
    }
  }

  await video.save();

  const updated = await Video.findById(videoId).populate("owner", "username avatar");

  return res.status(200).json(new ApiResponse(200, updated, "Video updated"));
});

/**
 * DELETE /videos/:videoId
 * Delete a video. Only owner can delete.
 */
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid videoId");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to delete this video");
  }

  // TODO: optionally delete remote files from Cloudinary using public_id if you store it
  await Video.findByIdAndDelete(videoId);

  return res.status(200).json(new ApiResponse(200, null, "Video deleted"));
});

/**
 * PATCH /videos/toggle/publish/:videoId
 * Toggle publish status for owner
 */
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid videoId");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to change publish status");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res.status(200).json(new ApiResponse(200, video, `Video ${video.isPublished ? "published" : "unpublished"}`));
});

/**
 * POST /videos/:videoId/react
 * Handle like/dislike reactions
 */
const reactToVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { type } = req.body;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid videoId");
  if (type && !['like', 'dislike'].includes(type)) {
    throw new ApiError(400, "Invalid reaction type");
  }

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  const existingReaction = await Reaction.findOne({
    user: req.user._id,
    video: videoId
  });

  if (!type) {
    // Remove reaction
    if (existingReaction) {
      const updateObj = {};
      if (existingReaction.type === 'like') {
        updateObj.$inc = { likes: -1 };
        updateObj.$max = { likes: 0 };
      } else {
        updateObj.$inc = { dislikes: -1 };
        updateObj.$max = { dislikes: 0 };
      }
      await Video.findByIdAndUpdate(videoId, updateObj);
      await Reaction.findByIdAndDelete(existingReaction._id);
    }
  } else {
    if (existingReaction) {
      // Update existing reaction only if different
      if (existingReaction.type !== type) {
        const updateObj = {};
        if (existingReaction.type === 'like') {
          updateObj.$inc = { likes: -1, dislikes: 1 };
          updateObj.$max = { likes: 0 };
        } else {
          updateObj.$inc = { likes: 1, dislikes: -1 };
          updateObj.$max = { dislikes: 0 };
        }
        await Video.findByIdAndUpdate(videoId, updateObj);
        existingReaction.type = type;
        await existingReaction.save();
      }
    } else {
      // Create new reaction
      await Reaction.create({ user: req.user._id, video: videoId, type });
      const updateObj = { $inc: {} };
      updateObj.$inc[type === 'like' ? 'likes' : 'dislikes'] = 1;
      await Video.findByIdAndUpdate(videoId, updateObj);
    }
  }

  const updatedVideo = await Video.findById(videoId).populate("owner", "username avatar");
  const userReaction = await Reaction.findOne({ user: req.user._id, video: videoId });
  
  return res.status(200).json(
    new ApiResponse(200, {
      ...updatedVideo.toObject(),
      userReaction: userReaction?.type || null
    }, "Reaction updated")
  );
});

/**
 * GET /videos/recommendations/:videoId
 * Get recommended videos based on current video
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid videoId");

  const currentVideo = await Video.findById(videoId);
  if (!currentVideo) throw new ApiError(404, "Video not found");

  // Find similar videos by category and tags
  const recommendations = await Video.find({
    _id: { $ne: videoId },
    $or: [
      { category: currentVideo.category },
      { tags: { $in: currentVideo.tags } },
      { owner: currentVideo.owner }
    ]
  })
  .populate("owner", "username avatar")
  .sort({ views: -1, likes: -1 })
  .limit(Number(limit));

  return res.status(200).json(new ApiResponse(200, recommendations, "Recommendations fetched"));
});

/**
 * GET /users/:userId/profile
 * Get user profile with videos and stats
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid userId");

  const [user, videos, stats] = await Promise.all([
    mongoose.model("User").findById(userId).select("username avatar coverImage fullName createdAt"),
    Video.find({ owner: userId }).populate("owner", "username avatar").sort({ createdAt: -1 }),
    Video.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: "$likes" }
        }
      }
    ])
  ]);

  if (!user) throw new ApiError(404, "User not found");

  const userStats = stats[0] || { totalVideos: 0, totalViews: 0, totalLikes: 0 };

  return res.status(200).json(new ApiResponse(200, {
    user,
    videos,
    stats: userStats
  }, "User profile fetched"));
});

/**
 * GET /videos/shorts/feed
 * Get a feed of shorts (random/algorithmic)
 */
const getShortsFeed = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const shorts = await Video.aggregate([
    { $match: { isShort: true, isPublished: true } },
    { $sample: { size: Number(limit) } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner"
      }
    },
    { $unwind: "$owner" },
    {
      $lookup: {
        from: "reactions",
        let: { videoId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$video", "$$videoId"] },
                  { $eq: ["$user", new mongoose.Types.ObjectId(req.user?._id || "000000000000000000000000")] }
                ]
              }
            }
          }
        ],
        as: "userReaction"
      }
    },
    {
      $addFields: {
        userReaction: { $arrayElemAt: ["$userReaction.type", 0] }
      }
    },
    {
      $project: {
        "owner.password": 0,
        "owner.refreshToken": 0,
        "owner.email": 0,
        "owner.fullName": 0,
        "owner.coverImage": 0,
        "owner.watchHistory": 0
      }
    }
  ]);

  return res.status(200).json(new ApiResponse(200, shorts, "Shorts feed fetched"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  reactToVideo,
  getRecommendations,
  getUserProfile,
  getShortsFeed
};
