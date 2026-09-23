import express from "express"
import { createTeam, renameTeam, deleteTeam, getTeams, removeMember, getTeam } from "../controllers/teamController.js"
import { requireAuth } from "../middleware/authMiddleware.js"
import { isOwner } from "../middleware/isOwner.js";
import Team from "../db/Team.js";

const router = express.Router();

router.post('/', requireAuth, createTeam);
router.get('/', requireAuth, getTeams);
router.patch('/:id', requireAuth, isOwner(Team, "ownerId"), renameTeam);
router.delete('/:id', requireAuth, isOwner(Team, "ownerId"),deleteTeam);
router.delete('/:id/members', requireAuth, isOwner(Team, "ownerId"), removeMember);
router.get("/:id", requireAuth, getTeam);

export default router;