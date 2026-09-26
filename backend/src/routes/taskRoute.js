import express from "express";
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

// Explicit project-based routes
router.post("/project/:projectId", requireAuth, createTask);
router.get("/project/:projectId", requireAuth, getTasks);

// Root routes (used for direct /api/tasks or nested /api/projects/:projectId/tasks)
router.post("/", requireAuth, createTask);
router.get("/", requireAuth, getTasks);
router.get("/:taskId", requireAuth, getTask);
router.patch("/:taskId", requireAuth, updateTask);
router.delete("/:taskId", requireAuth, deleteTask);

export default router;
