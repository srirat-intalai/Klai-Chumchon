import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("ไม่พบ DATABASE_URL ในไฟล์ .env (ก๊อป .env.example ไปแก้ก่อน)");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// ใช้ตัวเดียวทั้งโปรเจกต์
export const prisma = new PrismaClient({ adapter });
