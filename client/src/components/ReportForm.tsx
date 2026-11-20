import { useState } from "react";
import type { FormEvent } from "react";
import { useCategories } from "../hooks/useReports";
import { PRIORITY_LABEL, STATUS_LABEL } from "../types";
import type { Priority, ReportFormData, ReportStatus } from "../types";

interface Props {
  initial?: ReportFormData;
  showStatus?: boolean; // ตอนแก้ไขถึงจะให้เปลี่ยนสถานะได้
  submitText: string;
  pending: boolean;
  serverError: string | null;
  onSubmit: (data: ReportFormData) => void;
}

const empty: ReportFormData = {
  title: "",
  description: "",
  location: "",
  reporterName: "",
  phone: "",
  imageUrl: "",
  priority: "MEDIUM",
  status: "PENDING",
  categoryId: 0,
};

// เช็กเบื้องต้นฝั่งหน้าบ้านก่อน (หลังบ้านก็เช็กซ้ำอีกรอบ)
function validate(f: ReportFormData): string[] {
  const errs: string[] = [];
  if (f.title.trim().length < 5) errs.push("หัวข้ออย่างน้อย 5 ตัวอักษร");
  if (f.description.trim().length < 10) errs.push("รายละเอียดอย่างน้อย 10 ตัวอักษร");
  if (f.location.trim().length < 3) errs.push("กรุณาระบุสถานที่");
  if (f.reporterName.trim().length < 2) errs.push("กรุณากรอกชื่อผู้แจ้ง");
  if (f.categoryId === 0) errs.push("กรุณาเลือกหมวดหมู่");
  if (f.phone.trim() !== "" && !/^0\d{8,9}$/.test(f.phone.replace(/-/g, "").trim())) {
    errs.push("เบอร์โทรไม่ถูกต้อง");
  }
  if (f.imageUrl.trim() !== "" && !/^https?:\/\/\S+$/.test(f.imageUrl.trim())) {
    errs.push("ลิงก์รูปต้องขึ้นต้นด้วย http(s)://");
  }
  return errs;
}

export default function ReportForm({ initial, showStatus, submitText, pending, serverError, onSubmit }: Props) {
  const [form, setForm] = useState<ReportFormData>(initial || empty);
  const [errors, setErrors] = useState<string[]>([]);
  const categories = useCategories();

  function change(field: keyof ReportFormData, value: string | number) {
    setForm({ ...form, [field]: value });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (errs.length > 0) return;
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="card bg-base-100 border border-base-300">
      <div className="card-body gap-4">
        {(errors.length > 0 || serverError) && (
          <div role="alert" className="alert alert-error">
            <ul className="list-disc list-inside text-sm">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
              {serverError && <li>{serverError}</li>}
            </ul>
          </div>
        )}

        <label className="form-control w-full">
          <span className="label-text mb-1 font-medium">หัวข้อปัญหา *</span>
          <input
            className="input input-bordered w-full"
            value={form.title}
            maxLength={120}
            placeholder="เช่น ไฟส่องทางดับทั้งซอย"
            onChange={(e) => change("title", e.target.value)}
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="form-control w-full">
            <span className="label-text mb-1 font-medium">หมวดหมู่ *</span>
            <select
              className="select select-bordered w-full"
              value={form.categoryId}
              onChange={(e) => change("categoryId", Number(e.target.value))}
              disabled={categories.isLoading}
            >
              <option value={0}>{categories.isLoading ? "กำลังโหลด..." : "-- เลือกหมวดหมู่ --"}</option>
              {categories.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
            {categories.isError && <span className="text-error text-xs mt-1">โหลดหมวดหมู่ไม่สำเร็จ</span>}
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-1 font-medium">ความเร่งด่วน</span>
            <select
              className="select select-bordered w-full"
              value={form.priority}
              onChange={(e) => change("priority", e.target.value as Priority)}
            >
              <option value="LOW">{PRIORITY_LABEL.LOW}</option>
              <option value="MEDIUM">{PRIORITY_LABEL.MEDIUM}</option>
              <option value="HIGH">{PRIORITY_LABEL.HIGH}</option>
            </select>
          </label>
        </div>

        <label className="form-control w-full">
          <span className="label-text mb-1 font-medium">รายละเอียด *</span>
          <textarea
            className="textarea textarea-bordered w-full h-32"
            value={form.description}
            maxLength={2000}
            placeholder="อธิบายปัญหาที่พบ เกิดตั้งแต่เมื่อไหร่ ส่งผลกระทบอย่างไร"
            onChange={(e) => change("description", e.target.value)}
          />
          <span className="text-xs text-base-content/50 mt-1 text-right">{form.description.length}/2000</span>
        </label>

        <label className="form-control w-full">
          <span className="label-text mb-1 font-medium">สถานที่ *</span>
          <input
            className="input input-bordered w-full"
            value={form.location}
            maxLength={200}
            placeholder="เช่น ปากซอย 5 หน้าร้านขายของชำ"
            onChange={(e) => change("location", e.target.value)}
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="form-control w-full">
            <span className="label-text mb-1 font-medium">ชื่อผู้แจ้ง *</span>
            <input
              className="input input-bordered w-full"
              value={form.reporterName}
              maxLength={100}
              onChange={(e) => change("reporterName", e.target.value)}
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text mb-1 font-medium">เบอร์โทร (ไม่บังคับ)</span>
            <input
              className="input input-bordered w-full"
              value={form.phone}
              maxLength={12}
              inputMode="tel"
              placeholder="0812345678"
              onChange={(e) => change("phone", e.target.value)}
            />
          </label>
        </div>

        <label className="form-control w-full">
          <span className="label-text mb-1 font-medium">ลิงก์รูปภาพ (ไม่บังคับ)</span>
          <input
            className="input input-bordered w-full"
            value={form.imageUrl}
            maxLength={500}
            placeholder="https://..."
            onChange={(e) => change("imageUrl", e.target.value)}
          />
        </label>

        {showStatus && (
          <label className="form-control w-full md:w-1/2">
            <span className="label-text mb-1 font-medium">สถานะ</span>
            <select
              className="select select-bordered w-full"
              value={form.status}
              onChange={(e) => change("status", e.target.value as ReportStatus)}
            >
              <option value="PENDING">{STATUS_LABEL.PENDING}</option>
              <option value="IN_PROGRESS">{STATUS_LABEL.IN_PROGRESS}</option>
              <option value="RESOLVED">{STATUS_LABEL.RESOLVED}</option>
            </select>
          </label>
        )}

        <div className="card-actions justify-end">
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending && <span className="loading loading-spinner loading-sm" />}
            {pending ? "กำลังบันทึก..." : submitText}
          </button>
        </div>
      </div>
    </form>
  );
}
