import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface Props {
  labelledBy: string;
  describedBy?: string;
  // ระหว่างกำลังบันทึก ห้ามปิด (กด Esc / คลิกนอกกล่อง ไม่มีผล)
  busy?: boolean;
  onClose: () => void;
  children: ReactNode;
}

// กล่อง modal ที่ใช้ทั้งเว็บ ใช้แท็ก <dialog> ที่ browser มีให้อยู่แล้ว
// ข้อดี: กด Esc ปิดได้ และกดข้างหลังไม่ได้ตอนกล่องเปิดอยู่
// ช่องไหนอยากให้เคอร์เซอร์ไปอยู่ก่อน ให้ใส่ data-autofocus ไว้
export default function Dialog({ labelledBy, describedBy, busy = false, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    // จำไว้ว่ากดปุ่มไหนเปิดกล่อง ปิดกล่องแล้วกลับไปที่ปุ่มนั้น
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (dialog && !dialog.open) dialog.showModal();
    dialog?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    return () => {
      if (dialog?.open) dialog.close();
      if (opener?.isConnected) opener.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onCancel={(e) => {
        // กด Esc: ถ้ากำลังบันทึกอยู่ห้ามปิด
        e.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(e) => {
        // คลิกตรงพื้นหลังนอกกล่อง = ปิด
        if (e.target === ref.current && !busy) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
