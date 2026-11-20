import { useNavigate } from "react-router";
import { useCreateReport } from "../hooks/useReports";
import { useUiStore } from "../stores/useUiStore";
import ReportForm from "../components/ReportForm";
import type { ReportFormData } from "../types";

export default function NewReportPage() {
  const navigate = useNavigate();
  const createReport = useCreateReport();
  const showToast = useUiStore((s) => s.showToast);

  function handleSubmit(data: ReportFormData) {
    createReport.mutate(data, {
      onSuccess: (report) => {
        showToast("แจ้งเรื่องเรียบร้อย ขอบคุณที่ช่วยดูแลชุมชน");
        navigate(`/reports/${report.id}`);
      },
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold">แจ้งปัญหาใหม่</h1>
        <p className="text-base-content/70 text-sm">ช่องที่มี * ต้องกรอก</p>
      </div>
      <ReportForm
        submitText="ส่งเรื่อง"
        pending={createReport.isPending}
        serverError={createReport.isError ? createReport.error.message : null}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
