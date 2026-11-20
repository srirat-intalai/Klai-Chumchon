import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useCategories } from "../hooks/useReports";
import { LocationPicker } from "./MapView";
import { PRIORITY_LABEL } from "../types";
import type { Priority, ReportFormData } from "../types";
import { imageSrc } from "../utils";

interface Props {
  initial?: ReportFormData;
  oldImageUrl?: string | null; // รูปเดิมตอนแก้ไข
  submitText: string;
  pending: boolean;
  serverError: string | null;
  onSubmit: (data: ReportFormData) => void;
}

const empty: ReportFormData = {
  title: "",
  description: "",
  location: "",
  latitude: null,
  longitude: null,
  priority: "MEDIUM",
  categoryId: 0,
  image: null,
  removeImage: false,
};

const MAX_SIZE = 5 * 1024 * 1024;

// เช็กเบื้องต้นฝั่งหน้าบ้านก่อน (หลังบ้านก็เช็กซ้ำอีกรอบ)
function validate(f: ReportFormData): string[] {
  const errs: string[] = [];
  if (f.title.trim().length < 5) errs.push("หัวข้ออย่างน้อย 5 ตัวอักษร");
  if (f.description.trim().length < 10) errs.push("รายละเอียดอย่างน้อย 10 ตัวอักษร");
  if (f.location.trim().length < 3) errs.push("กรุณาระบุจุดสังเกต");
  if (f.categoryId === 0) errs.push("กรุณาเลือกหมวดหมู่");
  if (f.latitude === null || f.longitude === null) errs.push("กรุณาปักหมุดตำแหน่งบนแผนที่");
  return errs;
}

export default function ReportForm({ initial, oldImageUrl, submitText, pending, serverError, onSubmit }: Props) {
  const [form, setForm] = useState<ReportFormData>(initial || empty);
  const [errors, setErrors] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const categories = useCategories();

  // คืนหน่วยความจำของ URL รูปตัวอย่างเมื่อเปลี่ยนรูป/ออกจากหน้า
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function change(field: "title" | "description" | "location", value: string) {
    setForm({ ...form, [field]: value });
  }

  function pickFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors(["รองรับเฉพาะรูป JPG, PNG หรือ WEBP"]);
      e.target.value = "";
      return;
    }
    if (file.size > MAX_SIZE) {
      setErrors(["รูปต้องมีขนาดไม่เกิน 5MB"]);
      e.target.value = "";
      return;
    }
    setErrors([]);
    setForm({ ...form, image: file, removeImage: false });
    setPreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setForm({ ...form, image: null, removeImage: true });
    setPreview(null);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setErrors(["เบราว์เซอร์นี้ไม่รองรับการหาตำแหน่ง กรุณาคลิกบนแผนที่แทน"]);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setForm((f) => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
      },
      () => {
        setLocating(false);
        setErrors(["หาตำแหน่งไม่ได้ (อาจไม่ได้อนุญาต) กรุณาคลิกบนแผนที่แทน"]);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (errs.length > 0) return;
    onSubmit(form);
  }

  // รูปที่จะโชว์: รูปใหม่ที่เพิ่งเลือก > รูปเดิม (ถ้าไม่ได้กดลบ)
  let shownImage: string | null = null;
  if (preview) shownImage = preview;
  else if (oldImageUrl && !form.removeImage) shownImage = imageSrc(oldImageUrl);

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
              onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
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
              onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
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
            className="textarea textarea-bordered w-full h-28"
            value={form.description}
            maxLength={2000}
            placeholder="อธิบายปัญหาที่พบ เกิดตั้งแต่เมื่อไหร่ ส่งผลกระทบอย่างไร"
            onChange={(e) => change("description", e.target.value)}
          />
          <span className="text-xs text-base-content/50 mt-1 text-right">{form.description.length}/2000</span>
        </label>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="label-text font-medium">ตำแหน่งบนแผนที่ * (คลิกบนแผนที่เพื่อปักหมุด)</span>
            <button type="button" className="btn btn-sm btn-outline" onClick={useMyLocation} disabled={locating}>
              {locating && <span className="loading loading-spinner loading-xs" />}
              📍 ใช้ตำแหน่งปัจจุบัน
            </button>
          </div>
          <LocationPicker
            lat={form.latitude}
            lng={form.longitude}
            onPick={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))}
          />
          <p className="text-xs text-base-content/60">
            {form.latitude !== null && form.longitude !== null
              ? `พิกัด: ${form.latitude.toFixed(5)}, ${form.longitude.toFixed(5)}`
              : "ยังไม่ได้ปักหมุด"}
          </p>
        </div>

        <label className="form-control w-full">
          <span className="label-text mb-1 font-medium">จุดสังเกต *</span>
          <input
            className="input input-bordered w-full"
            value={form.location}
            maxLength={200}
            placeholder="เช่น ปากซอย 5 หน้าร้านขายของชำ"
            onChange={(e) => change("location", e.target.value)}
          />
        </label>

        <div className="form-control w-full">
          <span className="label-text mb-1 font-medium">รูปภาพ (ไม่บังคับ, ไม่เกิน 5MB)</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="file-input file-input-bordered w-full"
            onChange={pickFile}
          />
          {shownImage && (
            <div className="mt-3 flex items-start gap-3">
              <img src={shownImage} alt="รูปที่แนบ" className="h-32 w-auto rounded-box border border-base-300 object-cover" />
              <button type="button" className="btn btn-ghost btn-sm text-error" onClick={clearImage}>
                ลบรูป
              </button>
            </div>
          )}
        </div>

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
