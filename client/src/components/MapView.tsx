import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { CategoryLabel } from "./CategoryIcon";
import { STATUS_LABEL } from "../types";
import type { Report, ReportStatus } from "../types";
import { MAP_CENTER, STATUS_COLOR } from "../utils";

// หมุดวงกลมสีตามสถานะ (ใช้ divIcon จะได้ไม่ต้องโหลดไฟล์รูปหมุด)
function makeIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:22px;height:22px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45)"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
}

const icons: Record<ReportStatus, L.DivIcon> = {
  PENDING: makeIcon(STATUS_COLOR.PENDING),
  IN_PROGRESS: makeIcon(STATUS_COLOR.IN_PROGRESS),
  RESOLVED: makeIcon(STATUS_COLOR.RESOLVED),
};
const pickIcon = makeIcon("#3b82f6");

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_CREDIT = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// ---------- แผนที่รวมหลายหมุด ----------

interface ReportsMapProps {
  reports: Report[];
  height?: string;
}

// แผนที่รวมทุกเรื่อง หมุดสีตามสถานะ กดหมุดแล้วมี popup ลิงก์ไปหน้ารายละเอียด
export function ReportsMap({ reports, height = "h-[60vh]" }: ReportsMapProps) {
  return (
    <MapContainer center={MAP_CENTER} zoom={14} scrollWheelZoom className={`${height} w-full rounded-box z-0`}>
      <TileLayer url={TILE_URL} attribution={TILE_CREDIT} />
      {reports.map((r) => (
        <Marker key={r.id} position={[r.latitude, r.longitude]} icon={icons[r.status]}>
          <Popup>
            <div className="space-y-1 min-w-44">
              <p className="text-xs flex items-center gap-1 !m-0">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLOR[r.status] }} aria-hidden="true" />
                {STATUS_LABEL[r.status]}
              </p>
              <p className="font-semibold !m-0">{r.title}</p>
              <CategoryLabel category={r.category} className="text-xs" />
              <Link to={`/reports/${r.id}`} className="link font-medium underline-offset-4 text-sm inline-flex items-center gap-1">
                ดูรายละเอียด <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

// ---------- แผนที่หมุดเดียว (หน้า detail) ----------

// แผนที่เล็ก ๆ โชว์หมุดเดียว ใช้ในหน้ารายละเอียด
export function SingleMap({ lat, lng, status }: { lat: number; lng: number; status: ReportStatus }) {
  return (
    <MapContainer center={[lat, lng]} zoom={16} scrollWheelZoom={false} className="h-64 w-full rounded-box z-0">
      <TileLayer url={TILE_URL} attribution={TILE_CREDIT} />
      <Marker position={[lat, lng]} icon={icons[status]} />
    </MapContainer>
  );
}

// ---------- แผนที่ให้คลิกปักหมุด (ฟอร์ม) ----------

// ตัวดักการคลิกบนแผนที่ คลิกตรงไหนส่งพิกัดกลับไปให้ฟอร์ม
function ClickToPick({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// เลื่อนแผนที่ไปหาหมุดเมื่อพิกัดเปลี่ยน (เช่น กดใช้ตำแหน่งปัจจุบัน)
function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), 16), { duration: 0.6 });
  }, [lat, lng, map]);
  return null;
}

interface PickerProps {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
}

// แผนที่ในฟอร์มแจ้งเรื่อง ให้คลิกเลือกตำแหน่งปักหมุด
export function LocationPicker({ lat, lng, onPick }: PickerProps) {
  const hasPin = lat !== null && lng !== null;
  return (
    <MapContainer
      center={hasPin ? [lat, lng] : MAP_CENTER}
      zoom={hasPin ? 16 : 14}
      scrollWheelZoom
      className="h-72 w-full rounded-box z-0 cursor-crosshair"
    >
      <TileLayer url={TILE_URL} attribution={TILE_CREDIT} />
      <ClickToPick onPick={onPick} />
      {hasPin && (
        <>
          <Marker position={[lat, lng]} icon={pickIcon} />
          <FlyTo lat={lat} lng={lng} />
        </>
      )}
    </MapContainer>
  );
}
