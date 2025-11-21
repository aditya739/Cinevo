// src/routes/admin.routes.js
import { Router } from "express";
import {
  deleteAnyVideo,
  deleteComment,
  toggleBanUser,
  getAnalytics,
  getReportedVideos,
  getAllUsers,
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// All routes require authentication and admin role
router.use(verifyJWT);
router.use(verifyAdmin);

// Video management
router.delete("/videos/:videoId", deleteAnyVideo);

// Comment management
router.delete("/comments/:commentId", deleteComment);

// User management
router.patch("/users/:userId/ban", toggleBanUser);
router.get("/users", getAllUsers);

// Analytics
router.get("/analytics", getAnalytics);

// Reports
router.get("/reports", getReportedVideos);

export default router;
