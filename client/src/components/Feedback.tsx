import { Inbox, RefreshCw, TriangleAlert } from "lucide-react";

// โครงกระพริบระหว่างรอข้อมูล + กล่องแจ้ง error

// กล่องเทา ๆ กระพริบ แทนการ์ด 1 ใบตอนกำลังโหลด
export function CardSkeleton() {
  return (
    <div className="card bg-base-100 border border-base-300 p-5 space-y-3">
      <div className="flex justify-between">
        <div className="skeleton h-5 w-24" />
        <div className="skeleton h-5 w-20" />
      </div>
      <div className="skeleton h-6 w-3/4" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-2/3" />
      <div className="flex justify-between pt-2">
        <div className="skeleton h-4 w-28" />
        <div className="skeleton h-8 w-20" />
      </div>
    </div>
  );
}

// skeleton หลายใบเรียงเป็นตาราง ใช้ตอนโหลดรายการ
export function GridSkeleton({ count = 6 }: { count?: number }) {
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push(<CardSkeleton key={i} />);
  }
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{items}</div>;
}

// skeleton ของหน้ารายละเอียด
export function DetailSkeleton() {
  return (
    <div className="card bg-base-100 border border-base-300 p-6 space-y-4">
      <div className="skeleton h-5 w-32" />
      <div className="skeleton h-9 w-3/4" />
      <div className="skeleton h-56 w-full" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-5/6" />
      <div className="skeleton h-4 w-1/2" />
    </div>
  );
}

// skeleton ของตารางในหน้าจัดการระบบ
export function TableSkeleton() {
  const rows = [];
  for (let i = 0; i < 6; i++) {
    rows.push(<div key={i} className="skeleton h-12 w-full" />);
  }
  return <div className="space-y-2">{rows}</div>;
}

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

// กล่องแจ้ง error สีแดง มีปุ่ม "ลองใหม่" ให้กดดึงข้อมูลอีกรอบ
export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <div role="alert" className="alert alert-error">
      <TriangleAlert size={22} aria-hidden="true" className="shrink-0" />
      <div>
        <h3 className="font-semibold">เกิดข้อผิดพลาด</h3>
        <p className="text-sm">{message}</p>
      </div>
      {onRetry && (
        <button className="btn btn-sm" onClick={onRetry}>
          <RefreshCw size={14} aria-hidden="true" />
          ลองใหม่
        </button>
      )}
    </div>
  );
}

// ข้อความตอนไม่มีข้อมูลเลย
export function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-16 text-base-content/70">
      <Inbox size={48} aria-hidden="true" className="mx-auto mb-3 opacity-60" />
      <p>{text}</p>
    </div>
  );
}
