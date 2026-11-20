import { useState } from "react";
import { Link } from "react-router";
import { useDeleteReport, useReports, useUpdateStatus } from "../hooks/useReports";
import { useUiStore } from "../stores/useUiStore";
import { PriorityBadge } from "../components/Badges";
import { EmptyState, ErrorAlert, TableSkeleton } from "../components/Feedback";
import ConfirmModal from "../components/ConfirmModal";
import { STATUS_LABEL } from "../types";
import type { Report, ReportStatus } from "../types";
import { formatDate } from "../utils";

export default function AdminPage() {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "">("");
  const [target, setTarget] = useState<Report | null>(null);

  const reports = useReports({ search: "", status: statusFilter, categoryId: 0 });
  const updateStatus = useUpdateStatus();
  const deleteReport = useDeleteReport();
  const showToast = useUiStore((s) => s.showToast);
  const removeBookmark = useUiStore((s) => s.removeBookmark);

  function changeStatus(id: number, status: ReportStatus) {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => showToast(`เปลี่ยนสถานะเรื่อง #${id} เป็น "${STATUS_LABEL[status]}"`),
        onError: (err) => showToast(err.message, "error"),
      }
    );
  }

  function confirmDelete() {
    if (!target) return;
    const id = target.id;
    deleteReport.mutate(id, {
      onSuccess: () => {
        removeBookmark(id);
        showToast(`ลบเรื่อง #${id} แล้ว`);
        setTarget(null);
      },
      onError: (err) => {
        showToast(err.message, "error");
        setTarget(null);
      },
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">จัดการระบบ</h1>
          <p className="text-base-content/60 text-sm">สำหรับเจ้าหน้าที่ อัปเดตสถานะ แก้ไข หรือลบเรื่องที่แจ้ง</p>
        </div>
        <div className="flex gap-2">
          <select
            className="select select-bordered select-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | "")}
          >
            <option value="">ทุกสถานะ</option>
            <option value="PENDING">{STATUS_LABEL.PENDING}</option>
            <option value="IN_PROGRESS">{STATUS_LABEL.IN_PROGRESS}</option>
            <option value="RESOLVED">{STATUS_LABEL.RESOLVED}</option>
          </select>
          <Link to="/reports/new" className="btn btn-primary btn-sm">
            + เพิ่มเรื่อง
          </Link>
        </div>
      </div>

      {reports.isLoading && <TableSkeleton />}
      {reports.isError && <ErrorAlert message={reports.error.message} onRetry={() => reports.refetch()} />}
      {reports.data && reports.data.length === 0 && <EmptyState text="ไม่มีเรื่องในสถานะนี้" />}

      {reports.data && reports.data.length > 0 && (
        <div className="overflow-x-auto bg-base-100 rounded-box border border-base-300">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>#</th>
                <th>เรื่อง</th>
                <th className="hidden md:table-cell">หมวด</th>
                <th className="hidden sm:table-cell">ความเร่งด่วน</th>
                <th>สถานะ</th>
                <th className="text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {reports.data.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td className="min-w-48">
                    <Link to={`/reports/${r.id}`} className="link link-hover font-medium">
                      {r.title}
                    </Link>
                    <div className="text-xs text-base-content/50">{formatDate(r.createdAt)}</div>
                  </td>
                  <td className="hidden md:table-cell whitespace-nowrap">
                    {r.category.icon} {r.category.name}
                  </td>
                  <td className="hidden sm:table-cell">
                    <PriorityBadge priority={r.priority} />
                  </td>
                  <td>
                    <select
                      className="select select-bordered select-xs"
                      value={r.status}
                      disabled={updateStatus.isPending}
                      onChange={(e) => changeStatus(r.id, e.target.value as ReportStatus)}
                    >
                      <option value="PENDING">{STATUS_LABEL.PENDING}</option>
                      <option value="IN_PROGRESS">{STATUS_LABEL.IN_PROGRESS}</option>
                      <option value="RESOLVED">{STATUS_LABEL.RESOLVED}</option>
                    </select>
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <Link to={`/reports/${r.id}/edit`} className="btn btn-ghost btn-xs">
                      แก้ไข
                    </Link>
                    <button className="btn btn-ghost btn-xs text-error" onClick={() => setTarget(r)}>
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={target !== null}
        title="ยืนยันการลบ"
        text={target ? `ลบเรื่อง "${target.title}" และความคิดเห็นทั้งหมด?` : ""}
        pending={deleteReport.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
