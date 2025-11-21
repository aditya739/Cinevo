// src/middlewares/admin.middleware.js
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized - Please login first");
  }

  if (req.user.role !== "admin") {
    throw new ApiError(403, "Forbidden - Admin access required");
  }

  if (req.user.isBanned) {
    throw new ApiError(403, "Your account has been banned");
  }

  next();
});
