import { Router } from "express";
import {
  createReport,
  deleteReport,
  getReportById,
  getReports,
  updateReport,
  updateReportStatus,
} from "../controllers/reportController.js";
import { addComment, deleteComment } from "../controllers/commentController.js";
import { getCategories } from "../controllers/categoryController.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { uploadImage } from "../middlewares/upload.js";

const router = Router();

// ดูข้อมูลได้ทุกคนไม่ต้องล็อกอิน
router.get("/categories", getCategories);
router.get("/reports", getReports);
router.get("/reports/:id", getReportById);

// ต้องล็อกอิน (สิทธิ์ละเอียดเช็กต่อใน controller)
router.post("/reports", requireAuth, uploadImage, createReport);
router.put("/reports/:id", requireAuth, uploadImage, updateReport);
router.delete("/reports/:id", requireAuth, deleteReport);
router.patch("/reports/:id/status", requireAuth, requireRole("STAFF", "ADMIN"), updateReportStatus);

router.post("/reports/:id/comments", requireAuth, addComment);
router.delete("/comments/:id", requireAuth, deleteComment);

export default router;
