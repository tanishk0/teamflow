import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { checkUserExists } from "../controllers/userController.js";

const router = express.Router();

router.get("/exists", requireAuth, checkUserExists);

export default router;