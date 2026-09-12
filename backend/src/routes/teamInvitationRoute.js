import express from "express";

import {
  createTeamInvite,
  getTeamInvites,
  acceptTeamInvite,
  rejectTeamInvite,
  getUserInvites
} from "../controllers/teamInvitationController.js";

import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:teamId", requireAuth, createTeamInvite);

router.get("/:teamId/invitations", requireAuth, getTeamInvites);

router.patch("/:id/accept", requireAuth, acceptTeamInvite);

router.patch("/:id/reject", requireAuth, rejectTeamInvite);

router.get("/", requireAuth, getUserInvites);

export default router;