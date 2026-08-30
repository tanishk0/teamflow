import express from "express"
import {getInvites ,createInvite , acceptInvite, rejectInvite} from "../controllers/invitationController.js"
import { requireAuth } from "../middleware/authMiddleware.js"

const router = express.Router();

router.post("/workspaces/:workspaceId", requireAuth, createInvite);

router.patch("/:id/accept", requireAuth, acceptInvite);

router.patch("/:id/reject", requireAuth, rejectInvite);

router.get("/", requireAuth, getInvites);

export default router;