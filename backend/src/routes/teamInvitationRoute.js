import express from "express";

import {
  createTeamInvite,
  getTeamInvites,
  acceptTeamInvite,
  rejectTeamInvite,
} from "../controllers/teamInvitationController.js";

import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:teamId", requireAuth, createTeamInvite);

router.get("/", requireAuth, getTeamInvites);

router.patch("/:id/accept", requireAuth, acceptTeamInvite);

router.patch("/:id/reject", requireAuth, rejectTeamInvite);

export default router;