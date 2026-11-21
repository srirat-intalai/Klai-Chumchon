import { useId } from "react";
import Dialog from "./Dialog";

interface Props {
  open: boolean;
  title: string;
  text: string;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// modal ยืนยันก่อนลบ: focus เริ่มที่ "ยกเลิก" กดปุ่ม Enter พลาดจะได้ไม่ลบ
export default function ConfirmModal({ open, title, text, pending, onConfirm, onCancel }: Props) {
  const id = useId();
  if (!open) return null;

  return (
    <Dialog labelledBy={`${id}-title`} describedBy={`${id}-text`} busy={pending} onClose={onCancel}>
      <div className="modal-box">
        <h3 id={`${id}-title`} className="font-bold text-lg">
          {title}
        </h3>
        <p id={`${id}-text`} className="py-4">
          {text}
        </p>
        <div className="modal-action">
          <button className="btn" onClick={onCancel} disabled={pending} data-autofocus>
            ยกเลิก
          </button>
          <button className="btn btn-error" onClick={onConfirm} disabled={pending}>
            {pending && <span className="loading loading-spinner loading-sm" />}
            ลบ
          </button>
        </div>
      </div>
    </Dialog>
  );
}
