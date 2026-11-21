import { useEffect, useMemo, useState } from "react";
import { Clock, LocateFixed, Search, X } from "lucide-react";
import { useCategories, useReports } from "../hooks/useReports";
import { useUiStore } from "../stores/useUiStore";
import ReportCard from "../components/ReportCard";
import { EmptyState, ErrorAlert, GridSkeleton } from "../components/Feedback";
import { CategoryPills, StatusPills } from "../components/FilterPills";
import { distanceKm } from "../utils";

type Sort = "latest" | "near";

export default function ReportListPage() {
  const search = useUiStore((s) => s.search);
  const status = useUiStore((s) => s.status);
  const categoryId = useUiStore((s) => s.categoryId);
  const setSearch = useUiStore((s) => s.setSearch);
  const setStatus = useUiStore((s) => s.setStatus);
  const setCategoryId = useUiStore((s) => s.setCategoryId);
  const clearFilters = useUiStore((s) => s.clearFilters);

  // พิมพ์ในช่องค้นหาก่อน หยุดพิมพ์ 400ms ค่อยส่งเข้า store (กันยิง API ทุกตัวอักษร)
  const [text, setText] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setSearch(text), 400);
    return () => clearTimeout(timer);
  }, [text, setSearch]);

  const reports = useReports({ search, status, categoryId }, true);
  const categories = useCategories();

  const hasFilter = search !== "" || status !== "" || categoryId !== 0;

  // เรียง "ใกล้ฉัน": ขอตำแหน่งจากเบราว์เซอร์ แล้วเรียงฝั่งหน้าบ้าน (ไม่ยิง API เพิ่ม)
  const [sort, setSort] = useState<Sort>("latest");
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  function sortNear() {
    if (me) {
      setSort("near");
      return;
    }
    if (!navigator.geolocation) {
      setGeoError("เบราว์เซอร์นี้หาตำแหน่งไม่ได้");
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSort("near");
        setLocating(false);
      },
      () => {
        setGeoError("หาตำแหน่งไม่ได้ (อาจไม่ได้อนุญาตให้เข้าถึงตำแหน่ง) จึงเรียงตามล่าสุดแทน");
        setSort("latest");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const list = useMemo(() => {
    const data = reports.data ?? [];
    if (sort !== "near" || !me) return data.map((r) => ({ report: r, km: undefined as number | undefined }));
    return data
      .map((r) => ({ report: r, km: distanceKm(me.lat, me.lng, r.latitude, r.longitude) }))
      .sort((a, b) => a.km - b.km);
  }, [reports.data, sort, me]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">เรื่องที่แจ้งทั้งหมด</h1>
        <p className="text-base-content/70 text-sm">
          {reports.data ? `พบ ${reports.data.length} เรื่อง` : "กำลังโหลด..."}
          {sort === "near" && me && " · เรียงจากใกล้ไปไกล"}
          {reports.isFetching && !reports.isLoading && <span className="loading loading-dots loading-xs ml-2" />}
        </p>
      </div>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 gap-3">
          <div className="flex flex-col md:flex-row gap-3">
            <label className="input input-bordered w-full flex items-center gap-2">
              <Search size={16} aria-hidden="true" className="opacity-60" />
              <input
                type="search"
                className="grow"
                placeholder="ค้นหาหัวข้อ รายละเอียด จุดสังเกต หรือที่อยู่"
                aria-label="ค้นหา"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </label>
            <div role="group" aria-label="เรียงลำดับ" className="join shrink-0">
              <button
                type="button"
                className={`btn join-item ${sort === "latest" ? "btn-neutral" : "btn-ghost border border-base-300"}`}
                aria-pressed={sort === "latest"}
                onClick={() => setSort("latest")}
              >
                <Clock size={16} aria-hidden="true" /> ล่าสุด
              </button>
              <button
                type="button"
                className={`btn join-item ${sort === "near" ? "btn-neutral" : "btn-ghost border border-base-300"}`}
                aria-pressed={sort === "near"}
                onClick={sortNear}
                disabled={locating}
              >
                {locating ? <span className="loading loading-spinner loading-xs" /> : <LocateFixed size={16} aria-hidden="true" />}
                ใกล้ฉัน
              </button>
            </div>
          </div>
          <StatusPills value={status} onChange={setStatus} />
          <CategoryPills categories={categories.data} value={categoryId} onChange={setCategoryId} />
          {geoError && (
            <p className="text-sm text-error" role="status">
              {geoError}
            </p>
          )}
          {hasFilter && (
            <button
              className="btn btn-ghost btn-sm self-start"
              onClick={() => {
                clearFilters();
                setText("");
              }}
            >
              <X size={14} aria-hidden="true" /> ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>

      {reports.isLoading && <GridSkeleton />}
      {reports.isError && <ErrorAlert message={reports.error.message} onRetry={() => reports.refetch()} />}
      {reports.data && reports.data.length === 0 && <EmptyState text="ไม่พบเรื่องที่ตรงกับตัวกรอง" />}
      {reports.data && reports.data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(({ report, km }) => (
            <ReportCard key={report.id} report={report} distanceKm={km} />
          ))}
        </div>
      )}
    </div>
  );
}
