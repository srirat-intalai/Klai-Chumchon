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

// modal กลางของทั้งเว็บ ใช้ <dialog> ของ browser + showModal()
// ได้มาฟรี: กด Esc ปิด, focus เข้าไปอยู่ใน modal และวนอยู่ข้างใน, พื้นหลังกด/Tab ไม่ได้,
// ใส่ data-autofocus ให้ element ที่ควรได้ focus ก่อน (showModal จะทับ autoFocus ของ React)
export default function Dialog({ labelledBy, describedBy, busy = false, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    // จำปุ่มที่เปิดไว้ ปิดแล้วคืน focus ให้เอง (React ถอด dialog ออกก่อน browser จะคืนให้)
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
        // ปุ่ม Esc: ให้ React เป็นคนตัดสินว่าจะปิดไหม
        e.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(e) => {
        // คลิกพื้นหลังนอกกล่อง (เป้าหมายคือตัว dialog เอง) = ปิด
        if (e.target === ref.current && !busy) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
