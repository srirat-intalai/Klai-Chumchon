import type { Request, Response } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { Prisma } from "@prisma/client";
import type { ReportStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { isRealImage, UPLOAD_DIR } from "../middlewares/upload.js";
import { checkNote, checkReport, checkStatus, field, parseId } from "../validators/reportValidator.js";

// เลือกเฉพาะข้อมูลผู้ใช้ที่ต้องโชว์ (ไม่เอารหัสผ่าน)
const userBrief = { select: { id: true, name: true, role: true } };

// ลบไฟล์รูปเก่า ถ้าลบไม่ได้ก็ช่างมัน ไม่ต้องให้ request พัง
async function removeImage(imageUrl: string | null | undefined) {
  if (!imageUrl || !imageUrl.startsWith("/uploads/")) return;
  try {
    await fs.unlink(path.join(UPLOAD_DIR, path.basename(imageUrl)));
  } catch {
    // ไฟล์อาจถูกลบไปแล้ว
  }
}

// มีไฟล์แนบมา แต่เนื้อไฟล์ไม่ใช่รูปจริง (เช่น เปลี่ยนนามสกุลหลอก) -> ลบทิ้งแล้วตอบ false
async function rejectFakeImage(req: Request): Promise<boolean> {
  if (!req.file) return false;
  if (await isRealImage(req.file.path)) return false;
  await removeImage("/uploads/" + req.file.filename);
  return true;
}

// ประชาชนแก้/ลบได้เฉพาะเรื่องของตัวเองที่ยังรอดำเนินการ เจ้าหน้าที่ลงมือแล้วห้ามแก้
function canCitizenChange(req: Request, report: { reporterId: number; status: ReportStatus }) {
  return report.reporterId === req.user!.id && report.status === "PENDING";
}

// GET /api/reports?search=&status=&categoryId=&reporterId=
export async function getReports(req: Request, res: Response) {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const status = checkStatus(req.query.status);
  const categoryId = parseId(req.query.categoryId);
  const reporterId = parseId(req.query.reporterId);

  const where: Prisma.ReportWhereInput = {};
  if (search !== "") {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status as ReportStatus;
  if (categoryId) where.categoryId = categoryId;
  if (reporterId) where.reporterId = reporterId;

  const reports = await prisma.report.findMany({
    where,
    include: {
      category: true,
      reporter: userBrief,
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
      reporter: userBrief,
      comments: { include: { author: userBrief }, orderBy: { createdAt: "asc" } },
      statusLogs: { include: { changedBy: userBrief }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!report) {
    return res.status(404).json({ success: false, message: `ไม่พบเรื่องที่แจ้งรหัส ${id}` });
  }
  res.json({ success: true, data: report });
}

// POST /api/reports  (multipart/form-data มีรูปหรือไม่มีก็ได้)
export async function createReport(req: Request, res: Response) {
  if (await rejectFakeImage(req)) {
    return res.status(400).json({ success: false, message: "ไฟล์ที่แนบไม่ใช่รูปภาพจริง" });
  }
  const newImage = req.file ? "/uploads/" + req.file.filename : null;

  const result = checkReport(req.body);
  if (result.errors.length > 0) {
    await removeImage(newImage);
    return res.status(400).json({ success: false, message: result.errors[0], errors: result.errors });
  }

  const category = await prisma.category.findUnique({ where: { id: result.data.categoryId } });
  if (!category) {
    await removeImage(newImage);
    return res.status(400).json({ success: false, message: "ไม่พบหมวดหมู่ที่เลือก" });
  }

  // สร้างเรื่องพร้อม log แรกในคำสั่งเดียว (nested create = transaction เดียวกัน)
  let report;
  try {
    report = await prisma.report.create({
      data: {
        ...result.data,
        imageUrl: newImage,
        reporterId: req.user!.id,
        statusLogs: { create: { toStatus: "PENDING", note: "แจ้งเรื่องเข้าระบบ", changedById: req.user!.id } },
      },
      include: { category: true, reporter: userBrief },
    });
  } catch (err) {
    // บันทึกไม่สำเร็จ ลบรูปที่เพิ่งอัปโหลดทิ้ง ไม่ให้ค้างในโฟลเดอร์
    await removeImage(newImage);
    throw err;
  }
  res.status(201).json({ success: true, message: "แจ้งเรื่องเรียบร้อย", data: report });
}

// PUT /api/reports/:id  (เจ้าของตอนยังรอดำเนินการ หรือเจ้าหน้าที่/แอดมิน)
export async function updateReport(req: Request, res: Response) {
  if (await rejectFakeImage(req)) {
    return res.status(400).json({ success: false, message: "ไฟล์ที่แนบไม่ใช่รูปภาพจริง" });
  }
  const newImage = req.file ? "/uploads/" + req.file.filename : null;

  const id = parseId(req.params.id);
  if (!id) {
    await removeImage(newImage);
    return res.status(400).json({ success: false, message: "รหัสเรื่องไม่ถูกต้อง" });
  }

  const old = await prisma.report.findUnique({ where: { id } });
  if (!old) {
    await removeImage(newImage);
    return res.status(404).json({ success: false, message: `ไม่พบเรื่องที่แจ้งรหัส ${id}` });
  }
  if (req.user!.role === "CITIZEN" && !canCitizenChange(req, old)) {
    await removeImage(newImage);
    return res.status(403).json({ success: false, message: "แก้ไขได้เฉพาะเรื่องของคุณที่ยังรอดำเนินการ" });
  }

  const result = checkReport(req.body);
  if (result.errors.length > 0) {
    await removeImage(newImage);
    return res.status(400).json({ success: false, message: result.errors[0], errors: result.errors });
  }

  const category = await prisma.category.findUnique({ where: { id: result.data.categoryId } });
  if (!category) {
    await removeImage(newImage);
    return res.status(400).json({ success: false, message: "ไม่พบหมวดหมู่ที่เลือก" });
  }

  // มีรูปใหม่ = แทนรูปเดิม, ส่ง removeImage=true = ลบรูปทิ้ง, ไม่ส่งอะไร = ใช้รูปเดิม
  let imageUrl = old.imageUrl;
  if (newImage) imageUrl = newImage;
  else if (field(req.body, "removeImage") === "true") imageUrl = null;

  let report;
  try {
    report = await prisma.report.update({
      where: { id },
      data: { ...result.data, imageUrl },
      include: { category: true, reporter: userBrief },
    });
  } catch (err) {
    await removeImage(newImage);
    throw err;
  }

  if (imageUrl !== old.imageUrl) await removeImage(old.imageUrl);
  res.json({ success: true, message: "บันทึกการแก้ไขแล้ว", data: report });
}

// PATCH /api/reports/:id/status  (เจ้าหน้าที่/แอดมิน) เปลี่ยนสถานะ + เก็บ StatusLog
export async function updateReportStatus(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, message: "รหัสเรื่องไม่ถูกต้อง" });
  }

  const status = checkStatus(field(req.body, "status"));
  if (!status) {
    return res.status(400).json({ success: false, message: "สถานะต้องเป็น PENDING, IN_PROGRESS หรือ RESOLVED" });
  }
  const noteCheck = checkNote(field(req.body, "note"));
  if (noteCheck.error) {
    return res.status(400).json({ success: false, message: noteCheck.error });
  }

  const old = await prisma.report.findUnique({ where: { id } });
  if (!old) {
    return res.status(404).json({ success: false, message: `ไม่พบเรื่องที่แจ้งรหัส ${id}` });
  }
  if (old.status === status) {
    return res.status(400).json({ success: false, message: "เรื่องนี้อยู่ในสถานะนี้อยู่แล้ว" });
  }

  // อัปเดตสถานะกับเขียน log ต้องสำเร็จพร้อมกัน (transaction)
  // updateMany ใส่เงื่อนไข status เดิมไว้ด้วย: ถ้าเจ้าหน้าที่อีกคนเปลี่ยนไปก่อนแล้ว จะอัปเดตได้ 0 แถว
  // แบบนี้ fromStatus ใน log จะถูกต้องเสมอ ไม่มีใครทับของใคร
  const changed = await prisma.$transaction(async (tx) => {
    const result = await tx.report.updateMany({
      where: { id, status: old.status },
      data: { status: status as ReportStatus },
    });
    if (result.count === 0) return false;

    await tx.statusLog.create({
      data: {
        reportId: id,
        fromStatus: old.status,
        toStatus: status as ReportStatus,
        note: noteCheck.note,
        changedById: req.user!.id,
      },
    });
    return true;
  });

  if (!changed) {
    return res.status(409).json({ success: false, message: "มีคนเปลี่ยนสถานะเรื่องนี้ไปก่อนแล้ว กรุณาดูสถานะล่าสุดแล้วลองใหม่" });
  }

  const report = await prisma.report.findUnique({ where: { id }, include: { category: true, reporter: userBrief } });
  res.json({ success: true, message: "อัปเดตสถานะแล้ว", data: report });
}

// DELETE /api/reports/:id  (แอดมิน หรือเจ้าของตอนยังรอดำเนินการ)
export async function deleteReport(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, message: "รหัสเรื่องไม่ถูกต้อง" });
  }

  const old = await prisma.report.findUnique({ where: { id } });
  if (!old) {
    return res.status(404).json({ success: false, message: `ไม่พบเรื่องที่แจ้งรหัส ${id}` });
  }
  if (req.user!.role !== "ADMIN" && !canCitizenChange(req, old)) {
    return res.status(403).json({ success: false, message: "ลบได้เฉพาะแอดมิน หรือเจ้าของเรื่องที่ยังรอดำเนินการ" });
  }

  // คอมเมนต์และ StatusLog ถูกลบตาม (onDelete: Cascade)
  await prisma.report.delete({ where: { id } });
  await removeImage(old.imageUrl);
  res.json({ success: true, message: `ลบเรื่อง "${old.title}" แล้ว` });
}
