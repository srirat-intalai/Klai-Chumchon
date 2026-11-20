import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { checkComment, parseId } from "../validators/reportValidator.js";

// POST /api/reports/:id/comments
export async function addComment(req: Request, res: Response) {
  const reportId = parseId(req.params.id);
  if (!reportId) {
    return res.status(400).json({ success: false, message: "รหัสเรื่องไม่ถูกต้อง" });
  }

  const result = checkComment(req.body);
  if (result.errors.length > 0) {
    return res.status(400).json({ success: false, message: result.errors[0], errors: result.errors });
  }

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) {
    return res.status(404).json({ success: false, message: "ไม่พบเรื่องที่จะแสดงความคิดเห็น" });
  }

  const comment = await prisma.comment.create({
    data: { ...result.data, reportId },
  });
  res.status(201).json({ success: true, message: "ส่งความคิดเห็นแล้ว", data: comment });
}

// DELETE /api/comments/:id
export async function deleteComment(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, message: "รหัสความคิดเห็นไม่ถูกต้อง" });
  }

  const old = await prisma.comment.findUnique({ where: { id } });
  if (!old) {
    return res.status(404).json({ success: false, message: "ไม่พบความคิดเห็นนี้" });
  }

  await prisma.comment.delete({ where: { id } });
  res.json({ success: true, message: "ลบความคิดเห็นแล้ว" });
}
