import { Link } from "react-router";
import { Clock, MapPin, MessageCircle, Star } from "lucide-react";
import { useUiStore } from "../stores/useUiStore";
import { PriorityBadge, StatusBadge } from "./Badges";
import CategoryIcon from "./CategoryIcon";
import type { Report } from "../types";
import { categoryColor, formatDate, imageSrc } from "../utils";

export default function ReportCard({ report }: { report: Report }) {
  const bookmarks = useUiStore((s) => s.bookmarks);
  const toggleBookmark = useUiStore((s) => s.toggleBookmark);
  const saved = bookmarks.includes(report.id);
  const color = categoryColor(report.category);

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* มีรูปโชว์รูป ไม่มีรูปโชว์แถบสีประจำหมวดพร้อมไอคอน */}
      {report.imageUrl ? (
        <figure className="h-36 bg-base-200">
          <img src={imageSrc(report.imageUrl)} alt="" loading="lazy" className="w-full h-full object-cover" />
        </figure>
      ) : (
        <div className="h-14 flex items-center px-5" style={{ background: color + "1f" }}>
          <CategoryIcon category={report.category} size={26} />
        </div>
      )}

      <div className="card-body p-5 gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-sm text-base-content/80">{report.category.name}</span>
          <StatusBadge status={report.status} />
        </div>

        <h3 className="card-title text-base leading-snug line-clamp-2">{report.title}</h3>
        <p className="text-sm text-base-content/80 line-clamp-2">{report.description}</p>

        <div className="text-[13px] text-base-content/70 space-y-1">
          <p className="flex items-center gap-1.5">
            <MapPin size={14} aria-hidden="true" className="shrink-0" />
            <span className="line-clamp-1">{report.location}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Clock size={14} aria-hidden="true" className="shrink-0" />
            {formatDate(report.createdAt)}
            <span aria-hidden="true">·</span>
            <MessageCircle size={14} aria-hidden="true" className="shrink-0" />
            <span>
              {report._count?.comments ?? 0}
              <span className="sr-only"> ความคิดเห็น</span>
            </span>
          </p>
        </div>

        <div className="card-actions items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={report.priority} />
            <button
              className={`btn btn-sm btn-circle ${saved ? "btn-warning" : "btn-ghost"}`}
              onClick={() => toggleBookmark(report.id)}
              aria-label={saved ? "เลิกติดตามเรื่องนี้" : "ติดตามเรื่องนี้"}
              aria-pressed={saved}
              title={saved ? "เลิกติดตาม" : "ติดตามเรื่องนี้"}
            >
              <Star size={16} aria-hidden="true" fill={saved ? "currentColor" : "none"} />
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
