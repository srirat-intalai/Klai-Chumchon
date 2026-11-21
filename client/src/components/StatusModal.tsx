import { useState } from "react";
import type { FormEvent } from "react";
import { useUpdateStatus } from "../hooks/useReports";
import { useUiStore } from "../stores/useUiStore";
import { StatusBadge } from "./Badges";
import { STATUS_LABEL } from "../types";
import type { ReportStatus } from "../types";
import { STATUS_COLOR } from "../utils";

interface Props {
  report: { id: number; title: string; status: ReportStatus };
  onClose: () => void;
}

const statusList: ReportStatus[] = ["PENDING", "IN_PROGRESS", "RESOLVED"];

// เปลี่ยนสถานะต้องผ่าน modal นี้ทุกครั้ง: เลือกสถานะ + หมายเหตุ แล้วค่อยกดยืนยัน
// กันการเผลอเปลี่ยนจาก dropdown แล้วเกิด StatusLog ผิด ๆ
export default function StatusModal({ report, onClose }: Props) {
  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const updateStatus = useUpdateStatus();
  const showToast = useUiStore((s) => s.showToast);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (status === report.status) {
      setError("กรุณาเลือกสถานะใหม่ที่ต่างจากเดิม");
      return;
    }
    setError("");
    updateStatus.mutate(
      { id: report.id, status, note },
      {
        onSuccess: () => {
          showToast(`เรื่อง #${report.id} เปลี่ยนเป็น "${STATUS_LABEL[status]}" แล้ว`);
          onClose();
        },
        onError: (err) => setError(err.message),
      }
    );
  }

  const pending = updateStatus.isPending;

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="status-modal-title">
      <form onSubmit={submit} className="modal-box space-y-4">
        <div>
          <h3 id="status-modal-title" className="font-bold text-lg">
            อัปเดตสถานะ
          </h3>
          <p className="text-sm text-base-content/70 mt-1">
            #{report.id} {report.title}
          </p>
          <p className="text-sm mt-2 flex items-center gap-2">
            สถานะปัจจุบัน <StatusBadge status={report.status} />
          </p>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium mb-2">เปลี่ยนเป็น</legend>
          {statusList.map((s) => (
            <label
              key={s}
              className={`flex items-center gap-3 rounded-box border p-3 cursor-pointer ${
                status === s ? "border-base-content/60 bg-secondary/60" : "border-base-300"
              } ${s === report.status ? "opacity-60" : ""}`}
            >
              <input
                type="radio"
                name="status"
                className="radio radio-sm"
                checked={status === s}
                onChange={() => setStatus(s)}
              />
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: STATUS_COLOR[s] }} aria-hidden="true" />
              <span>{STATUS_LABEL[s]}</span>
              {s === report.status && <span className="text-xs ml-auto">(ปัจจุบัน)</span>}
            </label>
          ))}
        </fieldset>

        <label className="form-control w-full">
          <span className="text-sm font-medium mb-1">หมายเหตุถึงผู้แจ้ง (ไม่บังคับ)</span>
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="เช่น ส่งช่างลงพื้นที่พรุ่งนี้ช่วงเช้า"
            value={note}
            maxLength={500}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        {error && (
          <div role="alert" className="alert alert-error text-sm py-2">
            {error}
          </div>
        )}

        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose} disabled={pending}>
            ยกเลิก
          </button>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending && <span className="loading loading-spinner loading-sm" />}
            ยืนยันเปลี่ยนสถานะ
          </button>
        </div>
      </form>
      <div className="modal-backdrop" onClick={pending ? undefined : onClose} />
    </div>
  );
}
