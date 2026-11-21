import { useState } from "react";
import { Link } from "react-router";
import { Plus } from "lucide-react";
import { useReports } from "../hooks/useReports";
import { useMe } from "../hooks/useAuth";
import ReportCard from "../components/ReportCard";
import { EmptyState, ErrorAlert, GridSkeleton } from "../components/Feedback";
import { StatusPills } from "../components/FilterPills";
import type { Report, ReportStatus } from "../types";

// หน้าเรื่องของฉัน: เห็นเลยว่าเรื่องไหนเจ้าหน้าที่ขยับแล้ว ไม่ต้องกดเข้าไปดูทีละเรื่อง
// อยู่ใต้ RequireAuth เลยมี user แน่นอน
export default function MyReportsPage() {
  const { user } = useMe();
  const reports = useReports({ search: "", status: "", categoryId: 0, reporterId: user?.id });
  const [status, setStatus] = useState<ReportStatus | "">("");

  let all: Report[] = [];
  if (reports.data) {
    all = reports.data;
  }

  // นับจำนวนแต่ละสถานะ ไว้โชว์บนปุ่ม
  const counts = { PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0 };
  for (let i = 0; i < all.length; i++) {
    counts[all[i].status] = counts[all[i].status] + 1;
  }

  // กรองตามสถานะที่เลือก (กรองในหน้าเลย ข้อมูลมีอยู่แล้ว ไม่ต้องยิง API ใหม่)
  const list: Report[] = [];
  for (let i = 0; i < all.length; i++) {
    if (status === "" || all[i].status === status) {
      list.push(all[i]);
    }
  }
  // เรื่องที่มีความเคลื่อนไหวล่าสุดขึ้นก่อน
  list.sort(function (a, b) {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">เรื่องของฉัน</h1>
          <p className="text-sm text-base-content/75">เรื่องที่อัปเดตล่าสุดอยู่บนสุด แก้ไขหรือลบได้ระหว่างที่ยังรอดำเนินการ</p>
        </div>
        <Link to="/reports/new" className="btn btn-primary btn-sm">
          <Plus size={16} aria-hidden="true" /> แจ้งปัญหาใหม่
        </Link>
      </div>

      {reports.data && reports.data.length > 0 && <StatusPills value={status} onChange={setStatus} counts={counts} />}

      {reports.isLoading && <GridSkeleton count={3} />}
      {reports.isError && <ErrorAlert message={reports.error.message} onRetry={() => reports.refetch()} />}
      {reports.data && reports.data.length === 0 && <EmptyState text="คุณยังไม่เคยแจ้งเรื่อง" />}
      {reports.data && reports.data.length > 0 && list.length === 0 && <EmptyState text="ไม่มีเรื่องในสถานะนี้" />}
      {list.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((r) => (
            <ReportCard key={r.id} report={r} showLatest />
          ))}
        </div>
      )}
    </div>
  );
}
