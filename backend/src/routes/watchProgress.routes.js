// src/routes/watchProgress.routes.js
import { Router } from "express";
import {
  saveWatchProgress,
  getContinueWatching,
  getVideoProgress,
} from "../controllers/watchProgress.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

router.post("/", saveWatchProgress);
router.get("/continue-watching", getContinueWatching);
router.get("/:videoId", getVideoProgress);

export default router;
