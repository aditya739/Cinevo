// src/controllers/user.controller.js

import mongoose from "mongoose"; // required for ObjectId in aggregation
import { asyncHandler } from "../utils/asyncHandler.js"; // wrapper for async routes
import { ApiError } from "../utils/ApiError.js"; // custom error handler
import { User } from "../models/user.model.js"; // user schema
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // cloudinary upload helper
import { ApiResponse } from "../utils/ApiResponse.js"; // custom success response
import jwt from "jsonwebtoken"; // JWT for tokens

/* ------------------------------------------------------
   Helper: Generate Access + Refresh Tokens for a user
------------------------------------------------------ */
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong while generating tokens"
    );
  }
};

/* ------------------------------------------------------
   REGISTER USER (with duplicate key handling)
------------------------------------------------------ */
const registerUser = asyncHandler(async (req, res) => {
  const fullName = (req.body.fullname || req.body.fullName || "").trim();
  const email = (req.body.email || "").trim();
  const usernameRaw = (req.body.username || "").trim();
  const password = req.body.password;

  if (![fullName, email, usernameRaw, password].every((f) => !!f)) {
    throw new ApiError(400, "All fields are required");
  }

  const username = usernameRaw.toLowerCase();
  const emailLower = email.toLowerCase();

 const existedUser = await User.findOne({
  $or: [{ username }, { email: emailLower }],
});

if (existedUser) {
  if (existedUser.username === username) {
    throw new ApiError(409, `Username "${username}" is already taken`, { field: "username" });
  }
  if (existedUser.email === emailLower) {
    throw new ApiError(409, `Email "${emailLower}" is already registered`, { field: "email" });
  }
  throw new ApiError(409, "User already exists");
}


  const avatarFile = req.files?.avatar?.[0];
  const coverImageFile = req.files?.coverImage?.[0];

  if (!avatarFile) throw new ApiError(400, "Avatar file is required");

  const avatar = await uploadOnCloudinary(avatarFile.buffer);
  const coverImage = coverImageFile
    ? await uploadOnCloudinary(coverImageFile.buffer)
    : null;

  if (!avatar) throw new ApiError(500, "Avatar upload failed");

  let user;
  try {
    user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email: emailLower,
      password,
      username,
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue[field];
      throw new ApiError(409, `${field} "${value}" is already taken`);
    }
    throw err;
  }

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

/* ------------------------------------------------------
   LOGIN USER
------------------------------------------------------ */
const loginUser = asyncHandler(async (req, res) => {
  const { email: emailRaw, username: usernameRaw, password } = req.body;

  if (!usernameRaw && !emailRaw) {
    throw new ApiError(400, "Username or email is required");
  }

  const username = usernameRaw ? usernameRaw.toLowerCase() : null;
  const email = emailRaw ? emailRaw.toLowerCase() : null;

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) throw new ApiError(404, "User does not exist");

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid password");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

/* ------------------------------------------------------
   LOGOUT USER
------------------------------------------------------ */
const logoutUser = asyncHandler(async (req, res) => {
  if (req.user?._id) {
    await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { refreshToken: "" } },
      { new: true }
    );
  }

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

/* ------------------------------------------------------
   REFRESH ACCESS TOKEN
------------------------------------------------------ */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) throw new ApiError(401, "Invalid refresh token");

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token expired or already used");
    }

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

/* ------------------------------------------------------
   CHANGE PASSWORD
------------------------------------------------------ */
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError(404, "User not found");

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

/* ------------------------------------------------------
   GET CURRENT USER
------------------------------------------------------ */
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched"));
});

/* ------------------------------------------------------
   UPDATE ACCOUNT DETAILS (with duplicate key handling)
------------------------------------------------------ */
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  let updated;
  try {
    updated = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: { fullName, email: email.toLowerCase() } },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue[field];
      throw new ApiError(409, `${field} "${value}" is already taken`);
    }
    throw err;
  }

  if (!updated) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Account details updated successfully"));
});

/* ------------------------------------------------------
   UPDATE AVATAR
------------------------------------------------------ */
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarFile = req.file;
  if (!avatarFile) throw new ApiError(400, "Avatar file is missing");

  const avatar = await uploadOnCloudinary(avatarFile.buffer);
  if (!avatar) throw new ApiError(401, "Error while uploading avatar");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(new ApiResponse(200, user, "Avatar updated"));
});

/* ------------------------------------------------------
   UPDATE COVER IMAGE
------------------------------------------------------ */
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageFile = req.file;
  if (!coverImageFile)
    throw new ApiError(400, "Cover image file is missing");

  const coverImage = await uploadOnCloudinary(coverImageFile.buffer);
  if (!coverImage)
    throw new ApiError(401, "Error while uploading cover image");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { coverImage: coverImage.url } },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(new ApiResponse(200, user, "Cover image updated"));
});

/* ------------------------------------------------------
   GET USER CHANNEL PROFILE
------------------------------------------------------ */
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) throw new ApiError(400, "Username is missing");

  const usernameLower = username.toLowerCase();
  const currentUserId = req.user?._id ? mongoose.Types.ObjectId(req.user._id) : null;

  const channel = await User.aggregate([
    { $match: { username: usernameLower } },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: { $size: "$subscribers" },
        channelsSubscribedToCount: { $size: "$subscribedTo" },
        isSubscribed: {
          $cond: {
            if: currentUserId ? { $in: [currentUserId, "$subscribers.subscriber"] } : false,
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        subscriberCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) throw new ApiError(404, "Channel not found");

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "Channel profile fetched"));
});

/* ------------------------------------------------------
   GET WATCH HISTORY
------------------------------------------------------ */
const getWatchHistory = asyncHandler(async (req, res) => {
  const userAgg = await User.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          { $addFields: { owner: { $first: "$owner" } } },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userAgg[0]?.watchHistory || [],
        "Watch history fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
