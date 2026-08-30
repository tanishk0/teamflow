import express from "express"
import {getInvites ,createInvite , acceptInvite, rejectInvite} from "../controllers/invitationController.js"
import { requireAuth } from "../middleware/authMiddleware.js"

const router = express.Router();

router.post('/', requireAuth, createInvite);
router.patch('/', requireAuth, acceptInvite);
router.patch('/', requireAuth, rejectInvite);
router.get('/', requireAuth, getInvites);

export default router;