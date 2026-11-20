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

const router = Router();

router.get("/categories", getCategories);

router.get("/reports", getReports);
router.get("/reports/:id", getReportById);
router.post("/reports", createReport);
router.put("/reports/:id", updateReport);
router.patch("/reports/:id/status", updateReportStatus);
router.delete("/reports/:id", deleteReport);

router.post("/reports/:id/comments", addComment);
router.delete("/comments/:id", deleteComment);

export default router;
