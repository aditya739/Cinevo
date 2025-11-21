// src/controllers/admin.controller.js
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { Report } from "../models/report.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

/**
 * DELETE /api/v1/admin/videos/:videoId
 * Admin can delete any video
 */
const deleteAnyVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  await Video.findByIdAndDelete(videoId);

  return res.status(200).json(
    new ApiResponse(200, null, "Video deleted successfully")
  );
});

/**
 * DELETE /api/v1/admin/comments/:commentId
 * Admin can delete any comment
 */
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  await Comment.findByIdAndDelete(commentId);

  return res.status(200).json(
    new ApiResponse(200, null, "Comment deleted successfully")
  );
});

/**
 * PATCH /api/v1/admin/users/:userId/ban
 * Ban or unban a user
 */
const toggleBanUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "admin") {
    throw new ApiError(403, "Cannot ban an admin user");
  }

  user.isBanned = !user.isBanned;
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { userId: user._id, isBanned: user.isBanned },
      `User ${user.isBanned ? "banned" : "unbanned"} successfully`
    )
  );
});

/**
 * GET /api/v1/admin/analytics
 * Get platform analytics
 */
const getAnalytics = asyncHandler(async (req, res) => {
  const [userStats, videoStats, engagementStats] = await Promise.all([
    // User statistics
    User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          bannedUsers: {
            $sum: { $cond: [{ $eq: ["$isBanned", true] }, 1, 0] },
          },
          adminUsers: {
            $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] },
          },
        },
      },
    ]),

    // Video statistics
    Video.aggregate([
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: "$likes" },
          shorts: {
            $sum: { $cond: [{ $eq: ["$isShort", true] }, 1, 0] },
          },
        },
      },
    ]),

    // Recent engagement (last 7 days)
    Video.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: null,
          videosLast7Days: { $sum: 1 },
          viewsLast7Days: { $sum: "$views" },
        },
      },
    ]),
  ]);

  const analytics = {
    users: userStats[0] || {
      totalUsers: 0,
      bannedUsers: 0,
      adminUsers: 0,
    },
    videos: videoStats[0] || {
      totalVideos: 0,
      totalViews: 0,
      totalLikes: 0,
      shorts: 0,
    },
    engagement: engagementStats[0] || {
      videosLast7Days: 0,
      viewsLast7Days: 0,
    },
  };

  return res.status(200).json(
    new ApiResponse(200, analytics, "Analytics fetched successfully")
  );
});

/**
 * GET /api/v1/admin/reports
 * Get all reported videos
 */
const getReportedVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const filter = {};
  if (status) {
    filter.status = status;
  }

  const reports = await Report.find(filter)
    .populate("video", "title thumbnail views")
    .populate("reportedBy", "username avatar")
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await Report.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reports,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      "Reports fetched successfully"
    )
  );
});

/**
 * GET /api/v1/admin/users
 * Get all users with pagination
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, banned } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { fullName: { $regex: search, $options: "i" } },
    ];
  }
  if (role) {
    filter.role = role;
  }
  if (banned !== undefined) {
    filter.isBanned = banned === "true";
  }

  const users = await User.find(filter)
    .select("-password -refreshToken")
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await User.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      "Users fetched successfully"
    )
  );
});

export {
  deleteAnyVideo,
  deleteComment,
  toggleBanUser,
  getAnalytics,
  getReportedVideos,
  getAllUsers,
};
