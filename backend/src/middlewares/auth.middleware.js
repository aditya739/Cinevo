import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { COOKIE_OPTIONS } from "../constants.js";

/**
 * Middleware: Verify JWT access token
 * - Looks for token in cookies (accessToken) or Authorization header (Bearer)
 * - Verifies signature using ACCESS_TOKEN_SECRET
 * - Attaches user (without password/refreshToken) to req.user
 */
export const verifyJWT = asyncHandler(async (req, res, next) => {
  // Try cookies first, then Authorization header
  const rawAuthHeader =
    req.header("Authorization") || req.header("authorization");

  const token =
    req.cookies?.accessToken ||
    (rawAuthHeader?.startsWith("Bearer ")
      ? rawAuthHeader.replace("Bearer ", "")
      : null);

  if (!token) {
    // If no access token, check for refresh token before failing
    if (req.cookies?.refreshToken) {
      try {
        const refreshToken = req.cookies.refreshToken;
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        
        const user = await User.findById(decodedRefresh._id);
        if (!user || user.refreshToken !== refreshToken) {
          throw new ApiError(401, "Invalid refresh token");
        }

        // Generate new tokens
        const accessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();
        
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        // Set new cookies
        res.cookie("accessToken", accessToken, COOKIE_OPTIONS);
        res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

        // Attach user to request and proceed
        req.user = await User.findById(user._id).select("-password -refreshToken");
        return next();
      } catch (refreshErr) {
        throw new ApiError(401, "Unauthorized: Access token missing and refresh failed");
      }
    }
    throw new ApiError(401, "Unauthorized: Access token missing");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // Try to refresh the token
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        throw new ApiError(401, "Access token expired and no refresh token");
      }

      try {
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedRefresh._id);
        if (!user || user.refreshToken !== refreshToken) {
          throw new ApiError(401, "Invalid refresh token");
        }

        // Generate new tokens
        const accessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        // Set new cookies
        res.cookie("accessToken", accessToken, COOKIE_OPTIONS);
        res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

        // Decode the new access token
        decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      } catch (refreshErr) {
        throw new ApiError(401, "Access token expired and refresh failed");
      }
    } else {
      throw new ApiError(401, "Invalid access token");
    }
  }

  const user = await User.findById(decodedToken?._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(401, "Invalid access token: user not found");
  }

  // attach safe user object to request
  req.user = user;

  // Debugging only (safe to remove in prod)
  if (process.env.NODE_ENV !== "production") {
    console.log(`✅ Authenticated user: ${user.username} (${user._id})`);
  }

  next();
});
