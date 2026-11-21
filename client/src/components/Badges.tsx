import { Flame } from "lucide-react";
import { PRIORITY_LABEL, ROLE_LABEL, STATUS_LABEL } from "../types";
import type { Priority, ReportStatus, Role } from "../types";

// สีแดง/เหลือง/เขียว ใช้กับ "สถานะ" อย่างเดียว ให้ตรงกับหมุดบนแผนที่
const statusColor: Record<ReportStatus, string> = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  RESOLVED: "resolved",
};

const roleColor: Record<Role, string> = {
  CITIZEN: "badge-ghost",
  STAFF: "badge-info",
  ADMIN: "badge-secondary",
};

// ป้ายสถานะ (รอดำเนินการ/กำลังดำเนินการ/เสร็จแล้ว) สีต่างกัน
export function StatusBadge({ status }: { status: ReportStatus }) {
  return <span className={`status-pill ${statusColor[status]}`}>{STATUS_LABEL[status]}</span>;
}

// ความเร่งด่วนเป็นข้อความสีกลาง ๆ จะได้ไม่แย่งความสนใจกับสีสถานะ
export function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === "HIGH") {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-semibold whitespace-nowrap">
        <Flame size={15} aria-hidden="true" />
        {PRIORITY_LABEL.HIGH}
      </span>
    );
  }
  // "ปานกลาง" อยู่เดี่ยว ๆ บนการ์ดแล้วไม่รู้ว่าหมายถึงอะไร เลยเติมคำว่าเร่งด่วนข้างหน้า
  let text = PRIORITY_LABEL[priority];
  if (priority === "MEDIUM") {
    text = "เร่งด่วนปานกลาง";
  }
  return <span className="text-sm text-base-content/70 whitespace-nowrap">{text}</span>;
}

// ป้ายบทบาท ประชาชน / เจ้าหน้าที่ / แอดมิน
export function RoleBadge({ role }: { role: Role }) {
  return <span className={`badge badge-sm ${roleColor[role]} whitespace-nowrap`}>{ROLE_LABEL[role]}</span>;
}
