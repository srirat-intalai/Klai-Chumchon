import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs/promises";
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

// เช็กเนื้อไฟล์จริง ไม่เชื่อแค่ชนิดไฟล์ที่ browser บอกมา
// ไฟล์รูปแต่ละแบบจะขึ้นต้นด้วยไบต์เฉพาะตัว (magic bytes) เช่น PNG ขึ้นต้นด้วย 89 50 4E 47
export async function isRealImage(filePath: string): Promise<boolean> {
  const file = await fs.open(filePath, "r");
  const head = Buffer.alloc(12);
  try {
    await file.read(head, 0, 12, 0);
  } finally {
    await file.close();
  }

  const isJpg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  const isPng = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
  // WEBP = "RIFF" ????(ขนาด) "WEBP"
  const isWebp = head.toString("ascii", 0, 4) === "RIFF" && head.toString("ascii", 8, 12) === "WEBP";
  return isJpg || isPng || isWebp;
}
