import express from "express"
import { createWorkspace, deleteWorkspace, getWorkspaces, renameWorkspace } from "../controllers/workspaceController.js"
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  createInvite,
  getWorkspaceInvites,
} from "../controllers/invitationController.js";
import { isOwner } from "../middleware/isOwner.js";
import Workspace from "../db/Workspace.js";

const router = express.Router();

router.post("/", requireAuth, createWorkspace);
router.get("/", requireAuth, getWorkspaces);
router.patch("/:id", requireAuth, isOwner(Workspace, "owner"), renameWorkspace);
router.delete("/:id", requireAuth, isOwner(Workspace, "owner"), deleteWorkspace);

//Workspace Invitation routes
router.post("/:workspaceId/invitations", requireAuth, createInvite);
router.get("/:workspaceId/invitations", requireAuth, getWorkspaceInvites);
export default router;