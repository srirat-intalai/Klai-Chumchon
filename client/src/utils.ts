import { FILE_URL } from "./api/reportApi";

// แปลงวันที่จาก server ให้เป็นแบบไทย เช่น 21 พ.ย. 2569 10:30
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

// ระยะทางเป็นกิโลเมตรระหว่างสองพิกัด (สูตร haversine)
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

// แปลงระยะทางเป็นข้อความ ไม่ถึง 1 กม. โชว์เป็นเมตร
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} ม.`;
  return `${km.toFixed(1)} กม.`;
}

// ตัวอักษรแรกของชื่อสำหรับ avatar: ข้ามสระหน้า (เ แ โ ใ ไ) เช่น "เจ้าหน้าที่" -> "จ"
export function initialOf(name: string): string {
  const t = name.trim();
  // ถ้าตัวแรกเป็นสระหน้า (เ แ โ ใ ไ) ให้เอาตัวถัดไปแทน
  if (t.length > 1 && "เแโใไ".includes(t[0])) {
    return t[1];
  }
  return t.charAt(0);
}
