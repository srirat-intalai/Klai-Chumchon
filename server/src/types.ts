// ข้อมูลเรื่องที่แจ้งหลังผ่านการตรวจแล้ว (reporterId กับ imageUrl ใส่ใน controller)
export interface ReportInput {
  title: string;
  description: string;
  location: string;
  address: string | null;
  latitude: number;
  longitude: number;
  priority: "LOW" | "MEDIUM" | "HIGH";
  categoryId: number;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}
