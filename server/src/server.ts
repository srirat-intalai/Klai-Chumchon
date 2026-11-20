import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import { UPLOAD_DIR } from "./middlewares/upload.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: "100kb" }));

// เปิดให้หน้าบ้านโหลดรูปที่อัปโหลดได้ที่ /uploads/ชื่อไฟล์
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "7d" }));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Klai Chumchon API ทำงานปกติ", timestamp: new Date().toISOString() });
});

app.use("/api", authRoutes);
app.use("/api", reportRoutes);

// ต้องอยู่ท้ายสุดเสมอ
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Klai Chumchon API: http://localhost:${PORT}`);
});
