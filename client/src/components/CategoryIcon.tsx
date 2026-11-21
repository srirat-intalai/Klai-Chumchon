import { Droplets, Lightbulb, Route, Siren, Tag, Trash2, Trees } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Category } from "../types";

// คีย์ icon จากฐานข้อมูล -> ไอคอน ใช้สีตามตัวอักษร (สีแดง/เหลือง/เขียวสงวนไว้ให้สถานะ)
const ICONS: Record<string, LucideIcon> = {
  road: Route,
  light: Lightbulb,
  water: Droplets,
  trash: Trash2,
  safety: Siren,
  park: Trees,
};

// ไอคอนอย่างเดียว (ตกแต่ง ไม่ต้องให้ screen reader อ่าน)
export default function CategoryIcon({ category, size = 16 }: { category: Category; size?: number }) {
  const Icon = ICONS[category.icon] || Tag;
  return <Icon size={size} aria-hidden="true" className="shrink-0 text-base-content/70" />;
}

// ไอคอน + ชื่อหมวด
export function CategoryLabel({ category, className = "" }: { category: Category; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <CategoryIcon category={category} />
      {category.name}
    </span>
  );
}
