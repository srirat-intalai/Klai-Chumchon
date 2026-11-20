import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../middlewares/auth.js";
import { checkLogin, checkRegister } from "../validators/reportValidator.js";
import { clearFails, minutesLocked, recordFail } from "../middlewares/loginLimiter.js";

// ห้ามส่ง passwordHash กลับไปหน้าบ้านเด็ดขาด
const publicUser = { id: true, name: true, email: true, phone: true, role: true, createdAt: true } as const;

// POST /api/auth/register  สมัครได้แค่ role ประชาชน
export async function register(req: Request, res: Response) {
  const result = checkRegister(req.body);
  if (result.errors.length > 0) {
    return res.status(400).json({ success: false, message: result.errors[0], errors: result.errors });
  }

  const exists = await prisma.user.findUnique({ where: { email: result.data.email } });
  if (exists) {
    return res.status(409).json({ success: false, message: "อีเมลนี้ถูกใช้สมัครแล้ว" });
  }

  const passwordHash = await bcrypt.hash(result.data.password, 10);
  const user = await prisma.user.create({
    data: { name: result.data.name, email: result.data.email, phone: result.data.phone, passwordHash },
    select: publicUser,
  });

  res.status(201).json({ success: true, message: "สมัครสมาชิกเรียบร้อย", data: { token: signToken(user.id), user } });
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  const result = checkLogin(req.body);
  if (result.error) {
    return res.status(400).json({ success: false, message: result.error });
  }

  const ip = req.ip || "unknown";
  const email = result.data.email;

  // ผิดเกิน 5 ครั้งใน 15 นาที ให้รอก่อน กันการสุ่มเดารหัสผ่าน
  const wait = minutesLocked(ip, email);
  if (wait > 0) {
    return res.status(429).json({ success: false, message: `ลองผิดหลายครั้งเกินไป กรุณารออีก ${wait} นาที` });
  }

  const found = await prisma.user.findUnique({ where: { email } });
  // ตอบข้อความเดียวกันทั้งกรณีไม่มีอีเมล/รหัสผิด จะได้เดาไม่ได้ว่าอีเมลไหนมีในระบบ
  if (!found || !(await bcrypt.compare(result.data.password, found.passwordHash))) {
    recordFail(ip, email);
    return res.status(401).json({ success: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
  }

  clearFails(ip, email);

  const user = { id: found.id, name: found.name, email: found.email, phone: found.phone, role: found.role, createdAt: found.createdAt };
  res.json({ success: true, message: "เข้าสู่ระบบแล้ว", data: { token: signToken(found.id), user } });
}

// GET /api/auth/me
export async function getMe(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: publicUser });
  if (!user) {
    return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });
  }
  res.json({ success: true, data: user });
}
