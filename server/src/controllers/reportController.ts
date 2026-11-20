import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { checkReport, checkStatus, parseId } from "../validators/reportValidator.js";

// GET /api/reports?search=&status=&categoryId=
export async function getReports(req: Request, res: Response) {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const status = checkStatus(req.query.status);
  const categoryId = parseId(req.query.categoryId);

  const where: Prisma.ReportWhereInput = {};
  if (search !== "") {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status as Prisma.ReportWhereInput["status"];
  if (categoryId) where.categoryId = categoryId;

  const reports = await prisma.report.findMany({
    where,
    include: {
      category: true,
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, count: reports.length, data: reports });
}

// GET /api/reports/:id
export async function getReportById(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, message: "รหัสเรื่องไม่ถูกต้อง" });
  }

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      category: true,
      comments: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!report) {
    return res.status(404).json({ success: false, message: `ไม่พบเรื่องที่แจ้งรหัส ${id}` });
  }
  res.json({ success: true, data: report });
}

// POST /api/reports
export async function createReport(req: Request, res: Response) {
  const result = checkReport(req.body);
  if (result.errors.length > 0) {
    return res.status(400).json({ success: false, message: result.errors[0], errors: result.errors });
  }

  const category = await prisma.category.findUnique({ where: { id: result.data.categoryId } });
  if (!category) {
    return res.status(400).json({ success: false, message: "ไม่พบหมวดหมู่ที่เลือก" });
  }

  const report = await prisma.report.create({
    data: result.data,
    include: { category: true },
  });
  res.status(201).json({ success: true, message: "แจ้งเรื่องเรียบร้อย", data: report });
}

// PUT /api/reports/:id  (แก้ทั้งก้อน)
export async function updateReport(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, message: "รหัสเรื่องไม่ถูกต้อง" });
  }

  const result = checkReport(req.body);
  if (result.errors.length > 0) {
    return res.status(400).json({ success: false, message: result.errors[0], errors: result.errors });
  }

  const old = await prisma.report.findUnique({ where: { id } });
  if (!old) {
    return res.status(404).json({ success: false, message: `ไม่พบเรื่องที่แจ้งรหัส ${id}` });
  }

  const category = await prisma.category.findUnique({ where: { id: result.data.categoryId } });
  if (!category) {
    return res.status(400).json({ success: false, message: "ไม่พบหมวดหมู่ที่เลือก" });
  }

  const report = await prisma.report.update({
    where: { id },
    data: result.data,
    include: { category: true },
  });
  res.json({ success: true, message: "บันทึกการแก้ไขแล้ว", data: report });
}

// PATCH /api/reports/:id/status  (เจ้าหน้าที่เปลี่ยนสถานะอย่างเดียว)
export async function updateReportStatus(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, message: "รหัสเรื่องไม่ถูกต้อง" });
  }

  const status = checkStatus(req.body?.status);
  if (!status) {
    return res.status(400).json({ success: false, message: "สถานะต้องเป็น PENDING, IN_PROGRESS หรือ RESOLVED" });
  }

  const old = await prisma.report.findUnique({ where: { id } });
  if (!old) {
    return res.status(404).json({ success: false, message: `ไม่พบเรื่องที่แจ้งรหัส ${id}` });
  }

  const report = await prisma.report.update({
    where: { id },
    data: { status: status as Prisma.ReportUpdateInput["status"] },
    include: { category: true },
  });
  res.json({ success: true, message: "อัปเดตสถานะแล้ว", data: report });
}

// DELETE /api/reports/:id
export async function deleteReport(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, message: "รหัสเรื่องไม่ถูกต้อง" });
  }

  const old = await prisma.report.findUnique({ where: { id } });
  if (!old) {
    return res.status(404).json({ success: false, message: `ไม่พบเรื่องที่แจ้งรหัส ${id}` });
  }

  // คอมเมนต์ถูกลบตาม (onDelete: Cascade)
  await prisma.report.delete({ where: { id } });
  res.json({ success: true, message: `ลบเรื่อง "${old.title}" แล้ว` });
}
