import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addComment,
  createReport,
  deleteComment,
  deleteReport,
  fetchAirQuality,
  fetchCategories,
  fetchReport,
  fetchReports,
  updateReport,
  updateStatus,
} from "../api/reportApi";
import type { ReportFilters, ReportFormData, ReportStatus } from "../types";

// ---------- อ่านข้อมูล ----------

// keepPrevious = ตอนเปลี่ยนตัวกรอง ให้โชว์รายการเดิมไว้ก่อน หน้าจอจะไม่กระพริบ
// เปิดเฉพาะหน้าที่ผู้ใช้กดเปลี่ยนตัวกรองเอง หน้าอื่นห้ามเปิด ไม่งั้นอาจเห็นข้อมูลชุดอื่นแวบขึ้นมา
export function useReports(filters: ReportFilters, keepPrevious = false) {
  return useQuery({
    queryKey: ["reports", filters],
    queryFn: () => fetchReports(filters),
    placeholderData: keepPrevious ? keepPreviousData : undefined,
  });
}

export function useReport(id: number) {
  return useQuery({
    queryKey: ["report", id],
    queryFn: () => fetchReport(id),
    enabled: id > 0,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10, // หมวดหมู่แทบไม่เปลี่ยน
  });
}

// ค่าฝุ่น PM2.5 จาก Open-Meteo (ผ่าน server) ไม่ต้องดึงใหม่บ่อย
export function useAirQuality(lat: number | undefined, lng: number | undefined) {
  return useQuery({
    queryKey: ["air", lat, lng],
    queryFn: () => fetchAirQuality(lat!, lng!),
    enabled: lat !== undefined && lng !== undefined,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}

// ---------- แก้ข้อมูล (หลังสำเร็จ invalidate ให้หน้าจออัปเดตเองไม่ต้องรีเฟรช) ----------

export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReportFormData) => createReport(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateReport(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReportFormData) => updateReport(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["report", id] });
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: number; status: ReportStatus; note: string }) => updateStatus(v.id, v.status, v.note),
    onSuccess: (_data, v) => {
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["report", v.id] });
    },
  });
}

export function useDeleteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteReport(id),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: ["report", id] });
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useAddComment(reportId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => addComment(reportId, message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["report", reportId] });
      qc.invalidateQueries({ queryKey: ["reports"] }); // จำนวนคอมเมนต์ในการ์ดเปลี่ยน
    },
  });
}

export function useDeleteComment(reportId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["report", reportId] });
      qc.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
