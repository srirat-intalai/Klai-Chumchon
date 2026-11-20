import { useState } from "react";
import { Link } from "react-router";
import { useDeleteReport, useReports, useUpdateStatus } from "../hooks/useReports";
import { useMe, useUpdateRole, useUsers } from "../hooks/useAuth";
import { useUiStore } from "../stores/useUiStore";
import { PriorityBadge, RoleBadge } from "../components/Badges";
import { EmptyState, ErrorAlert, TableSkeleton } from "../components/Feedback";
import ConfirmModal from "../components/ConfirmModal";
import { ROLE_LABEL, STATUS_LABEL } from "../types";
import type { Report, ReportStatus, Role } from "../types";
import { formatDate } from "../utils";

function ReportsTab({ isAdmin }: { isAdmin: boolean }) {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "">("");
  const [target, setTarget] = useState<Report | null>(null);

  const reports = useReports({ search: "", status: statusFilter, categoryId: 0 });
  const updateStatus = useUpdateStatus();
  const deleteReport = useDeleteReport();
  const showToast = useUiStore((s) => s.showToast);
  const removeBookmark = useUiStore((s) => s.removeBookmark);

  function changeStatus(id: number, status: ReportStatus) {
    updateStatus.mutate(
      { id, status, note: "" },
      {
        onSuccess: () => showToast(`เปลี่ยนสถานะเรื่อง #${id} เป็น "${STATUS_LABEL[status]}"`),
        onError: (err) => showToast(err.message, "error"),
      }
    );
  }

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
      <select
        className="select select-bordered select-sm"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as ReportStatus | "")}
      >
        <option value="">ทุกสถานะ</option>
        <option value="PENDING">{STATUS_LABEL.PENDING}</option>
        <option value="IN_PROGRESS">{STATUS_LABEL.IN_PROGRESS}</option>
        <option value="RESOLVED">{STATUS_LABEL.RESOLVED}</option>
      </select>

      {reports.isLoading && <TableSkeleton />}
      {reports.isError && <ErrorAlert message={reports.error.message} onRetry={() => reports.refetch()} />}
      {reports.data && reports.data.length === 0 && <EmptyState text="ไม่มีเรื่องในสถานะนี้" />}

      {reports.data && reports.data.length > 0 && (
        <div className="overflow-x-auto bg-base-100 rounded-box border border-base-300">
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
                    <div className="text-xs text-base-content/50">
                      {r.reporter.name} · {formatDate(r.createdAt)}
                    </div>
                  </td>
                  <td className="hidden md:table-cell whitespace-nowrap">
                    {r.category.icon} {r.category.name}
                  </td>
                  <td className="hidden sm:table-cell">
                    <PriorityBadge priority={r.priority} />
                  </td>
                  <td>
                    <select
                      className="select select-bordered select-xs"
                      value={r.status}
                      disabled={updateStatus.isPending}
                      onChange={(e) => changeStatus(r.id, e.target.value as ReportStatus)}
                    >
                      <option value="PENDING">{STATUS_LABEL.PENDING}</option>
                      <option value="IN_PROGRESS">{STATUS_LABEL.IN_PROGRESS}</option>
                      <option value="RESOLVED">{STATUS_LABEL.RESOLVED}</option>
                    </select>
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <Link to={`/reports/${r.id}/edit`} className="btn btn-ghost btn-xs">
                      แก้ไข
                    </Link>
                    {isAdmin && (
                      <button className="btn btn-ghost btn-xs text-error" onClick={() => setTarget(r)}>
                        ลบ
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

function UsersTab({ myId }: { myId: number }) {
  const users = useUsers();
  const updateRole = useUpdateRole();
  const showToast = useUiStore((s) => s.showToast);

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
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.data?.map((u) => (
            <tr key={u.id}>
              <td>
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-base-content/50 sm:hidden">{u.email}</div>
              </td>
              <td className="hidden sm:table-cell">{u.email}</td>
              <td className="hidden md:table-cell">{u._count?.reports ?? 0}</td>
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
        <p className="text-base-content/60 text-sm">
          {isAdmin ? "อัปเดตสถานะ แก้ไข ลบเรื่อง และกำหนดสิทธิ์ผู้ใช้" : "อัปเดตสถานะและแก้ไขเรื่องที่แจ้ง"}
        </p>
      </div>

      {isAdmin && (
        <div role="tablist" className="tabs tabs-box w-fit">
          <button role="tab" className={`tab ${tab === "reports" ? "tab-active" : ""}`} onClick={() => setTab("reports")}>
            เรื่องที่แจ้ง
          </button>
          <button role="tab" className={`tab ${tab === "users" ? "tab-active" : ""}`} onClick={() => setTab("users")}>
            ผู้ใช้
          </button>
        </div>
      )}

      {tab === "users" && isAdmin && user ? <UsersTab myId={user.id} /> : <ReportsTab isAdmin={isAdmin} />}
    </div>
  );
}
