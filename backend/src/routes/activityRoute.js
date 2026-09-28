import express from "express";
import {
  getActivityLogs,
  getActivityStats,
  getUserActivityFeed,
} from "../controllers/activityController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.get("/feed", requireAuth, getUserActivityFeed);
router.get("/:workspaceId/stats", requireAuth, getActivityStats);
router.get("/:workspaceId", requireAuth, getActivityLogs);
router.get("/workspace/:workspaceId", requireAuth, getActivityLogs);
router.get("/", requireAuth, getActivityLogs);

export default router;
