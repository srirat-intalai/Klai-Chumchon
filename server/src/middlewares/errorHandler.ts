import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";

// ไม่เจอ path
export function notFound(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `ไม่พบ ${req.method} ${req.originalUrl}` });
}

// Express 5 ส่ง error จาก async controller มาที่นี่ให้เอง
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // JSON ที่ส่งมาพัง
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ success: false, message: "รูปแบบ JSON ไม่ถูกต้อง" });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, message: "ข้อมูลนี้มีอยู่แล้ว" });
    }
    if (err.code === "P2003") {
      return res.status(400).json({ success: false, message: "ข้อมูลที่อ้างถึงไม่มีอยู่จริง" });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "ไม่พบข้อมูลที่ต้องการ" });
    }
  }

  console.error(err);
  res.status(500).json({ success: false, message: "เซิร์ฟเวอร์มีปัญหา ลองใหม่อีกครั้ง" });
}
