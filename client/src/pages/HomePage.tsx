import { Link } from "react-router";
import { useCategories, useReports } from "../hooks/useReports";
import { useUiStore } from "../stores/useUiStore";
import ReportCard from "../components/ReportCard";
import { ErrorAlert, GridSkeleton } from "../components/Feedback";

const noFilter = { search: "", status: "" as const, categoryId: 0 };

export default function HomePage() {
  const reports = useReports(noFilter);
  const categories = useCategories();
  const setCategoryId = useUiStore((s) => s.setCategoryId);
  const clearFilters = useUiStore((s) => s.clearFilters);

  const list = reports.data || [];
  let pending = 0;
  let doing = 0;
  let done = 0;
  for (const r of list) {
    if (r.status === "PENDING") pending++;
    else if (r.status === "IN_PROGRESS") doing++;
    else done++;
  }

  return (
    <div className="space-y-8">
      <section className="hero bg-base-100 rounded-box border border-base-300">
        <div className="hero-content text-center py-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold">
              ใกล้ชุมชน <span className="text-primary">แจ้งปัญหาใกล้ตัว</span>
            </h1>
            <p className="py-4 text-base-content/70">
              ถนนพัง ไฟดับ น้ำท่วม ขยะล้น แจ้งได้ในไม่กี่นาที แล้วติดตามได้ว่าเรื่องของเราไปถึงไหนแล้ว
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/reports/new" className="btn btn-primary">
                + แจ้งปัญหาใหม่
              </Link>
              <Link to="/reports" className="btn btn-outline" onClick={clearFilters}>
                ดูเรื่องทั้งหมด
              </Link>
            </div>
          </div>
        </div>
      </section>

      {reports.isError ? (
        <ErrorAlert message={reports.error.message} onRetry={() => reports.refetch()} />
      ) : (
        <section className="stats stats-vertical sm:stats-horizontal w-full bg-base-100 border border-base-300">
          <div className="stat">
            <div className="stat-title">เรื่องทั้งหมด</div>
            <div className="stat-value">{reports.isLoading ? "-" : list.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">รอรับเรื่อง</div>
            <div className="stat-value text-warning">{reports.isLoading ? "-" : pending}</div>
          </div>
          <div className="stat">
            <div className="stat-title">กำลังดำเนินการ</div>
            <div className="stat-value text-info">{reports.isLoading ? "-" : doing}</div>
          </div>
          <div className="stat">
            <div className="stat-title">แก้ไขแล้ว</div>
            <div className="stat-value text-success">{reports.isLoading ? "-" : done}</div>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-3">หมวดหมู่ปัญหา</h2>
        {categories.isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="skeleton h-24" />
            ))}
          </div>
        )}
        {categories.isError && <ErrorAlert message={categories.error.message} onRetry={() => categories.refetch()} />}
        {categories.data && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.data.map((c) => (
              <Link
                key={c.id}
                to="/reports"
                onClick={() => {
                  clearFilters();
                  setCategoryId(c.id);
                }}
                className="card bg-base-100 border border-base-300 hover:border-primary transition-colors"
              >
                <div className="card-body items-center text-center p-4 gap-1">
                  <span className="text-3xl">{c.icon}</span>
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-xs text-base-content/60">{c._count?.reports ?? 0} เรื่อง</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">แจ้งล่าสุด</h2>
          <Link to="/reports" className="link link-primary text-sm" onClick={clearFilters}>
            ดูทั้งหมด →
          </Link>
        </div>
        {reports.isLoading && <GridSkeleton count={3} />}
        {reports.data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.slice(0, 6).map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
