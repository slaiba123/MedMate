import express from "express";
import { register, login, refresh, logout, me ,updatePassword} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register); 
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);
router.put("/update-password", authMiddleware, updatePassword);
export default router;