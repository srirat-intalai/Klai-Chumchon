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

// ยิง request แล้วโยน error เป็นข้อความไทยจากหลังบ้าน ให้ TanStack Query จับไปแสดง
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", "Bearer " + token);
  // FormData ให้ browser ใส่ Content-Type (boundary) เอง
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(API_URL + path, { ...options, headers });
  } catch {
    throw new Error("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบว่ารัน server (port 3000) แล้ว");
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
    throw new Error(json?.message || `เกิดข้อผิดพลาด (${res.status})`);
  }
  return json.data as T;
}

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

export function login(data: LoginData): Promise<AuthResult> {
  return request<AuthResult>("/auth/login", { method: "POST", body: JSON.stringify(data) });
}

export function register(data: RegisterData): Promise<AuthResult> {
  return request<AuthResult>("/auth/register", { method: "POST", body: JSON.stringify(data) });
}

export function fetchMe(): Promise<User> {
  return request<User>("/auth/me");
}

export function fetchUsers(): Promise<User[]> {
  return request<User[]>("/users");
}

export function updateUserRole(id: number, role: Role): Promise<User> {
  return request<User>(`/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
}

// ---------- reports ----------

export function fetchReports(filters: ReportFilters): Promise<Report[]> {
  const params = new URLSearchParams();
  if (filters.search.trim() !== "") params.set("search", filters.search.trim());
  if (filters.status !== "") params.set("status", filters.status);
  if (filters.categoryId > 0) params.set("categoryId", String(filters.categoryId));
  if (filters.reporterId) params.set("reporterId", String(filters.reporterId));

  const qs = params.toString();
  return request<Report[]>("/reports" + (qs ? "?" + qs : ""));
}

export function fetchReport(id: number): Promise<ReportDetail> {
  return request<ReportDetail>(`/reports/${id}`);
}

export function fetchCategories(): Promise<Category[]> {
  return request<Category[]>("/categories");
}

export function createReport(data: ReportFormData): Promise<Report> {
  return request<Report>("/reports", { method: "POST", body: toFormData(data) });
}

export function updateReport(id: number, data: ReportFormData): Promise<Report> {
  return request<Report>(`/reports/${id}`, { method: "PUT", body: toFormData(data) });
}

export function updateStatus(id: number, status: ReportStatus, note: string): Promise<Report> {
  return request<Report>(`/reports/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, note }) });
}

export function deleteReport(id: number): Promise<void> {
  return request<void>(`/reports/${id}`, { method: "DELETE" });
}

export function addComment(reportId: number, message: string): Promise<Comment> {
  return request<Comment>(`/reports/${reportId}/comments`, { method: "POST", body: JSON.stringify({ message }) });
}

export function deleteComment(id: number): Promise<void> {
  return request<void>(`/comments/${id}`, { method: "DELETE" });
}

// ---------- API ภายนอก (server เราเป็นตัวกลางเรียก Nominatim / Open-Meteo) ----------

function coordsQuery(lat: number, lng: number): string {
  return new URLSearchParams({ lat: String(lat), lng: String(lng) }).toString();
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const data = await request<{ address: string | null }>("/geo/reverse?" + coordsQuery(lat, lng));
  return data.address;
}

export function searchPlaces(q: string): Promise<PlaceResult[]> {
  return request<PlaceResult[]>("/geo/search?" + new URLSearchParams({ q }).toString());
}

export function fetchAirQuality(lat: number, lng: number): Promise<AirQuality> {
  return request<AirQuality>("/geo/air?" + coordsQuery(lat, lng));
}
