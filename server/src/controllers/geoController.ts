import type { Request, Response } from "express";

// ---------- เรียก API ภายนอก ----------
// Nominatim (OpenStreetMap): แปลงพิกัด <-> ที่อยู่  https://nominatim.org/release-docs/latest/api/Overview/
// Open-Meteo Air Quality: ค่าฝุ่น PM2.5 / PM10      https://open-meteo.com/en/docs/air-quality-api
// หน้าบ้านเรียกผ่าน server เราเท่านั้น เพราะ Nominatim กำหนดให้ส่ง User-Agent และยิงได้ไม่เกิน 1 ครั้ง/วินาที

const NOMINATIM_URL = "https://nominatim.openstreetmap.org";
const AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const USER_AGENT = "KlaiChumchon/1.0 (CS319 student project)";
const TIMEOUT_MS = 8000;

// ---------- cache ในหน่วยความจำ (ที่เดิมไม่ต้องถาม API ซ้ำ) ----------

const cache = new Map<string, { value: unknown; expires: number }>();
const MAX_CACHE = 500;

function getCache<T>(key: string): T | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (hit.expires < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return hit.value as T;
}

function setCache(key: string, value: unknown, ttlMs: number) {
  // เต็มแล้วลบตัวเก่าสุดทิ้ง (Map เรียงตามลำดับที่ใส่)
  if (cache.size >= MAX_CACHE) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { value, expires: Date.now() + ttlMs });
}

// ---------- คิวให้ยิง Nominatim ห่างกันอย่างน้อย 1.1 วินาที ----------

let queue: Promise<unknown> = Promise.resolve();
let lastCall = 0;

function nominatim<T>(path: string, params: Record<string, string>): Promise<T> {
  const run = async () => {
    const wait = lastCall + 1100 - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastCall = Date.now();
    const qs = new URLSearchParams({ format: "jsonv2", "accept-language": "th", ...params });
    return fetchJson<T>(`${NOMINATIM_URL}${path}?${qs}`);
  };
  const job = queue.then(run, run);
  queue = job.catch(() => undefined);
  return job;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`external API ${res.status}`);
  return (await res.json()) as T;
}

// ---------- ตรวจ input ----------

function readCoords(req: Request): { lat: number; lng: number } | null {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (req.query.lat === undefined || req.query.lng === undefined) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

// ตัด "รหัสไปรษณีย์" กับ "ประเทศไทย" ออก ให้ที่อยู่สั้นลง
function shortAddress(displayName: string): string {
  return displayName
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "" && !/^\d{5}$/.test(s) && s !== "ประเทศไทย" && s !== "Thailand")
    .join(", ")
    .slice(0, 300);
}

function externalError(res: Response, err: unknown, what: string) {
  console.error(`[geo] ${what}:`, err instanceof Error ? err.message : err);
  res.status(502).json({ success: false, message: `ดึงข้อมูล${what}ไม่สำเร็จ ลองใหม่อีกครั้ง` });
}

// ---------- controllers ----------

interface NominatimPlace {
  display_name?: string;
  name?: string;
  lat: string;
  lon: string;
  error?: string;
}

// GET /api/geo/reverse?lat=..&lng=..  พิกัด -> ที่อยู่
export async function reverseGeocode(req: Request, res: Response) {
  const c = readCoords(req);
  if (!c) return res.status(400).json({ success: false, message: "พิกัดไม่ถูกต้อง" });

  // ปัดทศนิยม 5 ตำแหน่ง (~1 เมตร) จุดเดียวกันใช้ cache ได้
  const key = `rev:${c.lat.toFixed(5)},${c.lng.toFixed(5)}`;
  const cached = getCache<{ address: string | null }>(key);
  if (cached) return res.json({ success: true, data: cached });

  try {
    const place = await nominatim<NominatimPlace>("/reverse", {
      lat: String(c.lat),
      lon: String(c.lng),
      zoom: "18",
    });
    // จุดกลางทะเล/ไม่มีข้อมูล Nominatim ตอบ { error: "Unable to geocode" }
    const data = { address: place.display_name ? shortAddress(place.display_name) : null };
    setCache(key, data, 24 * 60 * 60 * 1000);
    res.json({ success: true, data });
  } catch (err) {
    externalError(res, err, "ที่อยู่");
  }
}

// GET /api/geo/search?q=..  ชื่อสถานที่ -> รายการพิกัด (ค้นเฉพาะในไทย)
export async function searchPlaces(req: Request, res: Response) {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (q.length < 2 || q.length > 100) {
    return res.status(400).json({ success: false, message: "คำค้นต้องยาว 2-100 ตัวอักษร" });
  }

  const key = `search:${q.toLowerCase()}`;
  const cached = getCache<unknown[]>(key);
  if (cached) return res.json({ success: true, data: cached });

  try {
    const places = await nominatim<NominatimPlace[]>("/search", { q, countrycodes: "th", limit: "5" });
    const data = places.map((p) => ({
      name: p.name || "",
      address: shortAddress(p.display_name || ""),
      lat: Number(p.lat),
      lng: Number(p.lon),
    }));
    setCache(key, data, 24 * 60 * 60 * 1000);
    res.json({ success: true, data });
  } catch (err) {
    externalError(res, err, "สถานที่");
  }
}

interface OpenMeteoAir {
  current?: { time: string; pm2_5: number | null; pm10: number | null; us_aqi: number | null };
}

// GET /api/geo/air?lat=..&lng=..  ค่าฝุ่นปัจจุบันที่ตำแหน่งนั้น
export async function getAirQuality(req: Request, res: Response) {
  const c = readCoords(req);
  if (!c) return res.status(400).json({ success: false, message: "พิกัดไม่ถูกต้อง" });

  // ข้อมูลเป็นกริดราว 10 กม. ปัด 2 ตำแหน่ง (~1 กม.) แล้ว cache 30 นาที
  const key = `air:${c.lat.toFixed(2)},${c.lng.toFixed(2)}`;
  const cached = getCache<unknown>(key);
  if (cached) return res.json({ success: true, data: cached });

  try {
    const qs = new URLSearchParams({
      latitude: c.lat.toFixed(4),
      longitude: c.lng.toFixed(4),
      current: "pm2_5,pm10,us_aqi",
      timezone: "Asia/Bangkok",
    });
    const json = await fetchJson<OpenMeteoAir>(`${AIR_URL}?${qs}`);
    if (!json.current) throw new Error("no current data");
    const data = {
      pm25: json.current.pm2_5,
      pm10: json.current.pm10,
      aqi: json.current.us_aqi,
      time: json.current.time,
    };
    setCache(key, data, 30 * 60 * 1000);
    res.json({ success: true, data });
  } catch (err) {
    externalError(res, err, "คุณภาพอากาศ");
  }
}
