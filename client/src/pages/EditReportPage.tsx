import { Link, useNavigate, useParams } from "react-router";
import { useReport, useUpdateReport } from "../hooks/useReports";
import { useUiStore } from "../stores/useUiStore";
import ReportForm from "../components/ReportForm";
import { DetailSkeleton, ErrorAlert } from "../components/Feedback";
import type { ReportFormData } from "../types";

export default function EditReportPage() {
  const params = useParams();
  const id = Number(params.id);
  const navigate = useNavigate();
  const report = useReport(id);
  const updateReport = useUpdateReport(id);
  const showToast = useUiStore((s) => s.showToast);

  if (!Number.isInteger(id) || id <= 0) return <ErrorAlert message="รหัสเรื่องไม่ถูกต้อง" />;
  if (report.isLoading) return <DetailSkeleton />;
  if (report.isError || !report.data) {
    return <ErrorAlert message={report.error?.message || "ไม่พบข้อมูล"} onRetry={() => report.refetch()} />;
  }

  const r = report.data;
  // แปลงข้อมูลจาก server ให้เป็นค่าเริ่มต้นของฟอร์ม (null -> "")
  const initial: ReportFormData = {
    title: r.title,
    description: r.description,
    location: r.location,
    reporterName: r.reporterName,
    phone: r.phone || "",
    imageUrl: r.imageUrl || "",
    priority: r.priority,
    status: r.status,
    categoryId: r.categoryId,
  };

  function handleSubmit(data: ReportFormData) {
    updateReport.mutate(data, {
      onSuccess: () => {
        showToast("บันทึกการแก้ไขแล้ว");
        navigate(`/reports/${id}`);
      },
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">แก้ไขเรื่อง #{r.id}</h1>
        <Link to={`/reports/${r.id}`} className="btn btn-ghost btn-sm">
          ยกเลิก
        </Link>
      </div>
      {/* key ทำให้ฟอร์มรีเซ็ตเมื่อเปลี่ยนเรื่อง */}
      <ReportForm
        key={r.id}
        initial={initial}
        showStatus
        submitText="บันทึกการแก้ไข"
        pending={updateReport.isPending}
        serverError={updateReport.isError ? updateReport.error.message : null}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
