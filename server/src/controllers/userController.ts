import type { Request, Response } from "express";
import type { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { checkRole, parseId } from "../validators/reportValidator.js";

// GET /api/users  (แอดมิน)
export async function getUsers(_req: Request, res: Response) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: { select: { reports: true, comments: true } },
    },
    orderBy: { id: "asc" },
  });
  res.json({ success: true, data: users });
}

// PATCH /api/users/:id/role  (แอดมิน)
export async function updateUserRole(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, message: "รหัสผู้ใช้ไม่ถูกต้อง" });
  }
  const role = checkRole(req.body?.role);
  if (!role) {
    return res.status(400).json({ success: false, message: "role ต้องเป็น CITIZEN, STAFF หรือ ADMIN" });
  }
  // กันแอดมินลด role ตัวเองจนไม่มีใครเข้าหน้าจัดการได้
  if (id === req.user!.id) {
    return res.status(400).json({ success: false, message: "ไม่สามารถเปลี่ยน role ของตัวเองได้" });
  }

  const old = await prisma.user.findUnique({ where: { id } });
  if (!old) {
    return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้นี้" });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role: role as Role },
    select: { id: true, name: true, email: true, role: true },
  });
  res.json({ success: true, message: `เปลี่ยน role ของ ${user.name} แล้ว`, data: user });
}
