export type ReportStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface Category {
  id: number;
  name: string;
  icon: string;
  _count?: { reports: number };
}

export interface Comment {
  id: number;
  authorName: string;
  message: string;
  reportId: number;
  createdAt: string;
}

export interface Report {
  id: number;
  title: string;
  description: string;
  location: string;
  reporterName: string;
  phone: string | null;
  imageUrl: string | null;
  status: ReportStatus;
  priority: Priority;
  categoryId: number;
  category: Category;
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number };
}

// หน้า detail ได้คอมเมนต์มาด้วย
export interface ReportDetail extends Report {
  comments: Comment[];
}

// ข้อมูลที่ฟอร์มส่งไปตอนสร้าง/แก้
export interface ReportFormData {
  title: string;
  description: string;
  location: string;
  reporterName: string;
  phone: string;
  imageUrl: string;
  priority: Priority;
  status: ReportStatus;
  categoryId: number;
}

export interface CommentFormData {
  authorName: string;
  message: string;
}

export interface ReportFilters {
  search: string;
  status: ReportStatus | "";
  categoryId: number;
}

// รูปแบบที่หลังบ้านส่งมาทุกเส้น
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export const STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: "รอรับเรื่อง",
  IN_PROGRESS: "กำลังดำเนินการ",
  RESOLVED: "แก้ไขแล้ว",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "ไม่เร่งด่วน",
  MEDIUM: "ปานกลาง",
  HIGH: "เร่งด่วน",
};
