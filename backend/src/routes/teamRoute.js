import express from "express"
import { createTeam, renameTeam, deleteTeam, getTeams, removeMember, getTeam } from "../controllers/teamController.js"
import { requireAuth } from "../middleware/authMiddleware.js"

const router = express.Router();

router.post('/', requireAuth, createTeam);
router.get('/', requireAuth, getTeams);
router.patch('/:id', requireAuth, renameTeam);
router.delete('/:id', requireAuth, deleteTeam);
router.delete('/:id/members', requireAuth, removeMember);
router.get("/:id", requireAuth, getTeam);

export default router;