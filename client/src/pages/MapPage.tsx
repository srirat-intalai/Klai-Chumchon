import { useCategories, useReports } from "../hooks/useReports";
import { useUiStore } from "../stores/useUiStore";
import { ReportsMap } from "../components/MapView";
import { ErrorAlert } from "../components/Feedback";
import { CategoryPills, StatusPills } from "../components/FilterPills";

export default function MapPage() {
  // ใช้ตัวกรองชุดเดียวกับหน้ารายการ (อยู่ใน Zustand) สลับหน้าไปมาตัวกรองไม่หาย
  const status = useUiStore((s) => s.status);
  const categoryId = useUiStore((s) => s.categoryId);
  const setStatus = useUiStore((s) => s.setStatus);
  const setCategoryId = useUiStore((s) => s.setCategoryId);

  const reports = useReports({ search: "", status, categoryId }, true);
  const categories = useCategories();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">แผนที่ปัญหาในชุมชน</h1>
          <p className="text-sm text-base-content/70">
            {reports.data ? `แสดง ${reports.data.length} จุด` : "กำลังโหลด..."} · คลิกหมุดเพื่อดูรายละเอียด
          </p>
        </div>
      </div>

      {/* pill สถานะมีจุดสีตรงกับหมุด จึงใช้เป็นคำอธิบายสีไปในตัว */}
      <div className="space-y-2">
        <StatusPills value={status} onChange={setStatus} />
        <CategoryPills categories={categories.data} value={categoryId} onChange={setCategoryId} />
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
