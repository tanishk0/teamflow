import express from "express"
import {getInvites ,createInvite , acceptInvite, rejectInvite} from "../controllers/invitationController.js"
import { requireAuth } from "../middleware/authMiddleware.js"

const router = express.Router();

router.get("/", requireAuth, getInvites);

router.patch("/:id/accept", requireAuth, acceptInvite);

router.patch("/:id/reject", requireAuth, rejectInvite);

export default router;