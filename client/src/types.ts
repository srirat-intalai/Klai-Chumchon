export type ReportStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED";
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type Role = "CITIZEN" | "STAFF" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  createdAt: string;
  _count?: { reports: number; comments: number };
}

// ข้อมูลผู้ใช้แบบย่อที่ติดมากับเรื่อง/คอมเมนต์/log
export interface UserBrief {
  id: number;
  name: string;
  role: Role;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  _count?: { reports: number };
}

export interface Comment {
  id: number;
  message: string;
  reportId: number;
  author: UserBrief;
  createdAt: string;
}

export interface StatusLog {
  id: number;
  fromStatus: ReportStatus | null;
  toStatus: ReportStatus;
  note: string | null;
  changedBy: UserBrief;
  createdAt: string;
}

export interface Report {
  id: number;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  status: ReportStatus;
  priority: Priority;
  categoryId: number;
  category: Category;
  reporterId: number;
  reporter: UserBrief;
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number };
}

// หน้า detail ได้คอมเมนต์กับประวัติสถานะมาด้วย
export interface ReportDetail extends Report {
  comments: Comment[];
  statusLogs: StatusLog[];
}

// ข้อมูลจากฟอร์มแจ้ง/แก้ไขเรื่อง (ส่งเป็น FormData เพราะมีไฟล์รูป)
export interface ReportFormData {
  title: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  priority: Priority;
  categoryId: number;
  image: File | null;
  removeImage: boolean;
}

export interface ReportFilters {
  search: string;
  status: ReportStatus | "";
  categoryId: number;
  reporterId?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthResult {
  token: string;
  user: User;
}

// รูปแบบที่หลังบ้านส่งมาทุกเส้น
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export const STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: "รอดำเนินการ",
  IN_PROGRESS: "กำลังแก้ไข",
  RESOLVED: "เสร็จสิ้น",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "ไม่เร่งด่วน",
  MEDIUM: "ปานกลาง",
  HIGH: "เร่งด่วน",
};

export const ROLE_LABEL: Record<Role, string> = {
  CITIZEN: "ประชาชน",
  STAFF: "เจ้าหน้าที่",
  ADMIN: "แอดมิน",
};
