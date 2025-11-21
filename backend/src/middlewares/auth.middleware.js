import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

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
        const options = {
          httpOnly: true,
          secure: true,
          sameSite: "None",
        };
        res.cookie("accessToken", accessToken, options);
        res.cookie("refreshToken", newRefreshToken, options);

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
