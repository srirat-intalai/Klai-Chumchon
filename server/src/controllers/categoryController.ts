import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/categories  พร้อมนับว่าแต่ละหมวดมีกี่เรื่อง
export async function getCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { reports: true } } },
    orderBy: { id: "asc" },
  });
  res.json({ success: true, data: categories });
}
