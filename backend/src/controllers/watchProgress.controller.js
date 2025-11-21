// src/controllers/watchProgress.controller.js
import { WatchHistory } from "../models/watchHistory.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

/**
 * POST /api/v1/watch-progress
 * Save or update watch progress for a video
 */
const saveWatchProgress = asyncHandler(async (req, res) => {
  const { videoId, watchTime, completed } = req.body;

  if (!videoId || watchTime === undefined) {
    throw new ApiError(400, "videoId and watchTime are required");
  }

  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Update or create watch history
  const watchHistory = await WatchHistory.findOneAndUpdate(
    { user: req.user._id, video: videoId },
    {
      watchTime: Number(watchTime),
      completed: completed || false,
      watchedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, watchHistory, "Watch progress saved")
  );
});

/**
 * GET /api/v1/watch-progress/continue-watching
 * Get videos to continue watching (not completed, with progress)
 */
const getContinueWatching = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const continueWatching = await WatchHistory.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
        completed: false,
        watchTime: { $gt: 0 },
      },
    },
    { $sort: { watchedAt: -1 } },
    { $limit: Number(limit) },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    { $unwind: "$videoDetails" },
    {
      $lookup: {
        from: "users",
        localField: "videoDetails.owner",
        foreignField: "_id",
        as: "videoDetails.owner",
      },
    },
    { $unwind: "$videoDetails.owner" },
    {
      $project: {
        _id: 1,
        watchTime: 1,
        watchedAt: 1,
        video: {
          _id: "$videoDetails._id",
          title: "$videoDetails.title",
          thumbnail: "$videoDetails.thumbnail",
          duration: "$videoDetails.duration",
          views: "$videoDetails.views",
          createdAt: "$videoDetails.createdAt",
          owner: {
            _id: "$videoDetails.owner._id",
            username: "$videoDetails.owner.username",
            avatar: "$videoDetails.owner.avatar",
          },
        },
        progress: {
          $multiply: [
            { $divide: ["$watchTime", "$videoDetails.duration"] },
            100,
          ],
        },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(200, continueWatching, "Continue watching fetched")
  );
});

/**
 * GET /api/v1/watch-progress/:videoId
 * Get watch progress for a specific video
 */
const getVideoProgress = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const watchHistory = await WatchHistory.findOne({
    user: req.user._id,
    video: videoId,
  });

  if (!watchHistory) {
    return res.status(200).json(
      new ApiResponse(200, { watchTime: 0, completed: false }, "No progress found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, watchHistory, "Watch progress fetched")
  );
});

export { saveWatchProgress, getContinueWatching, getVideoProgress };
