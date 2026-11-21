import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, ArrowRight, SearchX, Clock, ExternalLink, History, Map as MapIcon, MapPin, MessageCircle, Pencil, Star, User } from "lucide-react";
import { useAddComment, useDeleteComment, useDeleteReport, useReport } from "../hooks/useReports";
import { useMe } from "../hooks/useAuth";
import { ApiError } from "../api/reportApi";
import { useUiStore } from "../stores/useUiStore";
import { PriorityBadge, RoleBadge, StatusBadge } from "../components/Badges";
import { DetailSkeleton, ErrorAlert } from "../components/Feedback";
import { SingleMap } from "../components/MapView";
import AirQualityCard from "../components/AirQualityCard";
import ConfirmModal from "../components/ConfirmModal";
import StatusModal from "../components/StatusModal";
import { CategoryLabel } from "../components/CategoryIcon";
import { STATUS_LABEL } from "../types";

import { formatDate, imageSrc, STATUS_COLOR } from "../utils";

// หน้ารายละเอียดเรื่อง: รูป แผนที่ ค่าฝุ่น ประวัติสถานะ และคอมเมนต์
export default function ReportDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const navigate = useNavigate();

  const report = useReport(id);
  const addComment = useAddComment(id);
  const deleteComment = useDeleteComment(id);
  const deleteReport = useDeleteReport();
  const { user } = useMe();

  const bookmarks = useUiStore((s) => s.bookmarks);
  const toggleBookmark = useUiStore((s) => s.toggleBookmark);
  const removeBookmark = useUiStore((s) => s.removeBookmark);
  const showToast = useUiStore((s) => s.showToast);

  const [message, setMessage] = useState("");
  const [commentError, setCommentError] = useState("");
  const [askDelete, setAskDelete] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  if (!Number.isInteger(id) || id <= 0) {
    return <ErrorAlert message="รหัสเรื่องไม่ถูกต้อง" />;
  }
  if (report.isLoading) return <DetailSkeleton />;
  // ไม่พบเรื่อง (ถูกลบ/ลิงก์ผิด): บอกตรง ๆ ไม่ใช่ error ที่กดลองใหม่แล้วก็ไม่หาย
  if (report.error instanceof ApiError && report.error.status === 404) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <SearchX size={48} aria-hidden="true" className="mx-auto opacity-60" />
        <h1 className="text-2xl font-semibold">ไม่พบเรื่องนี้</h1>
        <p className="text-base-content/80">เรื่องรหัส #{id} อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</p>
        <Link to="/reports" className="btn btn-neutral">
          <ArrowLeft size={16} aria-hidden="true" /> ดูเรื่องที่แจ้งทั้งหมด
        </Link>
      </div>
    );
  }
  if (report.isError || !report.data) {
    return (
      <div className="space-y-4">
        <ErrorAlert message={report.error?.message || "ไม่พบข้อมูล"} onRetry={() => report.refetch()} />
        <Link to="/reports" className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} aria-hidden="true" /> กลับไปหน้ารายการ
        </Link>
      </div>
    );
  }

  const r = report.data;
  const saved = bookmarks.includes(r.id);

  // สิทธิ์ตรงกับหลังบ้าน (หลังบ้านเช็กซ้ำอีกที ตรงนี้แค่ซ่อนปุ่ม)
  const isStaff = user?.role === "STAFF" || user?.role === "ADMIN";
  // log เรียงจากเก่าไปใหม่ ตัวสุดท้ายคือความเคลื่อนไหวล่าสุด
  const latest = r.statusLogs.length > 0 ? r.statusLogs[r.statusLogs.length - 1] : null;
  const isOwnerPending = user?.id === r.reporterId && r.status === "PENDING";
  const canEdit = isStaff || isOwnerPending;
  const canDelete = user?.role === "ADMIN" || isOwnerPending;

  // ส่งคอมเมนต์ใหม่ ว่างอยู่ไม่ให้ส่ง
  function sendComment(e: FormEvent) {
    e.preventDefault();
    // ไม่ disable ปุ่ม แต่บอกเหตุผลแทน จะได้ไม่ดูเหมือนปุ่มเสีย
    if (message.trim() === "") {
      setCommentError("กรุณาพิมพ์ความคิดเห็นก่อนส่ง");
      return;
    }
    setCommentError("");
    addComment.mutate(message, {
      onSuccess: () => {
        setMessage("");
        showToast("ส่งความคิดเห็นแล้ว");
      },
    });
  }

  // ยืนยันลบเรื่องนี้ ลบเสร็จกลับไปหน้ารายการ
  function confirmDelete() {
    deleteReport.mutate(r.id, {
      onSuccess: () => {
        removeBookmark(r.id);
        showToast("ลบเรื่องแล้ว");
        navigate("/reports");
      },
      onError: (err) => {
        setAskDelete(false);
        showToast(err.message, "error");
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link to="/">หน้าแรก</Link>
          </li>
          <li>
            <Link to="/reports">เรื่องที่แจ้ง</Link>
          </li>
          <li>#{r.id}</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ฝั่งซ้าย: ข้อมูลหลัก + ความคิดเห็น */}
        <div className="lg:col-span-2 space-y-6">
          <article className="card bg-base-100 border border-base-300">
            {r.imageUrl && (
              <figure className="max-h-96 bg-base-200">
                <img src={imageSrc(r.imageUrl)} alt={r.title} className="w-full object-cover" />
              </figure>
            )}
            <div className="card-body gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge badge-lg badge-ghost">
                  <CategoryLabel category={r.category} />
                </span>
                <StatusBadge status={r.status} />
                <PriorityBadge priority={r.priority} />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold">{r.title}</h1>

              {/* ความเคลื่อนไหวล่าสุด: คำตอบแรกที่ผู้แจ้งอยากรู้ (เจ้าหน้าที่ว่ายังไง) */}
              {latest && (
                <section aria-labelledby="latest-update" className="-mx-[var(--card-p,1.5rem)] px-[var(--card-p,1.5rem)] py-4 border-y border-base-300 bg-secondary/40 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 id="latest-update" className="text-sm font-semibold flex flex-wrap items-center gap-2">
                      ความเคลื่อนไหวล่าสุด
                      {latest.fromStatus ? (
                        <span className="inline-flex items-center gap-1.5 font-normal">
                          <StatusBadge status={latest.fromStatus} />
                          <ArrowRight size={14} aria-label="เปลี่ยนเป็น" />
                          <StatusBadge status={latest.toStatus} />
                        </span>
                      ) : (
                        <StatusBadge status={latest.toStatus} />
                      )}
                    </h2>
                    {isStaff && (
                      <button className="btn btn-primary w-full sm:w-auto" onClick={() => setShowStatus(true)}>
                        อัปเดตสถานะ
                      </button>
                    )}
                  </div>
                  {latest.note && <p className="leading-relaxed">“{latest.note}”</p>}
                  <p className="text-sm text-base-content/80 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="inline-flex items-center gap-1.5">
                      {latest.changedBy.name} <RoleBadge role={latest.changedBy.role} />
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{formatDate(latest.createdAt)}</span>
                  </p>
                </section>
              )}

              <p className="whitespace-pre-line leading-relaxed">{r.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm bg-base-200 rounded-box p-4">
                <p className="flex gap-2"><MapPin size={16} aria-hidden="true" className="mt-0.5 shrink-0" /><span><b>จุดสังเกต:</b> {r.location}</span></p>
                {r.address && (
                  <p className="flex gap-2 sm:col-span-2"><MapIcon size={16} aria-hidden="true" className="mt-0.5 shrink-0" /><span><b>ที่อยู่:</b> {r.address}</span></p>
                )}
                <p className="flex gap-2"><User size={16} aria-hidden="true" className="mt-0.5 shrink-0" /><span><b>ผู้แจ้ง:</b> {r.reporter.name}</span></p>
                <p className="flex gap-2"><Clock size={16} aria-hidden="true" className="mt-0.5 shrink-0" /><span><b>แจ้งเมื่อ:</b> {formatDate(r.createdAt)}</span></p>
                <p className="flex gap-2"><Pencil size={16} aria-hidden="true" className="mt-0.5 shrink-0" /><span><b>อัปเดตล่าสุด:</b> {formatDate(r.updatedAt)}</span></p>
              </div>

              <div className="card-actions justify-between flex-wrap gap-2">
                <button
                  className={`btn ${saved ? "btn-secondary" : "btn-outline"}`}
                  onClick={() => toggleBookmark(r.id)}
                  aria-pressed={saved}
                >
                  <Star size={16} aria-hidden="true" fill={saved ? "currentColor" : "none"} />
                  {saved ? "กำลังติดตาม" : "ติดตามเรื่องนี้"}
                </button>
                <div className="flex gap-4">
                  {canEdit && (
                    <Link to={`/reports/${r.id}/edit`} className="btn btn-outline">
                      แก้ไข
                    </Link>
                  )}
                  {canDelete && (
                    <button className="btn btn-outline btn-error" onClick={() => setAskDelete(true)}>
                      ลบ
                    </button>
                  )}
                </div>
              </div>
            </div>
          </article>

          <section aria-labelledby="history-title" className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h2 id="history-title" className="card-title">
                <History size={20} aria-hidden="true" /> ประวัติสถานะ ({r.statusLogs.length})
              </h2>
              <ol className="mt-1">
                {r.statusLogs.map((log, i) => (
                  <li key={log.id} className="relative flex gap-4 pb-5 last:pb-0">
                    {/* เส้นเชื่อมระหว่างจุด */}
                    {i < r.statusLogs.length - 1 && (
                      <span className="absolute left-[7px] top-5 bottom-0 w-0.5 bg-base-300" aria-hidden="true" />
                    )}
                    <span
                      className="relative mt-1 block w-4 h-4 shrink-0 rounded-full ring-4 ring-base-100"
                      style={{ background: STATUS_COLOR[log.toStatus] }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium flex flex-wrap items-center gap-1.5">
                        {log.fromStatus ? (
                          <>
                            {STATUS_LABEL[log.fromStatus]}
                            <ArrowRight size={14} aria-label="เปลี่ยนเป็น" />
                            {STATUS_LABEL[log.toStatus]}
                          </>
                        ) : (
                          <>แจ้งเรื่อง · {STATUS_LABEL[log.toStatus]}</>
                        )}
                      </p>
                      {log.note && <p className="text-base-content/80">{log.note}</p>}
                      <p className="text-sm text-base-content/70">
                        {log.changedBy.name} · {formatDate(log.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h2 className="card-title">
                <MessageCircle size={20} aria-hidden="true" /> ความคิดเห็น ({r.comments.length})
              </h2>

              {r.comments.length === 0 && <p className="text-base-content/70 text-sm">ยังไม่มีความคิดเห็น</p>}
              <ul className="space-y-3">
                {r.comments.map((c) => (
                  <li key={c.id} className="bg-base-200 rounded-box p-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-medium text-sm flex items-center gap-2 flex-wrap">
                          {c.author.name} <RoleBadge role={c.author.role} />
                        </p>
                        <p className="text-xs text-base-content/70">{formatDate(c.createdAt)}</p>
                      </div>
                      {user && (user.id === c.author.id || user.role === "ADMIN") && (
                        <button
                          className="btn btn-ghost btn-xs text-error"
                          disabled={deleteComment.isPending}
                          onClick={() =>
                            deleteComment.mutate(c.id, {
                              onSuccess: () => showToast("ลบความคิดเห็นแล้ว"),
                              onError: (err) => showToast(err.message, "error"),
                            })
                          }
                        >
                          ลบ
                        </button>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-line">{c.message}</p>
                  </li>
                ))}
              </ul>

              {user ? (
                <form onSubmit={sendComment} className="mt-4 space-y-2">
                  <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder={`แสดงความคิดเห็นในชื่อ ${user.name}`}
                    value={message}
                    maxLength={1000}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (commentError) setCommentError("");
                    }}
                  />
                  {(commentError || addComment.isError) && (
                    <p className="text-error text-sm">{commentError || addComment.error?.message}</p>
                  )}
                  <button className="btn btn-neutral btn-sm" disabled={addComment.isPending}>
                    {addComment.isPending ? "กำลังส่ง..." : "ส่งความคิดเห็น"}
                  </button>
                </form>
              ) : (
                <p className="mt-4 text-sm">
                  <Link to={`/login?next=/reports/${r.id}`} className="link font-medium underline-offset-4">
                    เข้าสู่ระบบ
                  </Link>{" "}
                  เพื่อแสดงความคิดเห็น
                </p>
              )}
            </div>
          </section>
        </div>

        {/* ฝั่งขวา: ข้อมูลประกอบ (แผนที่ แล้วค่าฝุ่น) */}
        <aside className="space-y-6">
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4 gap-2">
              <h2 className="font-semibold flex items-center gap-2">
                <MapIcon size={18} aria-hidden="true" /> ตำแหน่ง
              </h2>
              <SingleMap lat={r.latitude} lng={r.longitude} status={r.status} />
              <a
                href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="link font-medium underline-offset-4 text-sm inline-flex items-center gap-1"
              >
                เปิดใน Google Maps <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          </div>

          <AirQualityCard lat={r.latitude} lng={r.longitude} />


        </aside>
      </div>

      {showStatus && <StatusModal report={r} onClose={() => setShowStatus(false)} />}

      <ConfirmModal
        open={askDelete}
        title="ลบเรื่องนี้?"
        text={`"${r.title}" รวมถึงความคิดเห็นและประวัติสถานะทั้งหมดจะถูกลบถาวร`}
        pending={deleteReport.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setAskDelete(false)}
      />
    </div>
  );
}
