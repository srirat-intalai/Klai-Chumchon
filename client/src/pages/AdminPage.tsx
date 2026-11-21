import { useState } from "react";
import { Link } from "react-router";
import { Pencil, RefreshCw, Trash2 } from "lucide-react";
import { useDeleteReport, useReports } from "../hooks/useReports";
import { useMe, useUpdateRole, useUsers } from "../hooks/useAuth";
import { useUiStore } from "../stores/useUiStore";
import { PriorityBadge, RoleBadge, StatusBadge } from "../components/Badges";
import { CategoryLabel } from "../components/CategoryIcon";
import StatusModal from "../components/StatusModal";
import { EmptyState, ErrorAlert, TableSkeleton } from "../components/Feedback";
import ConfirmModal from "../components/ConfirmModal";
import { StatusPills } from "../components/FilterPills";
import { ROLE_LABEL } from "../types";
import type { Report, ReportStatus, Role } from "../types";
import { formatDate } from "../utils";

// แท็บจัดการเรื่อง: ตาราง (จอใหญ่) / การ์ด (มือถือ) พร้อมปุ่มอัปเดตสถานะ แก้ไข ลบ
function ReportsTab({ isAdmin }: { isAdmin: boolean }) {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "">("");
  const [target, setTarget] = useState<Report | null>(null);
  const [statusTarget, setStatusTarget] = useState<Report | null>(null);

  const reports = useReports({ search: "", status: statusFilter, categoryId: 0 }, true);
  const deleteReport = useDeleteReport();
  const showToast = useUiStore((s) => s.showToast);
  const removeBookmark = useUiStore((s) => s.removeBookmark);

  // กดยืนยันลบในกล่อง confirm
  function confirmDelete() {
    if (!target) return;
    const id = target.id;
    deleteReport.mutate(id, {
      onSuccess: () => {
        removeBookmark(id);
        showToast(`ลบเรื่อง #${id} แล้ว`);
        setTarget(null);
      },
      onError: (err) => {
        showToast(err.message, "error");
        setTarget(null);
      },
    });
  }

  return (
    <div className="space-y-4">
      <StatusPills value={statusFilter} onChange={setStatusFilter} />

      {reports.isLoading && <TableSkeleton />}
      {reports.isError && <ErrorAlert message={reports.error.message} onRetry={() => reports.refetch()} />}
      {reports.data && reports.data.length === 0 && <EmptyState text="ไม่มีเรื่องในสถานะนี้" />}

      {/* มือถือ: การ์ดเรียงลง ปุ่มใหญ่กดง่าย (เจ้าหน้าที่ภาคสนาม) */}
      {reports.data && reports.data.length > 0 && (
        <ul className="sm:hidden space-y-3" aria-label="รายการเรื่องที่แจ้ง">
          {reports.data.map((r) => (
            <li key={r.id} className="bg-base-100 border border-base-300 rounded-box p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <Link to={`/reports/${r.id}`} className="font-semibold leading-snug hover:underline underline-offset-4">
                  <span className="text-base-content/70 font-normal tabular">#{r.id}</span> {r.title}
                </Link>
                <StatusBadge status={r.status} />
              </div>
              <div className="text-sm text-base-content/80 flex flex-wrap items-center gap-x-3 gap-y-1">
                <CategoryLabel category={r.category} />
                <PriorityBadge priority={r.priority} />
              </div>
              <p className="text-sm text-base-content/70">
                {r.reporter.name} · {formatDate(r.createdAt)}
              </p>
              <div className="flex items-center gap-2">
                <button className="btn btn-neutral flex-1 h-11 min-h-11" onClick={() => setStatusTarget(r)}>
                  <RefreshCw size={16} aria-hidden="true" /> อัปเดตสถานะ
                </button>
                <Link to={`/reports/${r.id}/edit`} className="btn btn-square btn-ghost border border-base-300 size-11" aria-label={`แก้ไขเรื่อง #${r.id}`}>
                  <Pencil size={16} aria-hidden="true" />
                </Link>
                {isAdmin && (
                  <button
                    className="btn btn-square btn-ghost border border-base-300 size-11 text-error ml-2"
                    onClick={() => setTarget(r)}
                    aria-label={`ลบเรื่อง #${r.id}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* จอใหญ่: ตาราง */}
      {reports.data && reports.data.length > 0 && (
        <div className="hidden sm:block overflow-x-auto bg-base-100 rounded-box border border-base-300">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>#</th>
                <th>เรื่อง</th>
                <th className="hidden md:table-cell">หมวด</th>
                <th className="hidden sm:table-cell">ความเร่งด่วน</th>
                <th>สถานะ</th>
                <th className="text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {reports.data.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td className="min-w-48">
                    <Link to={`/reports/${r.id}`} className="link link-hover font-medium">
                      {r.title}
                    </Link>
                    <div className="text-xs text-base-content/70">
                      {r.reporter.name} · {formatDate(r.createdAt)}
                    </div>
                  </td>
                  <td className="hidden md:table-cell whitespace-nowrap">
                    <CategoryLabel category={r.category} />
                  </td>
                  <td className="hidden sm:table-cell">
                    <PriorityBadge priority={r.priority} />
                  </td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td>
                    {/* ปุ่มลบแยกออกไปท้ายสุด เว้นระยะ กันกดพลาด */}
                    <div className="flex items-center justify-end gap-2">
                      <button className="btn btn-sm btn-ghost border border-base-300 hover:border-base-content/40" onClick={() => setStatusTarget(r)}>
                        <RefreshCw size={14} aria-hidden="true" />
                        <span className="hidden sm:inline">อัปเดตสถานะ</span>
                      </button>
                      <Link
                        to={`/reports/${r.id}/edit`}
                        className="btn btn-sm btn-ghost"
                        aria-label={`แก้ไขเรื่อง #${r.id}`}
                        title="แก้ไข"
                      >
                        <Pencil size={15} aria-hidden="true" />
                      </Link>
                      {isAdmin && (
                        <button
                          className="btn btn-sm btn-ghost text-error ml-3"
                          onClick={() => setTarget(r)}
                          aria-label={`ลบเรื่อง #${r.id}`}
                          title="ลบ"
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {statusTarget && <StatusModal report={statusTarget} onClose={() => setStatusTarget(null)} />}

      <ConfirmModal
        open={target !== null}
        title="ยืนยันการลบ"
        text={target ? `ลบเรื่อง "${target.title}" รวมถึงความคิดเห็นและประวัติสถานะ?` : ""}
        pending={deleteReport.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}

// แท็บผู้ใช้ (แอดมินเท่านั้น) เปลี่ยนบทบาทได้ แต่ห้ามเปลี่ยนของตัวเอง
function UsersTab({ myId }: { myId: number }) {
  const users = useUsers();
  const updateRole = useUpdateRole();
  const showToast = useUiStore((s) => s.showToast);

  // เลือกบทบาทใหม่จาก dropdown แล้วส่งไป server
  function changeRole(id: number, role: Role) {
    updateRole.mutate(
      { id, role },
      {
        onSuccess: (u) => showToast(`${u.name} เป็น ${ROLE_LABEL[role]} แล้ว`),
        onError: (err) => showToast(err.message, "error"),
      }
    );
  }

  if (users.isLoading) return <TableSkeleton />;
  if (users.isError) return <ErrorAlert message={users.error.message} onRetry={() => users.refetch()} />;

  return (
    <div className="overflow-x-auto bg-base-100 rounded-box border border-base-300">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>ชื่อ</th>
            <th className="hidden sm:table-cell">อีเมล</th>
            <th className="hidden md:table-cell">เรื่องที่แจ้ง</th>
            <th>บทบาท</th>
          </tr>
        </thead>
        <tbody>
          {users.data?.map((u) => (
            <tr key={u.id}>
              <td>
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-base-content/70 sm:hidden">{u.email}</div>
              </td>
              <td className="hidden sm:table-cell">{u.email}</td>
              <td className="hidden md:table-cell">{u._count ? u._count.reports : 0}</td>
              <td>
                {u.id === myId ? (
                  <span className="flex items-center gap-1">
                    <RoleBadge role={u.role} /> <span className="text-xs">(คุณ)</span>
                  </span>
                ) : (
                  <select
                    className="select select-bordered select-xs"
                    value={u.role}
                    disabled={updateRole.isPending}
                    onChange={(e) => changeRole(u.id, e.target.value as Role)}
                  >
                    <option value="CITIZEN">{ROLE_LABEL.CITIZEN}</option>
                    <option value="STAFF">{ROLE_LABEL.STAFF}</option>
                    <option value="ADMIN">{ROLE_LABEL.ADMIN}</option>
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// อยู่ใต้ RequireAuth(STAFF, ADMIN) แล้ว
export default function AdminPage() {
  const { user } = useMe();
  const [tab, setTab] = useState<"reports" | "users">("reports");
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">จัดการระบบ</h1>
        <p className="text-base-content/70 text-sm">
          {isAdmin ? "อัปเดตสถานะ แก้ไข ลบเรื่อง และกำหนดสิทธิ์ผู้ใช้" : "อัปเดตสถานะและแก้ไขเรื่องที่แจ้ง"}
        </p>
      </div>

      {isAdmin && (
        <div role="tablist" className="tabs tabs-box w-fit">
          <button role="tab" aria-selected={tab === "reports"} className={`tab ${tab === "reports" ? "tab-active" : ""}`} onClick={() => setTab("reports")}>
            เรื่องที่แจ้ง
          </button>
          <button role="tab" aria-selected={tab === "users"} className={`tab ${tab === "users" ? "tab-active" : ""}`} onClick={() => setTab("users")}>
            ผู้ใช้
          </button>
        </div>
      )}

      {tab === "users" && isAdmin && user ? <UsersTab myId={user.id} /> : <ReportsTab isAdmin={isAdmin} />}
    </div>
  );
}
