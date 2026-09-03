import express from "express"
import { createWorkspace, deleteWorkspace, getWorkspaces, renameWorkspace } from "../controllers/workspaceController.js"
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  createInvite,
  getWorkspaceInvites,
} from "../controllers/invitationController.js";

const router = express.Router();

router.post("/", requireAuth, createWorkspace);
router.get("/", requireAuth, getWorkspaces);
router.patch("/:id", requireAuth, renameWorkspace);
router.delete("/:id", requireAuth, deleteWorkspace);

//Workspace Invitation routes
router.post("/:workspaceId/invitations", requireAuth, createInvite);
router.get("/:workspaceId/invitations", requireAuth, getWorkspaceInvites);
export default router;