import express from "express";
import { logout, signin , signup } from "../controllers/authController.js";

const router = express.Router();

router.post("/register" , signup);
router.post("/login" , signin);
router.post("/logout", logout);

export default router;