import express from "express";
import { login, refresh, logout, me } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/auth.js";
const router = express.Router();
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);

export default router;
