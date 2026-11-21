import { useAuthStore } from "../stores/useAuthStore";
import type {
  ApiResponse,
  AirQuality,
  AuthResult,
  Category,
  Comment,
  LoginData,
  PlaceResult,
  RegisterData,
  Report,
  ReportDetail,
  ReportFilters,
  ReportFormData,
  ReportStatus,
  Role,
  User,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
// รูปที่อัปโหลดอยู่ที่ server เดียวกันแต่ไม่มี /api
export const FILE_URL = API_URL.replace(/\/api\/?$/, "");

// error จาก API พร้อม HTTP status (0 = ต่อ server ไม่ได้) ให้หน้าเว็บแยกกรณีได้ เช่น 404 = ไม่พบ
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// ยิง request แล้วโยน error เป็นข้อความไทยจากหลังบ้าน ให้ TanStack Query จับไปแสดง
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", "Bearer " + token);
  // ส่งไฟล์ (FormData) ไม่ต้องใส่ Content-Type เอง browser ใส่ให้
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(API_URL + path, { ...options, headers });
  } catch {
    throw new ApiError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบว่ารัน server (port 3000) แล้ว", 0);
  }

  let json: ApiResponse<T> | null = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  // token หมดอายุหรือผู้ใช้ถูกลบ -> ออกจากระบบให้เลย
  if (res.status === 401 && token) {
    useAuthStore.getState().logout();
  }

  if (!res.ok || !json || !json.success) {
    throw new ApiError(json?.message || `เกิดข้อผิดพลาด (${res.status})`, res.status);
  }
  return json.data as T;
}

// แปลงข้อมูลฟอร์มเป็น FormData เพราะต้องแนบไฟล์รูปไปด้วย
function toFormData(data: ReportFormData): FormData {
  const fd = new FormData();
  fd.append("title", data.title);
  fd.append("description", data.description);
  fd.append("location", data.location);
  fd.append("address", data.address);
  fd.append("latitude", data.latitude === null ? "" : String(data.latitude));
  fd.append("longitude", data.longitude === null ? "" : String(data.longitude));
  fd.append("priority", data.priority);
  fd.append("categoryId", String(data.categoryId));
  if (data.image) fd.append("image", data.image);
  if (data.removeImage) fd.append("removeImage", "true");
  return fd;
}

// ---------- auth ----------

// POST /api/auth/login
export function login(data: LoginData): Promise<AuthResult> {
  return request<AuthResult>("/auth/login", { method: "POST", body: JSON.stringify(data) });
}

// POST /api/auth/register
export function register(data: RegisterData): Promise<AuthResult> {
  return request<AuthResult>("/auth/register", { method: "POST", body: JSON.stringify(data) });
}

// GET /api/auth/me ดูว่า token นี้เป็นของใคร
export function fetchMe(): Promise<User> {
  return request<User>("/auth/me");
}

// GET /api/users
export function fetchUsers(): Promise<User[]> {
  return request<User[]>("/users");
}

// PATCH /api/users/:id/role
export function updateUserRole(id: number, role: Role): Promise<User> {
  return request<User>(`/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
}

// ---------- reports ----------

// GET /api/reports พร้อมตัวกรอง (search, status, categoryId)
export function fetchReports(filters: ReportFilters): Promise<Report[]> {
  const params = new URLSearchParams();
  if (filters.search.trim() !== "") params.set("search", filters.search.trim());
  if (filters.status !== "") params.set("status", filters.status);
  if (filters.categoryId > 0) params.set("categoryId", String(filters.categoryId));
  if (filters.reporterId) params.set("reporterId", String(filters.reporterId));

  const qs = params.toString();
  return request<Report[]>("/reports" + (qs ? "?" + qs : ""));
}

// GET /api/reports/:id
export function fetchReport(id: number): Promise<ReportDetail> {
  return request<ReportDetail>(`/reports/${id}`);
}

// GET /api/categories
export function fetchCategories(): Promise<Category[]> {
  return request<Category[]>("/categories");
}

// POST /api/reports
export function createReport(data: ReportFormData): Promise<Report> {
  return request<Report>("/reports", { method: "POST", body: toFormData(data) });
}

// PUT /api/reports/:id
export function updateReport(id: number, data: ReportFormData): Promise<Report> {
  return request<Report>(`/reports/${id}`, { method: "PUT", body: toFormData(data) });
}

// PATCH /api/reports/:id/status
export function updateStatus(id: number, status: ReportStatus, note: string): Promise<Report> {
  return request<Report>(`/reports/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, note }) });
}

// DELETE /api/reports/:id
export function deleteReport(id: number): Promise<void> {
  return request<void>(`/reports/${id}`, { method: "DELETE" });
}

// POST /api/reports/:id/comments
export function addComment(reportId: number, message: string): Promise<Comment> {
  return request<Comment>(`/reports/${reportId}/comments`, { method: "POST", body: JSON.stringify({ message }) });
}

// DELETE /api/comments/:id
export function deleteComment(id: number): Promise<void> {
  return request<void>(`/comments/${id}`, { method: "DELETE" });
}

// ---------- API ภายนอก (server เราเป็นตัวกลางเรียก Nominatim / Open-Meteo) ----------

// ต่อพิกัดเป็น query string ?lat=..&lng=..
function coordsQuery(lat: number, lng: number): string {
  return new URLSearchParams({ lat: String(lat), lng: String(lng) }).toString();
}

// ถาม server ว่าพิกัดนี้คือที่อยู่อะไร (server ไปถาม Nominatim ต่อ)
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const data = await request<{ address: string | null }>("/geo/reverse?" + coordsQuery(lat, lng));
  return data.address;
}

// ค้นหาสถานที่จากชื่อ
export function searchPlaces(q: string): Promise<PlaceResult[]> {
  return request<PlaceResult[]>("/geo/search?" + new URLSearchParams({ q }).toString());
}

// ค่าฝุ่น PM2.5 ตรงพิกัดนั้น (Open-Meteo)
export function fetchAirQuality(lat: number, lng: number): Promise<AirQuality> {
  return request<AirQuality>("/geo/air?" + coordsQuery(lat, lng));
}
