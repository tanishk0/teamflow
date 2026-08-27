import express from "express"
import { createWorkspace, getWorkspaces } from "../controllers/workspaceController.js"
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", requireAuth, createWorkspace);
router.get("/", requireAuth, getWorkspaces);

export default router;