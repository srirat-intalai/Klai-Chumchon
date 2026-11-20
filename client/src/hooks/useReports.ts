import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addComment,
  createReport,
  deleteComment,
  deleteReport,
  fetchCategories,
  fetchReport,
  fetchReports,
  updateReport,
  updateStatus,
} from "../api/reportApi";
import type { CommentFormData, ReportFilters, ReportFormData, ReportStatus } from "../types";

// ---------- อ่านข้อมูล ----------

export function useReports(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", filters],
    queryFn: () => fetchReports(filters),
    // ตอนเปลี่ยนตัวกรอง ให้โชว์ของเดิมไว้ก่อน หน้าจอจะไม่กระพริบ
    placeholderData: keepPreviousData,
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
    mutationFn: (v: { id: number; status: ReportStatus }) => updateStatus(v.id, v.status),
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
    mutationFn: (data: CommentFormData) => addComment(reportId, data),
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
