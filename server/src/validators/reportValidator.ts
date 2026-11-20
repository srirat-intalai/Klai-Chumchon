import type { CommentInput, ReportInput } from "../types.js";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const STATUSES = ["PENDING", "IN_PROGRESS", "RESOLVED"];

function readText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

// ผลตรวจ: ถ้า errors ว่างแปลว่าผ่าน
interface ReportCheck {
  errors: string[];
  data: ReportInput;
}

export function checkReport(body: unknown): ReportCheck {
  const errors: string[] = [];
  const raw = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;

  const title = readText(raw.title);
  const description = readText(raw.description);
  const location = readText(raw.location);
  const reporterName = readText(raw.reporterName);
  const phone = readText(raw.phone);
  const imageUrl = readText(raw.imageUrl);
  const priority = readText(raw.priority) || "MEDIUM";
  const status = readText(raw.status) || "PENDING";
  const categoryId = Number(raw.categoryId);

  if (title.length < 5 || title.length > 120) {
    errors.push("หัวข้อต้องยาว 5-120 ตัวอักษร");
  }
  if (description.length < 10 || description.length > 2000) {
    errors.push("รายละเอียดต้องยาว 10-2000 ตัวอักษร");
  }
  if (location.length < 3 || location.length > 200) {
    errors.push("กรุณาระบุสถานที่ (3-200 ตัวอักษร)");
  }
  if (reporterName.length < 2 || reporterName.length > 100) {
    errors.push("ชื่อผู้แจ้งต้องยาว 2-100 ตัวอักษร");
  }
  // เบอร์ไม่บังคับ แต่ถ้ากรอกต้องเป็นเบอร์ไทย 9-10 หลัก
  if (phone !== "" && !/^0\d{8,9}$/.test(phone.replace(/-/g, ""))) {
    errors.push("เบอร์โทรไม่ถูกต้อง (เช่น 0812345678)");
  }
  if (imageUrl !== "" && !/^https?:\/\/\S+$/.test(imageUrl)) {
    errors.push("ลิงก์รูปต้องขึ้นต้นด้วย http:// หรือ https://");
  }
  if (!PRIORITIES.includes(priority)) {
    errors.push("ระดับความเร่งด่วนไม่ถูกต้อง");
  }
  if (!STATUSES.includes(status)) {
    errors.push("สถานะไม่ถูกต้อง");
  }
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    errors.push("กรุณาเลือกหมวดหมู่");
  }

  return {
    errors: errors,
    data: {
      title,
      description,
      location,
      reporterName,
      phone: phone === "" ? null : phone,
      imageUrl: imageUrl === "" ? null : imageUrl,
      priority: priority as ReportInput["priority"],
      status: status as ReportInput["status"],
      categoryId,
    },
  };
}

export function checkStatus(value: unknown): string | null {
  const status = readText(value);
  if (STATUSES.includes(status)) return status;
  return null;
}

export function checkComment(body: unknown): { errors: string[]; data: CommentInput } {
  const errors: string[] = [];
  const raw = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  const authorName = readText(raw.authorName);
  const message = readText(raw.message);

  if (authorName.length < 2 || authorName.length > 100) {
    errors.push("ชื่อผู้แสดงความเห็นต้องยาว 2-100 ตัวอักษร");
  }
  if (message.length < 1 || message.length > 1000) {
    errors.push("ความคิดเห็นต้องยาว 1-1000 ตัวอักษร");
  }

  return { errors, data: { authorName, message } };
}

// แปลง :id จาก url เป็นเลข ถ้าไม่ใช่เลขบวกคืน null
export function parseId(value: unknown): number | null {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}
