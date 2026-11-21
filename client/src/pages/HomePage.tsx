import { Link } from "react-router";
import { ArrowRight, Map as MapIcon, Plus } from "lucide-react";
import { useCategories, useReports } from "../hooks/useReports";
import { useUiStore } from "../stores/useUiStore";
import ReportCard from "../components/ReportCard";
import CategoryIcon from "../components/CategoryIcon";
import { ReportsMap } from "../components/MapView";
import { ErrorAlert, GridSkeleton } from "../components/Feedback";
import { STATUS_COLOR } from "../utils";

const noFilter = { search: "", status: "" as const, categoryId: 0 };

// หน้าแรก: ข้อความแนะนำ ตัวเลข 3 สถานะ แผนที่ย่อ หมวดหมู่ และเรื่องล่าสุด
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

  const stats = [
    { label: "รอดำเนินการ", value: pending, color: STATUS_COLOR.PENDING },
    { label: "กำลังแก้ไข", value: doing, color: STATUS_COLOR.IN_PROGRESS },
    { label: "เสร็จสิ้น", value: done, color: STATUS_COLOR.RESOLVED },
  ];

  return (
    <div className="space-y-12">
      {/* hero บนเวทีม่วงเข้ม เต็มความกว้างจอ: ซ้ายข้อความ+สถิติ ขวาแผนที่จริง */}
      <section className="stage -mt-6 ml-[calc(50%-50vw)] w-screen">
        <div className="max-w-6xl mx-auto px-4 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.15] text-bone">
                เห็นปัญหาในชุมชน
                <br />
                แจ้งได้ใน<span className="emphasis">ไม่กี่นาที</span>
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-bone/75 max-w-md">
                ถนนพัง ไฟดับ น้ำท่วม ขยะล้น ปักหมุดบนแผนที่ แนบรูป แล้วติดตามได้ว่าเจ้าหน้าที่ดำเนินการถึงไหนแล้ว
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/reports/new" className="btn btn-lg border-0 bg-bone text-plum hover:bg-blush">
                <Plus size={18} aria-hidden="true" /> แจ้งปัญหาใหม่
              </Link>
              <Link
                to="/map"
                className="btn btn-outline btn-lg border-bone/60 text-bone hover:bg-bone hover:text-plum hover:border-bone"
                onClick={clearFilters}
              >
                <MapIcon size={18} aria-hidden="true" /> ดูแผนที่เต็ม
              </Link>
            </div>

            {reports.isError ? (
              <ErrorAlert message={reports.error.message} onRetry={() => reports.refetch()} />
            ) : (
              <ul className="flex flex-wrap gap-2" aria-label="จำนวนเรื่องตามสถานะ">
                {stats.map((s) => (
                  <li key={s.label} className="flex items-center gap-2 rounded-full bg-white/[0.08] border border-white/15 pl-3 pr-4 py-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} aria-hidden="true" />
                    <span className="text-sm text-bone/80">{s.label}</span>
                    <span className="text-lg font-semibold text-bone tabular">
                      {reports.isLoading ? <span className="skeleton inline-block h-5 w-6 align-middle" /> : s.value}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg:col-span-3 rounded-[10px] bg-white/[0.06] border border-white/15 p-2 min-h-72">
            {reports.isLoading && <div className="skeleton h-80 lg:h-[420px] w-full" />}
            {reports.data && <ReportsMap reports={reports.data} height="h-80 lg:h-[420px]" />}
            {reports.isError && (
              <div className="h-80 flex items-center justify-center text-bone/70">โหลดแผนที่ไม่สำเร็จ</div>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">หมวดหมู่ปัญหา</h2>
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
                className="card bg-base-100 border border-base-300 hover:border-heather hover:bg-petal transition-colors"
              >
                <div className="card-body items-center text-center p-4 gap-1.5">
                  <CategoryIcon category={c} size={30} />
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-xs text-base-content/70">{c._count ? c._count.reports : 0} เรื่อง</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">แจ้งล่าสุด</h2>
          <Link to="/reports" className="link font-medium underline-offset-4 text-sm inline-flex items-center gap-1" onClick={clearFilters}>
            ดูทั้งหมด <ArrowRight size={14} aria-hidden="true" />
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
