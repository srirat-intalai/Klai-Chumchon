import type { ReactNode } from "react";
import CategoryIcon from "./CategoryIcon";
import { STATUS_LABEL } from "../types";
import type { Category, ReportStatus } from "../types";
import { STATUS_COLOR } from "../utils";

// ตัวกรองแบบ pill กดครั้งเดียว (แทน dropdown) ใช้ร่วมกันในหน้ารายการและหน้าแผนที่

const STATUS_LIST: ReportStatus[] = ["PENDING", "IN_PROGRESS", "RESOLVED"];

function Pill({ active, onClick, children, label }: { active: boolean; onClick: () => void; children: ReactNode; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap border transition-colors ${
        active
          ? "bg-neutral text-neutral-content border-neutral"
          : "bg-base-100 text-base-content border-base-300 hover:bg-secondary/60 hover:border-base-content/30"
      }`}
    >
      {children}
    </button>
  );
}

// แถวที่เลื่อนแนวนอนได้บนมือถือ ไม่ตัดบรรทัด
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:thin]">
      {children}
    </div>
  );
}

export function StatusPills({
  value,
  onChange,
  counts,
}: {
  value: ReportStatus | "";
  onChange: (s: ReportStatus | "") => void;
  counts?: Partial<Record<ReportStatus, number>>;
}) {
  return (
    <Row label="กรองตามสถานะ">
      <Pill active={value === ""} onClick={() => onChange("")}>
        ทุกสถานะ
      </Pill>
      {STATUS_LIST.map((s) => (
        <Pill key={s} active={value === s} onClick={() => onChange(value === s ? "" : s)}>
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLOR[s] }} aria-hidden="true" />
          {STATUS_LABEL[s]}
          {counts?.[s] !== undefined && <span className="tabular opacity-70">{counts[s]}</span>}
        </Pill>
      ))}
    </Row>
  );
}

export function CategoryPills({
  categories,
  value,
  onChange,
}: {
  categories: Category[] | undefined;
  value: number;
  onChange: (id: number) => void;
}) {
  if (!categories) return <div className="skeleton h-9 w-full rounded-full" />;
  return (
    <Row label="กรองตามหมวดหมู่">
      <Pill active={value === 0} onClick={() => onChange(0)}>
        ทุกหมวดหมู่
      </Pill>
      {categories.map((c) => (
        <Pill key={c.id} active={value === c.id} onClick={() => onChange(value === c.id ? 0 : c.id)}>
          <span className={value === c.id ? "[&_svg]:!text-neutral-content" : ""}>
            <CategoryIcon category={c} />
          </span>
          {c.name}
        </Pill>
      ))}
    </Row>
  );
}
