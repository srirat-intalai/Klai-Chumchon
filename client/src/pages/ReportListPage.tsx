import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useCategories, useReports } from "../hooks/useReports";
import { useUiStore } from "../stores/useUiStore";
import ReportCard from "../components/ReportCard";
import { EmptyState, ErrorAlert, GridSkeleton } from "../components/Feedback";
import { STATUS_LABEL } from "../types";
import type { ReportStatus } from "../types";

export default function ReportListPage() {
  const search = useUiStore((s) => s.search);
  const status = useUiStore((s) => s.status);
  const categoryId = useUiStore((s) => s.categoryId);
  const setSearch = useUiStore((s) => s.setSearch);
  const setStatus = useUiStore((s) => s.setStatus);
  const setCategoryId = useUiStore((s) => s.setCategoryId);
  const clearFilters = useUiStore((s) => s.clearFilters);

  // พิมพ์ในช่องค้นหาก่อน หยุดพิมพ์ 400ms ค่อยส่งเข้า store (กันยิง API ทุกตัวอักษร)
  const [text, setText] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setSearch(text), 400);
    return () => clearTimeout(timer);
  }, [text, setSearch]);

  const reports = useReports({ search, status, categoryId }, true);
  const categories = useCategories();

  const hasFilter = search !== "" || status !== "" || categoryId !== 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">เรื่องที่แจ้งทั้งหมด</h1>
        <p className="text-base-content/70 text-sm">
          {reports.data ? `พบ ${reports.data.length} เรื่อง` : "กำลังโหลด..."}
          {reports.isFetching && !reports.isLoading && <span className="loading loading-dots loading-xs ml-2" />}
        </p>
      </div>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="input input-bordered w-full md:col-span-2 flex items-center gap-2">
            <Search size={16} aria-hidden="true" className="opacity-60" />
            <input
              type="search"
              className="grow"
              placeholder="ค้นหาหัวข้อ รายละเอียด หรือจุดสังเกต"
              aria-label="ค้นหา"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <select
            className="select select-bordered w-full"
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
          >
            <option value={0}>ทุกหมวดหมู่</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="select select-bordered w-full"
            value={status}
            onChange={(e) => setStatus(e.target.value as ReportStatus | "")}
          >
            <option value="">ทุกสถานะ</option>
            <option value="PENDING">{STATUS_LABEL.PENDING}</option>
            <option value="IN_PROGRESS">{STATUS_LABEL.IN_PROGRESS}</option>
            <option value="RESOLVED">{STATUS_LABEL.RESOLVED}</option>
          </select>
          {hasFilter && (
            <button
              className="btn btn-ghost btn-sm md:col-span-4 justify-self-start"
              onClick={() => {
                clearFilters();
                setText("");
              }}
            >
              <X size={14} aria-hidden="true" /> ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>

      {reports.isLoading && <GridSkeleton />}
      {reports.isError && <ErrorAlert message={reports.error.message} onRetry={() => reports.refetch()} />}
      {reports.data && reports.data.length === 0 && <EmptyState text="ไม่พบเรื่องที่ตรงกับตัวกรอง" />}
      {reports.data && reports.data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.data.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      )}
    </div>
  );
}
