import { useEffect } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { useUiStore } from "../stores/useUiStore";

const menus = [
  { to: "/", label: "หน้าแรก" },
  { to: "/reports", label: "เรื่องที่แจ้ง" },
  { to: "/bookmarks", label: "ที่ติดตาม" },
  { to: "/admin", label: "จัดการระบบ" },
];

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? "font-semibold text-primary" : "";
}

export default function MainLayout() {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const bookmarkCount = useUiStore((s) => s.bookmarks.length);
  const toast = useUiStore((s) => s.toast);
  const hideToast = useUiStore((s) => s.hideToast);

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
      <header className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-30 px-2 sm:px-6">
        <div className="navbar-start">
          {/* เมนูมือถือ */}
          <div className="dropdown lg:hidden">
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

        <nav className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-1">{links}</ul>
        </nav>

        <div className="navbar-end gap-1 sm:gap-2">
          <button className="btn btn-ghost btn-circle btn-sm sm:btn-md" onClick={toggleTheme} aria-label="สลับธีม">
            {theme === "emerald" ? "🌙" : "☀️"}
          </button>
          <Link to="/reports/new" className="btn btn-primary btn-sm sm:btn-md" aria-label="แจ้งปัญหา">
            +<span className="hidden sm:inline"> แจ้งปัญหา</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="footer footer-center p-6 bg-base-100 border-t border-base-300 text-sm text-base-content/60">
        <p>Klai Chumchon · ระบบแจ้งปัญหาและติดตามการแก้ไขในชุมชน · CS319 Final Project</p>
      </footer>

      {toast && (
        <div className="toast toast-end toast-bottom z-50">
          <div className={`alert ${toast.type === "success" ? "alert-success" : "alert-error"}`}>
            <span>{toast.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
