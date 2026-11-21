import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const SECRET = process.env.JWT_SECRET || "";
if (SECRET === "") {
  throw new Error("ไม่พบ JWT_SECRET ในไฟล์ .env");
}

// สร้าง JWT ใส่ id ผู้ใช้ หมดอายุตามที่ตั้งใน .env
export function signToken(userId: number): string {
  return jwt.sign({ sub: String(userId) }, SECRET, { expiresIn: "7d" });
}

// ต้องล็อกอิน: อ่าน token จาก header "Authorization: Bearer xxx"
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "กรุณาเข้าสู่ระบบก่อน" });
  }

  let userId = 0;
  try {
    const payload = jwt.verify(header.slice(7), SECRET);
    if (typeof payload === "string" || !payload.sub) throw new Error("bad token");
    userId = Number(payload.sub);
  } catch {
    return res.status(401).json({ success: false, message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" });
  }

  // ดึง role ล่าสุดจากฐานข้อมูล เผื่อแอดมินเพิ่งเปลี่ยน role
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  if (!user) {
    return res.status(401).json({ success: false, message: "ไม่พบผู้ใช้นี้แล้ว" });
  }

  req.user = user;
  next();
}

// ต้องเป็น role ที่กำหนด (ใช้ต่อจาก requireAuth)
export function requireRole(...roles: Role[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์ทำรายการนี้" });
    }
    next();
  };
}
