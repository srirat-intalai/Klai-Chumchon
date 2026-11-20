import { Link } from "react-router";
import { useReports } from "../hooks/useReports";
import { useMe } from "../hooks/useAuth";
import ReportCard from "../components/ReportCard";
import { EmptyState, ErrorAlert, GridSkeleton } from "../components/Feedback";

// อยู่ใต้ RequireAuth เลยมี user แน่นอน
export default function MyReportsPage() {
  const { user } = useMe();
  const reports = useReports({ search: "", status: "", categoryId: 0, reporterId: user?.id });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">เรื่องที่ฉันแจ้ง</h1>
          <p className="text-sm text-base-content/60">แก้ไขหรือลบได้ระหว่างที่ยังรอดำเนินการ</p>
        </div>
        <Link to="/reports/new" className="btn btn-primary btn-sm">
          + แจ้งปัญหาใหม่
        </Link>
      </div>

      {reports.isLoading && <GridSkeleton count={3} />}
      {reports.isError && <ErrorAlert message={reports.error.message} onRetry={() => reports.refetch()} />}
      {reports.data && reports.data.length === 0 && <EmptyState text="คุณยังไม่เคยแจ้งเรื่อง" />}
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
