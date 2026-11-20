import { Link } from "react-router";
import { useUiStore } from "../stores/useUiStore";
import { PriorityBadge, StatusBadge } from "./Badges";
import type { Report } from "../types";
import { formatDate } from "../utils";

export default function ReportCard({ report }: { report: Report }) {
  const bookmarks = useUiStore((s) => s.bookmarks);
  const toggleBookmark = useUiStore((s) => s.toggleBookmark);
  const saved = bookmarks.includes(report.id);

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body p-5 gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-sm text-base-content/70">
            {report.category.icon} {report.category.name}
          </span>
          <StatusBadge status={report.status} />
        </div>

        <h3 className="card-title text-base leading-snug line-clamp-2">{report.title}</h3>
        <p className="text-sm text-base-content/70 line-clamp-2">{report.description}</p>

        <div className="text-xs text-base-content/60 space-y-1">
          <p>📍 {report.location}</p>
          <p>🕒 {formatDate(report.createdAt)} · 💬 {report._count?.comments ?? 0}</p>
        </div>

        <div className="card-actions items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={report.priority} />
            <button
              className={`btn btn-xs btn-circle ${saved ? "btn-warning" : "btn-ghost"}`}
              onClick={() => toggleBookmark(report.id)}
              aria-label={saved ? "เลิกติดตาม" : "ติดตามเรื่องนี้"}
              title={saved ? "เลิกติดตาม" : "ติดตามเรื่องนี้"}
            >
              {saved ? "★" : "☆"}
            </button>
          </div>
          <Link to={`/reports/${report.id}`} className="btn btn-sm btn-primary btn-outline">
            ดูรายละเอียด
          </Link>
        </div>
      </div>
    </div>
  );
}
