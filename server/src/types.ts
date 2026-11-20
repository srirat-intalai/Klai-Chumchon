// รูปแบบ response ที่ส่งกลับไปให้หน้าบ้านทุกเส้น
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface ReportInput {
  title: string;
  description: string;
  location: string;
  reporterName: string;
  phone: string | null;
  imageUrl: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED";
  categoryId: number;
}

export interface CommentInput {
  authorName: string;
  message: string;
}
