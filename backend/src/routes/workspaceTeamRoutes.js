import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { addTeamsToWorkspace } from "../controllers/workspaceTeamController.js";

const router = express.Router();

router.post(
  "/:workspaceId/teams",
  requireAuth,
  addTeamsToWorkspace
);

export default router;