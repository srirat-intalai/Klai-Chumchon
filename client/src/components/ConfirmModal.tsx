interface Props {
  open: boolean;
  title: string;
  text: string;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// modal ยืนยันก่อนลบ (ใช้ class ของ DaisyUI)
export default function ConfirmModal({ open, title, text, pending, onConfirm, onCancel }: Props) {
  if (!open) return null;

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">{text}</p>
        <div className="modal-action">
          <button className="btn" onClick={onCancel} disabled={pending}>
            ยกเลิก
          </button>
          <button className="btn btn-error" onClick={onConfirm} disabled={pending}>
            {pending && <span className="loading loading-spinner loading-sm" />}
            ลบ
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={pending ? undefined : onCancel} />
    </div>
  );
}
