import { PRIORITY_LABEL, STATUS_LABEL } from "../types";
import type { Priority, ReportStatus } from "../types";

const statusColor: Record<ReportStatus, string> = {
  PENDING: "badge-warning",
  IN_PROGRESS: "badge-info",
  RESOLVED: "badge-success",
};

const priorityColor: Record<Priority, string> = {
  LOW: "badge-ghost",
  MEDIUM: "badge-neutral",
  HIGH: "badge-error",
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
