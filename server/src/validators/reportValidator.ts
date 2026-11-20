import type { LoginInput, RegisterInput, ReportInput } from "../types.js";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const STATUSES = ["PENDING", "IN_PROGRESS", "RESOLVED"];
const ROLES = ["CITIZEN", "STAFF", "ADMIN"];

// body อาจมาเป็น JSON หรือ multipart (ค่าเป็น string หมด) เลยแปลงเองทุกช่อง
function toRecord(body: unknown): Record<string, unknown> {
  if (typeof body === "object" && body !== null) return body as Record<string, unknown>;
  return {};
}

// ดึงค่าจาก req.body แบบปลอดภัย (Express ไม่ได้กำหนดชนิดของ req.body เลยไม่แตะตรง ๆ)
export function field(body: unknown, key: string): unknown {
  return toRecord(body)[key];
}

// ช่องว่าง/ไม่ส่งมา ต้องถือว่า "ไม่มีค่า" เพราะ Number("") ได้ 0 ซึ่งดันเป็นพิกัดที่ถูกต้อง
function readNumber(value: unknown): number {
  if (value === undefined || value === null || value === "") return NaN;
  return Number(value);
}

function readText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function checkReport(body: unknown): { errors: string[]; data: ReportInput } {
  const errors: string[] = [];
  const raw = toRecord(body);

  const title = readText(raw.title);
  const description = readText(raw.description);
  const location = readText(raw.location);
  const address = readText(raw.address);
  const priority = readText(raw.priority) || "MEDIUM";
  const categoryId = parseId(raw.categoryId);
  const latitude = readNumber(raw.latitude);
  const longitude = readNumber(raw.longitude);

  if (title.length < 5 || title.length > 120) {
    errors.push("หัวข้อต้องยาว 5-120 ตัวอักษร");
  }
  if (description.length < 10 || description.length > 2000) {
    errors.push("รายละเอียดต้องยาว 10-2000 ตัวอักษร");
  }
  if (location.length < 3 || location.length > 200) {
    errors.push("กรุณาระบุจุดสังเกต (3-200 ตัวอักษร)");
  }
  if (address.length > 300) {
    errors.push("ที่อยู่ยาวเกิน 300 ตัวอักษร");
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    errors.push("กรุณาปักหมุดตำแหน่งบนแผนที่");
  } else if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    errors.push("พิกัดไม่ถูกต้อง");
  }
  if (!PRIORITIES.includes(priority)) {
    errors.push("ระดับความเร่งด่วนไม่ถูกต้อง");
  }
  if (categoryId === null) {
    errors.push("กรุณาเลือกหมวดหมู่");
  }

  return {
    errors,
    data: {
      title,
      description,
      location,
      address: address === "" ? null : address,
      latitude,
      longitude,
      priority: priority as ReportInput["priority"],
      categoryId: categoryId ?? 0,
    },
  };
}

export function checkStatus(value: unknown): string | null {
  const status = readText(value);
  if (STATUSES.includes(status)) return status;
  return null;
}

export function checkRole(value: unknown): string | null {
  const role = readText(value);
  if (ROLES.includes(role)) return role;
  return null;
}

export function checkNote(value: unknown): { error: string | null; note: string | null } {
  const note = readText(value);
  if (note.length > 500) return { error: "หมายเหตุยาวเกิน 500 ตัวอักษร", note: null };
  return { error: null, note: note === "" ? null : note };
}

export function checkComment(body: unknown): { error: string | null; message: string } {
  const message = readText(toRecord(body).message);
  if (message.length < 1 || message.length > 1000) {
    return { error: "ความคิดเห็นต้องยาว 1-1000 ตัวอักษร", message };
  }
  return { error: null, message };
}

export function checkRegister(body: unknown): { errors: string[]; data: RegisterInput } {
  const errors: string[] = [];
  const raw = toRecord(body);
  const name = readText(raw.name);
  const email = readText(raw.email).toLowerCase();
  const password = typeof raw.password === "string" ? raw.password : "";
  const phone = readText(raw.phone).replace(/-/g, "");

  if (name.length < 2 || name.length > 100) errors.push("ชื่อต้องยาว 2-100 ตัวอักษร");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 150) errors.push("อีเมลไม่ถูกต้อง");
  if (password.length < 8 || password.length > 72) errors.push("รหัสผ่านต้องยาว 8-72 ตัวอักษร");
  if (phone !== "" && !/^0\d{8,9}$/.test(phone)) errors.push("เบอร์โทรไม่ถูกต้อง (เช่น 0812345678)");

  return { errors, data: { name, email, password, phone: phone === "" ? null : phone } };
}

export function checkLogin(body: unknown): { error: string | null; data: LoginInput } {
  const raw = toRecord(body);
  const email = readText(raw.email).toLowerCase();
  const password = typeof raw.password === "string" ? raw.password : "";
  if (email === "" || password === "") {
    return { error: "กรุณากรอกอีเมลและรหัสผ่าน", data: { email, password } };
  }
  return { error: null, data: { email, password } };
}

// คอลัมน์ id ใน PostgreSQL เป็น INT 32 บิต เกินนี้ Prisma จะ error เป็น 500
const MAX_INT = 2147483647;

// แปลง :id จาก url เป็นเลข ถ้าไม่ใช่เลขบวกในช่วง INT คืน null
export function parseId(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0 || id > MAX_INT) return null;
  return id;
}
