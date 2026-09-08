import express from "express";
import { logout, signin , signup, getMe } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js"

const router = express.Router();

router.post("/register" , signup);
router.post("/login" , signin);
router.get("/me" , requireAuth, getMe);
router.post("/logout", logout);
export default router;