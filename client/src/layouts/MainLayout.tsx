import { useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, MapPinned, Menu, Moon, Plus, Sun } from "lucide-react";
import { useUiStore } from "../stores/useUiStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useMe } from "../hooks/useAuth";
import { RoleBadge } from "../components/Badges";
import { initialOf } from "../utils";

// DaisyUI dropdown เปิดอยู่ตราบที่ยังมี focus กดลิงก์แล้วต้อง blur ให้เมนูปิด
function closeDropdown() {
  const el = document.activeElement;
  if (el instanceof HTMLElement) el.blur();
}

// แถบบนเป็นพื้นม่วงเข้ม: เมนูที่เลือกอยู่เป็น pill สีชมพูอ่อน
function navClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? "rounded-full bg-bubblegum text-plum font-medium hover:bg-bubblegum"
    : "rounded-full text-bone/80 hover:bg-white/10 hover:text-bone";
}

// เมนูมือถืออยู่บนพื้นสว่าง ใช้สีปกติ
function mobileNavClass({ isActive }: { isActive: boolean }) {
  return isActive ? "font-semibold bg-secondary text-secondary-content" : "";
}

// โครงหน้าเว็บที่ใช้ร่วมกันทุกหน้า: แถบเมนูด้านบน + <Outlet /> ตรงกลาง + footer
export default function MainLayout() {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const bookmarkCount = useUiStore((s) => s.bookmarks.length);
  const toast = useUiStore((s) => s.toast);
  const hideToast = useUiStore((s) => s.hideToast);
  const showToast = useUiStore((s) => s.showToast);
  const logout = useAuthStore((s) => s.logout);
  const { user, isLoading, connectionError } = useMe();
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

  // ออกจากระบบ ล้าง token แล้วกลับหน้าแรก
  function handleLogout() {
    closeDropdown();
    logout();
    qc.removeQueries({ queryKey: ["me"] });
    qc.removeQueries({ queryKey: ["users"] });
    showToast("ออกจากระบบแล้ว");
    navigate("/");
  }

  // เมนูหลัก ("เรื่องของฉัน" อยู่ในเมนู avatar)
  const menus = [
    { to: "/", label: "หน้าแรก" },
    { to: "/reports", label: "เรื่องที่แจ้ง" },
    { to: "/map", label: "แผนที่" },
    { to: "/bookmarks", label: "ที่ติดตาม" },
    { to: "/about", label: "เกี่ยวกับเรา" },
  ];
  if (user && user.role !== "CITIZEN") menus.push({ to: "/admin", label: "จัดการระบบ" });

  // เมนูมือถือใส่ครบทุกหน้า เพราะไม่มีที่อื่นให้กด
  const mobileMenus = [...menus];
  if (user) mobileMenus.push({ to: "/my-reports", label: "เรื่องของฉัน" });

  // วาดลิงก์เมนูจาก array (ใช้ทั้งเมนูจอใหญ่และเมนูมือถือ)
  function renderLinks(list: { to: string; label: string }[], mobile = false) {
    return list.map((m) => (
      <li key={m.to}>
        <NavLink to={m.to} end={m.to === "/"} className={mobile ? mobileNavClass : navClass} onClick={closeDropdown}>
          {m.label}
          {m.to === "/bookmarks" && bookmarkCount > 0 && (
            <span className="badge badge-sm border-0 bg-bone text-plum tabular">{bookmarkCount}</span>
          )}
        </NavLink>
      </li>
    ));
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <header className="navbar stage border-b border-white/10 sticky top-0 z-[1000] px-2 sm:px-6">
        <div className="navbar-start">
          <div className="dropdown lg:hidden">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-square text-bone hover:bg-white/10 border-0" aria-label="เปิดเมนู">
              <Menu size={20} aria-hidden="true" />
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 text-base-content border border-base-300 rounded-box z-40 mt-3 w-52 p-2">
              {renderLinks(mobileMenus, true)}
            </ul>
          </div>
          <Link to="/" className="btn btn-ghost border-0 text-bone hover:bg-white/10 text-base sm:text-xl gap-1.5 px-1 sm:px-2">
            <MapPinned size={22} className="text-blush" aria-hidden="true" />
            <span className="font-display">
              <span className="font-semibold">Klai</span> <span className="font-normal text-blush">Chumchon</span>
            </span>
          </Link>
        </div>

        <nav className="navbar-center hidden lg:flex" aria-label="เมนูหลัก">
          <ul className="menu menu-horizontal px-1 gap-1">{renderLinks(menus)}</ul>
        </nav>

        <div className="navbar-end gap-1 sm:gap-2">
          <button
            className="btn btn-ghost btn-circle btn-sm sm:btn-md text-bone hover:bg-white/10 border-0"
            onClick={toggleTheme}
            aria-label={theme === "klai" ? "เปลี่ยนเป็นโหมดมืด" : "เปลี่ยนเป็นโหมดสว่าง"}
          >
            {theme === "klai" ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
          </button>
          <Link to="/reports/new" className="btn btn-sm sm:btn-md rounded-full border-0 bg-blush text-plum hover:bg-bubblegum" aria-label="แจ้งปัญหา">
            <Plus size={18} aria-hidden="true" />
            <span className="hidden sm:inline">แจ้งปัญหา</span>
          </Link>

          {isLoading && <span className="loading loading-spinner loading-sm" />}
          {connectionError && (
            <span className="badge badge-error whitespace-nowrap" title={connectionError}>
              ออฟไลน์
            </span>
          )}
          {!isLoading && !user && !connectionError && (
            <Link to="/login" className="btn btn-outline btn-sm sm:btn-md border-bone/60 text-bone hover:bg-bone hover:text-plum hover:border-bone">
              เข้าสู่ระบบ
            </Link>
          )}
          {user && (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle border-0 hover:bg-white/10 avatar avatar-placeholder" aria-label="เมนูผู้ใช้">
                <div className="bg-bubblegum text-plum w-9 rounded-full font-semibold">
                  <span>{initialOf(user.name)}</span>
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 text-base-content border border-base-300 rounded-box z-40 mt-3 w-56 p-2">
                <li className="menu-title">
                  <span className="flex flex-col gap-1">
                    <span className="text-base-content font-semibold">{user.name}</span>
                    <span className="text-xs font-normal">{user.email}</span>
                    <RoleBadge role={user.role} />
                  </span>
                </li>
                <li>
                  <Link to="/my-reports" onClick={closeDropdown}>
                    เรื่องของฉัน
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="text-error">
                    <LogOut size={15} aria-hidden="true" />
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

      <footer className="stage mt-12">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-lg font-display font-semibold">
              <MapPinned size={20} className="text-blush" aria-hidden="true" /> Klai <span className="font-normal text-blush">Chumchon</span>
            </p>
            <p className="opacity-80">แจ้งปัญหาใกล้ตัว ติดตามได้ว่าเรื่องของชุมชนไปถึงไหนแล้ว</p>
          </div>
          <nav aria-label="ลิงก์ส่วนท้าย">
            <p className="font-semibold mb-2 text-blush">เมนู</p>
            <ul className="space-y-1 opacity-80">
              <li><Link to="/reports" className="link link-hover">เรื่องที่แจ้งทั้งหมด</Link></li>
              <li><Link to="/map" className="link link-hover">แผนที่ปัญหา</Link></li>
              <li><Link to="/reports/new" className="link link-hover">แจ้งปัญหาใหม่</Link></li>
              <li><Link to="/about" className="link link-hover">เกี่ยวกับเรา</Link></li>
            </ul>
          </nav>
          <div>
            <p className="font-semibold mb-2 text-blush">โครงงาน</p>
            <p className="opacity-80">CS319 Internet Programming I · Final Project</p>
            <p className="opacity-80 mt-1">ข้อมูลในระบบเป็นข้อมูลตัวอย่างสำหรับการเรียน</p>
          </div>
        </div>
      </footer>

      {toast && (
        <div className="toast toast-end toast-bottom z-[1100]" role="status" aria-live="polite">
          <div className={`alert ${toast.type === "success" ? "alert-success" : "alert-error"}`}>
            <span>{toast.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
