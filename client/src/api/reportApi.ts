import type {
  ApiResponse,
  Category,
  Comment,
  CommentFormData,
  Report,
  ReportDetail,
  ReportFilters,
  ReportFormData,
  ReportStatus,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ยิง request แล้วโยน error เป็นข้อความไทยจากหลังบ้าน ให้ TanStack Query จับไปแสดง
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(API_URL + path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบว่ารัน server (port 3000) แล้ว");
  }

  let json: ApiResponse<T> | null = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok || !json || !json.success) {
    throw new Error(json?.message || `เกิดข้อผิดพลาด (${res.status})`);
  }
  return json.data as T;
}

export function fetchReports(filters: ReportFilters): Promise<Report[]> {
  const params = new URLSearchParams();
  if (filters.search.trim() !== "") params.set("search", filters.search.trim());
  if (filters.status !== "") params.set("status", filters.status);
  if (filters.categoryId > 0) params.set("categoryId", String(filters.categoryId));

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
  return request<Report>("/reports", { method: "POST", body: JSON.stringify(data) });
}

export function updateReport(id: number, data: ReportFormData): Promise<Report> {
  return request<Report>(`/reports/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function updateStatus(id: number, status: ReportStatus): Promise<Report> {
  return request<Report>(`/reports/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export function deleteReport(id: number): Promise<void> {
  return request<void>(`/reports/${id}`, { method: "DELETE" });
}

export function addComment(reportId: number, data: CommentFormData): Promise<Comment> {
  return request<Comment>(`/reports/${reportId}/comments`, { method: "POST", body: JSON.stringify(data) });
}

export function deleteComment(id: number): Promise<void> {
  return request<void>(`/comments/${id}`, { method: "DELETE" });
}
