import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router";
import { useMe } from "../hooks/useAuth";
import { DetailSkeleton, ErrorAlert } from "./Feedback";
import { ROLE_LABEL } from "../types";
import type { Role } from "../types";

interface Props {
  roles?: Role[]; // ไม่ใส่ = แค่ล็อกอินก็เข้าได้
  children: ReactNode;
}

// กันหน้าที่ต้องล็อกอิน / ต้องเป็น role ที่กำหนด
export default function RequireAuth({ roles, children }: Props) {
  const { user, isLoading, connectionError, retry } = useMe();
  const location = useLocation();

  if (isLoading) return <DetailSkeleton />;

  // ยังล็อกอินอยู่ แต่ server ไม่ตอบ: บอกตรง ๆ ไม่พาไปหน้าล็อกอินให้งง
  if (connectionError) {
    return (
      <div className="max-w-xl mx-auto">
        <ErrorAlert message={connectionError} onRetry={() => retry()} />
      </div>
    );
  }

  if (!user) {
    // จำหน้าที่จะไปไว้ ล็อกอินเสร็จจะพากลับมา
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div role="alert" className="alert alert-warning max-w-xl mx-auto">
        <Lock size={22} aria-hidden="true" className="shrink-0" />
        <div>
          <h3 className="font-semibold">ไม่มีสิทธิ์เข้าหน้านี้</h3>
          <p className="text-sm">
            หน้านี้สำหรับ {roles.map((r) => ROLE_LABEL[r]).join(" / ")} เท่านั้น (คุณเป็น {ROLE_LABEL[user.role]})
          </p>
        </div>
        <Link to="/" className="btn btn-sm">
          กลับหน้าแรก
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
