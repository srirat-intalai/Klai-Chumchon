import { Wind } from "lucide-react";
import { useAirQuality } from "../hooks/useReports";

// เกณฑ์ PM2.5 ของกรมควบคุมมลพิษ (มคก./ลบ.ม.)
const LEVELS = [
  { max: 15, label: "ดีมาก", color: "#3b82f6" },
  { max: 25, label: "ดี", color: "#22c55e" },
  { max: 37.5, label: "ปานกลาง", color: "#eab308" },
  { max: 75, label: "เริ่มมีผลกระทบต่อสุขภาพ", color: "#f97316" },
  { max: Infinity, label: "มีผลกระทบต่อสุขภาพ", color: "#ef4444" },
];

// หาว่าค่าฝุ่น PM2.5 อยู่ระดับไหน (ดีมาก ดี ปานกลาง เริ่มมีผล มีผล) ตามเกณฑ์ของกรมควบคุมมลพิษ
function levelOf(pm25: number) {
  // ไล่ดูทีละระดับ ค่าฝุ่นไม่เกินระดับไหนก็เอาระดับนั้น
  for (let i = 0; i < LEVELS.length; i++) {
    if (pm25 <= LEVELS[i].max) {
      return LEVELS[i];
    }
  }
  // เกินทุกระดับ = ระดับสุดท้าย (อันตราย)
  return LEVELS[LEVELS.length - 1];
}

// ค่าฝุ่น ณ ตำแหน่งที่แจ้ง (Open-Meteo ผ่าน /api/geo/air)
export default function AirQualityCard({ lat, lng }: { lat: number; lng: number }) {
  const air = useAirQuality(lat, lng);

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4 gap-2">
        <h2 className="font-semibold flex items-center gap-2">
          <Wind size={18} aria-hidden="true" /> คุณภาพอากาศตอนนี้
        </h2>

        {air.isLoading && <div className="skeleton h-14 w-full" />}

        {air.isError && <p className="text-sm text-base-content/70">โหลดข้อมูลคุณภาพอากาศไม่สำเร็จ</p>}

        {air.data && air.data.pm25 === null && <p className="text-sm text-base-content/70">ไม่มีข้อมูลสำหรับจุดนี้</p>}

        {air.data && air.data.pm25 !== null && (
          <>
            <div className="flex items-center gap-3">
              <span
                className="inline-block w-3.5 h-3.5 rounded-full shrink-0"
                style={{ background: levelOf(air.data.pm25).color }}
                aria-hidden="true"
              />
              <p>
                <span className="text-2xl font-bold">{air.data.pm25.toFixed(1)}</span>{" "}
                <span className="text-sm text-base-content/70">มคก./ลบ.ม. (PM2.5)</span>
              </p>
            </div>
            <p className="text-sm font-medium">{levelOf(air.data.pm25).label}</p>
            {air.data.pm10 !== null && (
              <p className="text-xs text-base-content/70">PM10: {air.data.pm10.toFixed(1)} มคก./ลบ.ม.</p>
            )}
            <p className="text-xs text-base-content/70">ค่าประมาณจาก Open-Meteo อัปเดตทุกชั่วโมง</p>
          </>
        )}
      </div>
    </div>
  );
}
