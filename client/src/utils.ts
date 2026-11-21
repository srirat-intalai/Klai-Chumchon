import { FILE_URL } from "./api/reportApi";

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// imageUrl จาก server เป็น path เช่น /uploads/xxx.jpg ต้องเติมโดเมน server ข้างหน้า
export function imageSrc(path: string): string {
  if (path.startsWith("http")) return path;
  return FILE_URL + path;
}

// จุดกลางแผนที่: ม.กรุงเทพ วิทยาเขตรังสิต (ประมาณ)
export const MAP_CENTER: [number, number] = [14.0387, 100.6023];

export const STATUS_COLOR = {
  PENDING: "#ef4444", // แดง
  IN_PROGRESS: "#f59e0b", // เหลือง
  RESOLVED: "#22c55e", // เขียว
} as const;

// ?next= หลังล็อกอิน: รับเฉพาะ path ในเว็บเรา (กัน "//evil.com" และ "/\\evil.com" ที่ browser แปลงเป็นเว็บอื่น)
export function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  return value;
}
