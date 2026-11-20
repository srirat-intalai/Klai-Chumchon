import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAddComment, useDeleteComment, useDeleteReport, useReport } from "../hooks/useReports";
import { useUiStore } from "../stores/useUiStore";
import { PriorityBadge, StatusBadge } from "../components/Badges";
import { DetailSkeleton, ErrorAlert } from "../components/Feedback";
import ConfirmModal from "../components/ConfirmModal";
import { formatDate } from "../utils";

export default function ReportDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const navigate = useNavigate();

  const report = useReport(id);
  const addComment = useAddComment(id);
  const deleteComment = useDeleteComment(id);
  const deleteReport = useDeleteReport();

  const bookmarks = useUiStore((s) => s.bookmarks);
  const toggleBookmark = useUiStore((s) => s.toggleBookmark);
  const removeBookmark = useUiStore((s) => s.removeBookmark);
  const showToast = useUiStore((s) => s.showToast);

  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [askDelete, setAskDelete] = useState(false);

  if (!Number.isInteger(id) || id <= 0) {
    return <ErrorAlert message="รหัสเรื่องไม่ถูกต้อง" />;
  }
  if (report.isLoading) return <DetailSkeleton />;
  if (report.isError || !report.data) {
    return (
      <div className="space-y-4">
        <ErrorAlert message={report.error?.message || "ไม่พบข้อมูล"} onRetry={() => report.refetch()} />
        <Link to="/reports" className="btn btn-ghost btn-sm">
          ← กลับไปหน้ารายการ
        </Link>
      </div>
    );
  }

  const r = report.data;
  const saved = bookmarks.includes(r.id);

  function sendComment(e: FormEvent) {
    e.preventDefault();
    if (authorName.trim().length < 2 || message.trim() === "") return;
    addComment.mutate(
      { authorName, message },
      {
        onSuccess: () => {
          setMessage("");
          showToast("ส่งความคิดเห็นแล้ว");
        },
      }
    );
  }

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

      <article className="card bg-base-100 border border-base-300">
        {r.imageUrl && (
          <figure className="max-h-80 bg-base-200">
            <img src={r.imageUrl} alt={r.title} className="w-full object-cover" />
          </figure>
        )}
        <div className="card-body gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-lg">
              {r.category.icon} {r.category.name}
            </span>
            <StatusBadge status={r.status} />
            <PriorityBadge priority={r.priority} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold">{r.title}</h1>
          <p className="whitespace-pre-line leading-relaxed">{r.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm bg-base-200 rounded-box p-4">
            <p>📍 <b>สถานที่:</b> {r.location}</p>
            <p>🙋 <b>ผู้แจ้ง:</b> {r.reporterName}</p>
            <p>🕒 <b>แจ้งเมื่อ:</b> {formatDate(r.createdAt)}</p>
            <p>✏️ <b>อัปเดตล่าสุด:</b> {formatDate(r.updatedAt)}</p>
          </div>

          <div className="card-actions justify-between flex-wrap gap-2">
            <button className={`btn ${saved ? "btn-warning" : "btn-outline"}`} onClick={() => toggleBookmark(r.id)}>
              {saved ? "★ กำลังติดตาม" : "☆ ติดตามเรื่องนี้"}
            </button>
            <div className="flex gap-2">
              <Link to={`/reports/${r.id}/edit`} className="btn btn-outline btn-primary">
                แก้ไข
              </Link>
              <button className="btn btn-outline btn-error" onClick={() => setAskDelete(true)}>
                ลบ
              </button>
            </div>
          </div>
        </div>
      </article>

      <section className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h2 className="card-title">💬 ความคิดเห็น ({r.comments.length})</h2>

          {r.comments.length === 0 && <p className="text-base-content/60 text-sm">ยังไม่มีความคิดเห็น</p>}
          <ul className="space-y-3">
            {r.comments.map((c) => (
              <li key={c.id} className="bg-base-200 rounded-box p-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-medium text-sm">{c.authorName}</p>
                    <p className="text-xs text-base-content/50">{formatDate(c.createdAt)}</p>
                  </div>
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    disabled={deleteComment.isPending}
                    onClick={() => deleteComment.mutate(c.id, { onSuccess: () => showToast("ลบความคิดเห็นแล้ว") })}
                  >
                    ลบ
                  </button>
                </div>
                <p className="mt-2 whitespace-pre-line">{c.message}</p>
              </li>
            ))}
          </ul>

          <form onSubmit={sendComment} className="mt-4 space-y-2">
            <input
              className="input input-bordered w-full sm:w-1/2"
              placeholder="ชื่อของคุณ"
              value={authorName}
              maxLength={100}
              onChange={(e) => setAuthorName(e.target.value)}
            />
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="เขียนความคิดเห็นหรืออัปเดตสถานการณ์"
              value={message}
              maxLength={1000}
              onChange={(e) => setMessage(e.target.value)}
            />
            {addComment.isError && <p className="text-error text-sm">{addComment.error.message}</p>}
            <button
              className="btn btn-primary btn-sm"
              disabled={addComment.isPending || authorName.trim().length < 2 || message.trim() === ""}
            >
              {addComment.isPending ? "กำลังส่ง..." : "ส่งความคิดเห็น"}
            </button>
          </form>
        </div>
      </section>

      <ConfirmModal
        open={askDelete}
        title="ลบเรื่องนี้?"
        text={`"${r.title}" และความคิดเห็นทั้งหมดจะถูกลบถาวร`}
        pending={deleteReport.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setAskDelete(false)}
      />
    </div>
  );
}
