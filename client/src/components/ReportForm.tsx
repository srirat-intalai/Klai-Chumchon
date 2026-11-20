import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ImagePlus, LocateFixed, X } from "lucide-react";
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

// ช่องที่มี error ได้ เรียงตามลำดับบนหน้าจอ (ใช้หาช่องแรกที่ผิดเพื่อเลื่อนไปหา)
type Field = "title" | "categoryId" | "description" | "pin" | "location" | "image";
const FIELD_ORDER: Field[] = ["title", "categoryId", "description", "pin", "location", "image"];
type Errors = Partial<Record<Field, string>>;

// เช็กเบื้องต้นฝั่งหน้าบ้านก่อน (หลังบ้านก็เช็กซ้ำอีกรอบ)
function validate(f: ReportFormData): Errors {
  const errs: Errors = {};
  if (f.title.trim().length < 5) errs.title = "หัวข้ออย่างน้อย 5 ตัวอักษร";
  if (f.categoryId === 0) errs.categoryId = "กรุณาเลือกหมวดหมู่";
  if (f.description.trim().length < 10) errs.description = "รายละเอียดอย่างน้อย 10 ตัวอักษร";
  if (f.latitude === null || f.longitude === null) errs.pin = "กรุณาคลิกบนแผนที่เพื่อปักหมุด หรือกดใช้ตำแหน่งปัจจุบัน";
  if (f.location.trim().length < 3) errs.location = "กรุณาระบุจุดสังเกตอย่างน้อย 3 ตัวอักษร";
  return errs;
}

function FieldError({ id, text }: { id: string; text?: string }) {
  if (!text) return null;
  return (
    <p id={id} className="text-error text-sm mt-1">
      {text}
    </p>
  );
}

export default function ReportForm({ initial, oldImageUrl, submitText, pending, serverError, onSubmit }: Props) {
  const [form, setForm] = useState<ReportFormData>(initial || empty);
  const [errors, setErrors] = useState<Errors>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const categories = useCategories();

  // คืนหน่วยความจำของ URL รูปตัวอย่างเมื่อเปลี่ยนรูป/ออกจากหน้า
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // แก้ช่องไหนแล้ว ลบ error ของช่องนั้นออก
  function clearError(field: Field) {
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  }

  function change(field: "title" | "description" | "location", value: string) {
    setForm({ ...form, [field]: value });
    clearError(field);
  }

  function setPin(lat: number, lng: number) {
    setForm((f) => ({ ...f, latitude: lat, longitude: lng }));
    clearError("pin");
  }

  function pickFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors({ ...errors, image: "รองรับเฉพาะรูป JPG, PNG หรือ WEBP" });
      e.target.value = "";
      return;
    }
    if (file.size > MAX_SIZE) {
      setErrors({ ...errors, image: "รูปต้องมีขนาดไม่เกิน 5MB" });
      e.target.value = "";
      return;
    }
    clearError("image");
    setForm({ ...form, image: file, removeImage: false });
    setPreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setForm({ ...form, image: null, removeImage: true });
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function locateMe() {
    if (!navigator.geolocation) {
      setErrors({ ...errors, pin: "เบราว์เซอร์นี้ไม่รองรับการหาตำแหน่ง กรุณาคลิกบนแผนที่แทน" });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setPin(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLocating(false);
        setErrors((errs) => ({ ...errs, pin: "หาตำแหน่งไม่ได้ (อาจไม่ได้อนุญาต) กรุณาคลิกบนแผนที่แทน" }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);

    // เลื่อนไปช่องแรกที่ผิด แล้ว focus ให้พิมพ์ต่อได้เลย
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (first) {
      const el = document.getElementById("field-" + first);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus({ preventScroll: true });
      return;
    }
    onSubmit(form);
  }

  // รูปที่จะโชว์: รูปใหม่ที่เพิ่งเลือก > รูปเดิม (ถ้าไม่ได้กดลบ)
  let shownImage: string | null = null;
  if (preview) shownImage = preview;
  else if (oldImageUrl && !form.removeImage) shownImage = imageSrc(oldImageUrl);

  const fileName = form.image ? form.image.name : shownImage ? "ใช้รูปเดิม" : "ยังไม่ได้เลือกรูป";

  return (
    <form onSubmit={handleSubmit} noValidate className="card bg-base-100 border border-base-300">
      <div className="card-body gap-5">
        <div className="form-control w-full">
          <label htmlFor="field-title" className="label-text mb-1 font-medium">
            หัวข้อปัญหา *
          </label>
          <input
            id="field-title"
            className={`input input-bordered w-full ${errors.title ? "input-error" : ""}`}
            value={form.title}
            maxLength={120}
            placeholder="เช่น ไฟส่องทางดับทั้งซอย"
            aria-invalid={!!errors.title}
            aria-describedby="err-title"
            onChange={(e) => change("title", e.target.value)}
          />
          <FieldError id="err-title" text={errors.title} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label htmlFor="field-categoryId" className="label-text mb-1 font-medium">
              หมวดหมู่ *
            </label>
            <select
              id="field-categoryId"
              className={`select select-bordered w-full ${errors.categoryId ? "select-error" : ""}`}
              value={form.categoryId}
              aria-invalid={!!errors.categoryId}
              aria-describedby="err-categoryId"
              onChange={(e) => {
                setForm({ ...form, categoryId: Number(e.target.value) });
                clearError("categoryId");
              }}
              disabled={categories.isLoading}
            >
              <option value={0}>{categories.isLoading ? "กำลังโหลด..." : "-- เลือกหมวดหมู่ --"}</option>
              {categories.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <FieldError id="err-categoryId" text={errors.categoryId || (categories.isError ? "โหลดหมวดหมู่ไม่สำเร็จ" : "")} />
          </div>

          <div className="form-control w-full">
            <label htmlFor="field-priority" className="label-text mb-1 font-medium">
              ความเร่งด่วน
            </label>
            <select
              id="field-priority"
              className="select select-bordered w-full"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
            >
              <option value="LOW">{PRIORITY_LABEL.LOW}</option>
              <option value="MEDIUM">{PRIORITY_LABEL.MEDIUM}</option>
              <option value="HIGH">{PRIORITY_LABEL.HIGH}</option>
            </select>
          </div>
        </div>

        <div className="form-control w-full">
          <label htmlFor="field-description" className="label-text mb-1 font-medium">
            รายละเอียด *
          </label>
          <textarea
            id="field-description"
            className={`textarea textarea-bordered w-full h-28 ${errors.description ? "textarea-error" : ""}`}
            value={form.description}
            maxLength={2000}
            placeholder="อธิบายปัญหาที่พบ เกิดตั้งแต่เมื่อไหร่ ส่งผลกระทบอย่างไร"
            aria-invalid={!!errors.description}
            aria-describedby="err-description"
            onChange={(e) => change("description", e.target.value)}
          />
          <div className="flex justify-between gap-2">
            <FieldError id="err-description" text={errors.description} />
            <span className="text-xs text-base-content/70 mt-1 ml-auto">{form.description.length}/2000</span>
          </div>
        </div>

        {/* tabIndex ให้ focus ได้ตอนเลื่อนมาหา error */}
        <div id="field-pin" tabIndex={-1} className="space-y-2 outline-none" aria-describedby="err-pin">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="label-text font-medium">ตำแหน่งบนแผนที่ * (คลิกบนแผนที่เพื่อปักหมุด)</span>
            <button type="button" className="btn btn-sm btn-outline" onClick={locateMe} disabled={locating}>
              {locating ? <span className="loading loading-spinner loading-xs" /> : <LocateFixed size={15} aria-hidden="true" />}
              ใช้ตำแหน่งปัจจุบัน
            </button>
          </div>
          <div className={`rounded-box ${errors.pin ? "ring-2 ring-error" : ""}`}>
            <LocationPicker lat={form.latitude} lng={form.longitude} onPick={setPin} />
          </div>
          {errors.pin ? (
            <FieldError id="err-pin" text={errors.pin} />
          ) : (
            <p className="text-sm text-base-content/70">
              {form.latitude !== null && form.longitude !== null
                ? `ปักหมุดแล้ว: ${form.latitude.toFixed(5)}, ${form.longitude.toFixed(5)}`
                : "ยังไม่ได้ปักหมุด"}
            </p>
          )}
        </div>

        <div className="form-control w-full">
          <label htmlFor="field-location" className="label-text mb-1 font-medium">
            จุดสังเกต *
          </label>
          <input
            id="field-location"
            className={`input input-bordered w-full ${errors.location ? "input-error" : ""}`}
            value={form.location}
            maxLength={200}
            placeholder="เช่น ปากซอย 5 หน้าร้านขายของชำ"
            aria-invalid={!!errors.location}
            aria-describedby="err-location"
            onChange={(e) => change("location", e.target.value)}
          />
          <FieldError id="err-location" text={errors.location} />
        </div>

        <div className="form-control w-full">
          <span className="label-text mb-1 font-medium">รูปภาพ (ไม่บังคับ, JPG/PNG/WEBP ไม่เกิน 5MB)</span>
          {/* ซ่อน input file ตัวจริง ใช้ปุ่มภาษาไทยแทน "Choose File" ของ browser */}
          <input
            ref={fileRef}
            id="field-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={pickFile}
          />
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="field-image" className="btn btn-outline btn-sm">
              <ImagePlus size={16} aria-hidden="true" />
              {shownImage ? "เปลี่ยนรูป" : "เลือกรูป"}
            </label>
            <span className="text-sm text-base-content/70 truncate max-w-56">{fileName}</span>
          </div>
          <FieldError id="err-image" text={errors.image} />
          {shownImage && (
            <div className="mt-3 relative w-fit">
              <img src={shownImage} alt="รูปที่แนบ" className="h-36 w-auto rounded-box border border-base-300 object-cover" />
              <button
                type="button"
                className="btn btn-circle btn-xs btn-error absolute -top-2 -right-2"
                onClick={clearImage}
                aria-label="ลบรูป"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {serverError && (
          <div role="alert" className="alert alert-error text-sm">
            {serverError}
          </div>
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
