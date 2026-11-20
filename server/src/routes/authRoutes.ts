import { Router } from "express";
import { getMe, login, register } from "../controllers/authController.js";
import { getUsers, updateUserRole } from "../controllers/userController.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", requireAuth, getMe);

// จัดการผู้ใช้ เฉพาะแอดมิน
router.get("/users", requireAuth, requireRole("ADMIN"), getUsers);
router.patch("/users/:id/role", requireAuth, requireRole("ADMIN"), updateUserRole);

export default router;
