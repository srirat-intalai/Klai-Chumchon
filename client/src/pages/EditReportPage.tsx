import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useReport, useUpdateReport } from "../hooks/useReports";
import { useMe } from "../hooks/useAuth";
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
  const { user } = useMe();
  const showToast = useUiStore((s) => s.showToast);

  if (!Number.isInteger(id) || id <= 0) return <ErrorAlert message="รหัสเรื่องไม่ถูกต้อง" />;
  if (report.isLoading) return <DetailSkeleton />;
  if (report.isError || !report.data) {
    return <ErrorAlert message={report.error?.message || "ไม่พบข้อมูล"} onRetry={() => report.refetch()} />;
  }

  const r = report.data;

  // กฎเดียวกับหลังบ้าน: ประชาชนแก้ได้เฉพาะเรื่องตัวเองที่ยังรอดำเนินการ
  const allowed =
    user && (user.role !== "CITIZEN" || (r.reporterId === user.id && r.status === "PENDING"));
  if (!allowed) {
    return (
      <div className="space-y-4 max-w-xl mx-auto">
        <ErrorAlert message="แก้ไขได้เฉพาะเรื่องของคุณที่ยังรอดำเนินการ" />
        <Link to={`/reports/${r.id}`} className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} aria-hidden="true" /> กลับไปหน้ารายละเอียด
        </Link>
      </div>
    );
  }

  const initial: ReportFormData = {
    title: r.title,
    description: r.description,
    location: r.location,
    latitude: r.latitude,
    longitude: r.longitude,
    priority: r.priority,
    categoryId: r.categoryId,
    image: null,
    removeImage: false,
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
        oldImageUrl={r.imageUrl}
        submitText="บันทึกการแก้ไข"
        pending={updateReport.isPending}
        serverError={updateReport.isError ? updateReport.error.message : null}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
