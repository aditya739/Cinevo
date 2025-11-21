// src/routes/video.routes.js
import { Router } from "express";
import {
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
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public routes (no auth required)
router.get("/", getAllVideos);
router.get("/:videoId", getVideoById);
router.get("/recommendations/:videoId", getRecommendations);
router.get("/shorts/feed", getShortsFeed);
router.get("/users/:userId/profile", getUserProfile);

// Protected routes (auth required)
router.post("/", verifyJWT, upload.fields([
  { name: "videoFile", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 }
]), publishAVideo);

router.delete("/:videoId", verifyJWT, deleteVideo);
router.patch("/:videoId", verifyJWT, upload.single("thumbnail"), updateVideo);

router.patch("/toggle/publish/:videoId", verifyJWT, togglePublishStatus);
router.post("/:videoId/react", verifyJWT, reactToVideo);

export default router;
