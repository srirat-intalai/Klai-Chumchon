import { Link } from "react-router";
import { Clock, MapPin, MessageCircle, Star } from "lucide-react";
import { useUiStore } from "../stores/useUiStore";
import { PriorityBadge, StatusBadge } from "./Badges";
import CategoryIcon from "./CategoryIcon";
import { STATUS_LABEL } from "../types";
import type { Report } from "../types";
import { formatDate, formatDistance, imageSrc, timeAgo } from "../utils";

// distanceKm: ระยะจากผู้ใช้ (มีเฉพาะตอนเรียงแบบ "ใกล้ฉัน")
// showLatest: โชว์ความเคลื่อนไหวล่าสุดบนการ์ดด้วย (ใช้ในหน้าเรื่องของฉัน)
export default function ReportCard({ report, distanceKm, showLatest }: { report: Report; distanceKm?: number; showLatest?: boolean }) {
  const bookmarks = useUiStore((s) => s.bookmarks);
  const toggleBookmark = useUiStore((s) => s.toggleBookmark);
  const saved = bookmarks.includes(report.id);

  // ประวัติอันล่าสุด (server ส่งมาให้ 1 อัน)
  let latest = null;
  if (report.statusLogs && report.statusLogs.length > 0) {
    latest = report.statusLogs[0];
  }

  return (
    <div className="card bg-base-100 border border-base-300 hover:border-base-content/40 transition-colors overflow-hidden">
      {/* มีรูปค่อยโชว์รูป */}
      {report.imageUrl && (
        <figure className="h-36 bg-base-200">
          <img src={imageSrc(report.imageUrl)} alt="" loading="lazy" className="w-full h-full object-cover" />
        </figure>
      )}

      <div className="card-body p-5 gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-sm text-base-content/80 inline-flex items-center gap-1.5">
            <CategoryIcon category={report.category} />
            {report.category.name}
          </span>
          <StatusBadge status={report.status} />
        </div>

        <h3 className="card-title text-base leading-snug line-clamp-2">{report.title}</h3>
        <p className="text-sm text-base-content/80 line-clamp-2">{report.description}</p>

        {/* ความเคลื่อนไหวล่าสุด: ผู้แจ้งจะได้ไม่ต้องกดเข้าไปดูทีละเรื่อง */}
        {showLatest && latest && (
          <div className="rounded-box bg-secondary/40 px-3 py-2 text-sm">
            {latest.fromStatus === null ? (
              <p className="font-medium">รอเจ้าหน้าที่รับเรื่อง</p>
            ) : (
              <p className="font-medium">
                {latest.changedBy.name} เปลี่ยนเป็น "{STATUS_LABEL[latest.toStatus]}"
              </p>
            )}
            {latest.fromStatus !== null && latest.note && <p className="line-clamp-2 text-base-content/80">"{latest.note}"</p>}
            <p className="text-xs text-base-content/75">อัปเดต {timeAgo(latest.createdAt)}</p>
          </div>
        )}

        <div className="text-[13px] text-base-content/70 space-y-1">
          <p className="flex items-center gap-1.5">
            <MapPin size={14} aria-hidden="true" className="shrink-0" />
            <span className="line-clamp-1">{report.location}</span>
            {distanceKm !== undefined && (
              <span className="shrink-0 font-semibold text-base-content tabular">· ห่าง {formatDistance(distanceKm)}</span>
            )}
          </p>
          <p className="flex items-center gap-1.5">
            <Clock size={14} aria-hidden="true" className="shrink-0" />
            {formatDate(report.createdAt)}
            <span aria-hidden="true">·</span>
            <MessageCircle size={14} aria-hidden="true" className="shrink-0" />
            <span>
              {report._count ? report._count.comments : 0}
              <span className="sr-only"> ความคิดเห็น</span>
            </span>
          </p>
        </div>

        <div className="card-actions items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={report.priority} />
            <button
              className={`btn btn-sm btn-circle ${saved ? "btn-secondary" : "btn-ghost"}`}
              onClick={() => toggleBookmark(report.id)}
              aria-label={saved ? "เลิกติดตามเรื่องนี้" : "ติดตามเรื่องนี้"}
              aria-pressed={saved}
              title={saved ? "เลิกติดตาม" : "ติดตามเรื่องนี้"}
            >
              <Star size={16} aria-hidden="true" fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
          <Link
            to={`/reports/${report.id}`}
            aria-label={"ดูรายละเอียด: " + report.title}
            className="btn btn-sm btn-ghost border border-base-300 hover:border-base-content/40"
          >
            ดูรายละเอียด
          </Link>
        </div>
      </div>
    </div>
  );
}
