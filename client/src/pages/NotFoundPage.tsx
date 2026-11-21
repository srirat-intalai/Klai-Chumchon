import { Link } from "react-router";

// หน้า 404 ตอนพิมพ์ URL ที่ไม่มีอยู่
export default function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <p className="text-6xl font-display font-semibold">404</p>
      <p className="mt-3 text-base-content/70">ไม่พบหน้าที่คุณต้องการ</p>
      <Link to="/" className="btn btn-primary mt-6">
        กลับหน้าแรก
      </Link>
    </div>
  );
}
