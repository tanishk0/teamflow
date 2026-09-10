import express from "express"
import { createTeam, renameTeam, deleteTeam, getTeams, removeMember } from "../controllers/teamController.js"
import { requireAuth } from "../middleware/authMiddleware.js"

const router = express.Router();

router.post('/', requireAuth, createTeam);
router.get('/', requireAuth, getTeams);
router.patch('/:id', requireAuth, renameTeam);
router.delete('/:id', requireAuth, deleteTeam);
router.delete('/:id/members', requireAuth, removeMember);

export default router;