import { useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useUiStore } from "../stores/useUiStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useMe } from "../hooks/useAuth";
import { RoleBadge } from "../components/Badges";

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? "font-semibold text-primary" : "";
}

export default function MainLayout() {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const bookmarkCount = useUiStore((s) => s.bookmarks.length);
  const toast = useUiStore((s) => s.toast);
  const hideToast = useUiStore((s) => s.hideToast);
  const showToast = useUiStore((s) => s.showToast);
  const logout = useAuthStore((s) => s.logout);
  const { user, isLoading } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();

  // เปลี่ยนธีม DaisyUI ที่แท็ก html
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // toast หายเองใน 3 วิ
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(hideToast, 3000);
    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  function handleLogout() {
    logout();
    qc.removeQueries({ queryKey: ["me"] });
    qc.removeQueries({ queryKey: ["users"] });
    showToast("ออกจากระบบแล้ว");
    navigate("/");
  }

  // เมนูเปลี่ยนตาม role
  const menus = [
    { to: "/", label: "หน้าแรก" },
    { to: "/reports", label: "เรื่องที่แจ้ง" },
    { to: "/map", label: "แผนที่" },
    { to: "/bookmarks", label: "ที่ติดตาม" },
  ];
  if (user) menus.push({ to: "/my-reports", label: "เรื่องของฉัน" });
  if (user && user.role !== "CITIZEN") menus.push({ to: "/admin", label: "จัดการระบบ" });
  menus.push({ to: "/about", label: "เกี่ยวกับเรา" });

  const links = menus.map((m) => (
    <li key={m.to}>
      <NavLink to={m.to} end={m.to === "/"} className={navClass}>
        {m.label}
        {m.to === "/bookmarks" && bookmarkCount > 0 && (
          <span className="badge badge-sm badge-warning">{bookmarkCount}</span>
        )}
      </NavLink>
    </li>
  ));

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <header className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-[1000] px-2 sm:px-6">
        <div className="navbar-start">
          {/* เมนูมือถือ */}
          <div className="dropdown xl:hidden">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-square" aria-label="เปิดเมนู">
              ☰
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-40 mt-3 w-52 p-2 shadow">
              {links}
            </ul>
          </div>
          <Link to="/" className="btn btn-ghost text-base sm:text-xl gap-1 px-1 sm:px-2">
            <span>🏘️</span>
            <span className="text-primary font-bold">Klai</span>
            <span className="font-bold">Chumchon</span>
          </Link>
        </div>

        <nav className="navbar-center hidden xl:flex">
          <ul className="menu menu-horizontal px-1 gap-1">{links}</ul>
        </nav>

        <div className="navbar-end gap-1 sm:gap-2">
          <button className="btn btn-ghost btn-circle btn-sm sm:btn-md" onClick={toggleTheme} aria-label="สลับธีม">
            {theme === "emerald" ? "🌙" : "☀️"}
          </button>
          <Link to="/reports/new" className="btn btn-primary btn-sm sm:btn-md" aria-label="แจ้งปัญหา">
            +<span className="hidden sm:inline"> แจ้งปัญหา</span>
          </Link>

          {isLoading && <span className="loading loading-spinner loading-sm" />}
          {!isLoading && !user && (
            <Link to="/login" className="btn btn-ghost btn-sm sm:btn-md">
              เข้าสู่ระบบ
            </Link>
          )}
          {user && (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar avatar-placeholder" aria-label="เมนูผู้ใช้">
                <div className="bg-neutral text-neutral-content w-9 rounded-full">
                  <span>{user.name.charAt(0)}</span>
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-40 mt-3 w-56 p-2 shadow">
                <li className="menu-title">
                  <span className="flex flex-col gap-1">
                    <span className="text-base-content font-semibold">{user.name}</span>
                    <span className="text-xs font-normal">{user.email}</span>
                    <RoleBadge role={user.role} />
                  </span>
                </li>
                <li>
                  <Link to="/my-reports">เรื่องของฉัน</Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="text-error">
                    ออกจากระบบ
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="footer footer-center p-6 bg-base-100 border-t border-base-300 text-sm text-base-content/60">
        <p>Klai Chumchon · ระบบแจ้งปัญหาและติดตามการแก้ไขในชุมชน · CS319 Final Project</p>
      </footer>

      {toast && (
        <div className="toast toast-end toast-bottom z-[1100]">
          <div className={`alert ${toast.type === "success" ? "alert-success" : "alert-error"}`}>
            <span>{toast.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
