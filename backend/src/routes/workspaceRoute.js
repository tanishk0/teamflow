import express from "express"
import { createWorkspace, getWorkspaces, renameWorkspace } from "../controllers/workspaceController.js"
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", requireAuth, createWorkspace);
router.get("/", requireAuth, getWorkspaces);
router.patch("/:id", requireAuth, renameWorkspace);
export default router;