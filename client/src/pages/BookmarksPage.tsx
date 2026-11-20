import { useEffect } from "react";
import { Link } from "react-router";
import { useReports } from "../hooks/useReports";
import { useUiStore } from "../stores/useUiStore";
import ReportCard from "../components/ReportCard";
import { EmptyState, ErrorAlert, GridSkeleton } from "../components/Feedback";

const noFilter = { search: "", status: "" as const, categoryId: 0 };

export default function BookmarksPage() {
  const bookmarks = useUiStore((s) => s.bookmarks);
  const pruneBookmarks = useUiStore((s) => s.pruneBookmarks);
  // Zustand มีแค่ id ส่วนข้อมูลเต็มดึงจาก cache ของ TanStack Query
  const reports = useReports(noFilter);
  const saved = (reports.data || []).filter((r) => bookmarks.includes(r.id));

  // พอโหลดรายการครบ ค่อยลบ id ที่ไม่มีอยู่แล้วออกจาก Zustand
  // ต้องข้ามตอนเป็น placeholder (ข้อมูลชั่วคราวจากตัวกรองอื่น) ไม่งั้นบุ๊กมาร์กจริงจะถูกลบ
  const ready = reports.data !== undefined && !reports.isPlaceholderData;
  useEffect(() => {
    if (ready && reports.data) pruneBookmarks(reports.data.map((r) => r.id));
  }, [ready, reports.data, pruneBookmarks]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">เรื่องที่ติดตาม</h1>
        <p className="text-base-content/70 text-sm">บันทึกไว้ในเครื่องนี้ (LocalStorage) ไม่ต้องสมัครสมาชิก</p>
      </div>

      {reports.isLoading && <GridSkeleton count={3} />}
      {reports.isError && <ErrorAlert message={reports.error.message} onRetry={() => reports.refetch()} />}
      {reports.data && saved.length === 0 && (
        <div className="text-center">
          <EmptyState text="ยังไม่ได้ติดตามเรื่องไหน กดปุ่มรูปดาวที่การ์ดเพื่อติดตาม" />
          <Link to="/reports" className="btn btn-primary btn-sm">
            ไปดูเรื่องที่แจ้ง
          </Link>
        </div>
      )}
      {saved.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      )}
    </div>
  );
}
