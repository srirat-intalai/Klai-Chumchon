import { PRIORITY_LABEL, ROLE_LABEL, STATUS_LABEL } from "../types";
import type { Priority, ReportStatus, Role } from "../types";

// สีตรงกับหมุดบนแผนที่: แดง / เหลือง / เขียว
const statusColor: Record<ReportStatus, string> = {
  PENDING: "badge-error",
  IN_PROGRESS: "badge-warning",
  RESOLVED: "badge-success",
};

const priorityColor: Record<Priority, string> = {
  LOW: "badge-ghost",
  MEDIUM: "badge-neutral",
  HIGH: "badge-error",
};

const roleColor: Record<Role, string> = {
  CITIZEN: "badge-ghost",
  STAFF: "badge-info",
  ADMIN: "badge-secondary",
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  return <span className={`badge ${statusColor[status]} whitespace-nowrap`}>{STATUS_LABEL[status]}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`badge badge-outline ${priorityColor[priority]} whitespace-nowrap`}>
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

export function RoleBadge({ role }: { role: Role }) {
  return <span className={`badge badge-sm ${roleColor[role]} whitespace-nowrap`}>{ROLE_LABEL[role]}</span>;
}
