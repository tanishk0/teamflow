import express from "express";

import {
  createProject,
  getProjects,
  getProject,
  renameProject,
  deleteProject,
} from "../controllers/projectController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:workspaceId/projects", requireAuth, createProject);
router.get("/:workspaceId/projects", requireAuth, getProjects);
router.get("/:workspaceId/projects/:projectId", requireAuth, getProject);
router.patch("/:workspaceId/projects/:projectId", requireAuth, renameProject);
router.delete("/:workspaceId/projects/:projectId", requireAuth, deleteProject);

export default router;