import express from "express";

import {
  createTeamInvite,
  getTeamInvites,
  acceptTeamInvite,
  rejectTeamInvite,
  getUserInvites
} from "../controllers/teamInvitationController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { isOwner } from "../middleware/isOwner.js";
import Team from "../db/Team.js";
const router = express.Router();

router.post("/:teamId",
  requireAuth,
  isOwner(Team, "ownerId", "teamId"),
  createTeamInvite
);

router.get(
  "/:teamId/invitations",
  requireAuth,
  isOwner(Team, "ownerId", "teamId"),
  getTeamInvites
);

router.patch("/:id/accept", requireAuth, acceptTeamInvite);

router.patch("/:id/reject", requireAuth, rejectTeamInvite);

router.get("/", requireAuth, getUserInvites);

export default router;