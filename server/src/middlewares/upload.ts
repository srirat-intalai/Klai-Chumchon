import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";

export const UPLOAD_DIR = path.resolve("uploads");

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  // ตั้งชื่อไฟล์ใหม่แบบสุ่ม กันชื่อซ้ำและกันชื่อแปลกๆ จากผู้ใช้
  filename: function (_req, file, cb) {
    const ext = file.mimetype === "image/png" ? ".png" : file.mimetype === "image/webp" ? ".webp" : ".jpg";
    cb(null, Date.now() + "-" + crypto.randomBytes(6).toString("hex") + ext);
  },
});

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (_req, file, cb) {
    if (ALLOWED.includes(file.mimetype)) cb(null, true);
    else cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"));
  },
}).single("image");
