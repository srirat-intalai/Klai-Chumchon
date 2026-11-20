import { useCategories, useReports } from "../hooks/useReports";
import { useUiStore } from "../stores/useUiStore";
import { ReportsMap } from "../components/MapView";
import { ErrorAlert } from "../components/Feedback";
import { STATUS_LABEL } from "../types";
import type { ReportStatus } from "../types";
import { STATUS_COLOR } from "../utils";

const statusList: ReportStatus[] = ["PENDING", "IN_PROGRESS", "RESOLVED"];

export default function MapPage() {
  // ใช้ตัวกรองชุดเดียวกับหน้ารายการ (อยู่ใน Zustand) สลับหน้าไปมาตัวกรองไม่หาย
  const status = useUiStore((s) => s.status);
  const categoryId = useUiStore((s) => s.categoryId);
  const setStatus = useUiStore((s) => s.setStatus);
  const setCategoryId = useUiStore((s) => s.setCategoryId);

  const reports = useReports({ search: "", status, categoryId });
  const categories = useCategories();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">แผนที่ปัญหาในชุมชน</h1>
          <p className="text-sm text-base-content/60">
            {reports.data ? `แสดง ${reports.data.length} จุด` : "กำลังโหลด..."} · คลิกหมุดเพื่อดูรายละเอียด
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="select select-bordered select-sm"
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
          >
            <option value={0}>ทุกหมวดหมู่</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
          <select
            className="select select-bordered select-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as ReportStatus | "")}
          >
            <option value="">ทุกสถานะ</option>
            {statusList.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        {statusList.map((s) => (
          <span key={s} className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: STATUS_COLOR[s] }} />
            {STATUS_LABEL[s]}
          </span>
        ))}
      </div>

      {reports.isError && <ErrorAlert message={reports.error.message} onRetry={() => reports.refetch()} />}
      {reports.isLoading && <div className="skeleton h-[60vh] w-full" />}
      {reports.data && (
        <div className="bg-base-100 border border-base-300 rounded-box p-2">
          <ReportsMap reports={reports.data} />
        </div>
      )}
    </div>
  );
}
