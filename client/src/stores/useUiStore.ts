import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReportStatus } from "../types";

// Zustand เก็บแค่ state ฝั่งหน้าจอ ข้อมูลเรื่องที่แจ้งอยู่ใน TanStack Query อย่างเดียว
interface UiState {
  theme: "klai" | "klai-night";
  bookmarks: number[]; // เก็บแค่ id
  search: string;
  status: ReportStatus | "";
  categoryId: number; // 0 = ทุกหมวด
  toast: { text: string; type: "success" | "error" } | null;

  toggleTheme: () => void;
  toggleBookmark: (id: number) => void;
  removeBookmark: (id: number) => void;
  pruneBookmarks: (existingIds: number[]) => void;
  setSearch: (text: string) => void;
  setStatus: (status: ReportStatus | "") => void;
  setCategoryId: (id: number) => void;
  clearFilters: () => void;
  showToast: (text: string, type?: "success" | "error") => void;
  hideToast: () => void;
}

// store ของ Zustand เก็บสถานะหน้าจอ: ธีม บุ๊กมาร์ก ตัวกรอง และ toast (ธีมกับบุ๊กมาร์กเซฟลง localStorage)
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: "klai",
      bookmarks: [],
      search: "",
      status: "",
      categoryId: 0,
      toast: null,

      toggleTheme: () => set((s) => ({ theme: s.theme === "klai" ? "klai-night" : "klai" })),

      toggleBookmark: (id) =>
        set((s) => ({
          bookmarks: s.bookmarks.includes(id)
            ? s.bookmarks.filter((x) => x !== id)
            : [...s.bookmarks, id],
        })),

      // ใช้ตอนเรื่องถูกลบ จะได้ไม่มี id ค้าง
      removeBookmark: (id) => set((s) => ({ bookmarks: s.bookmarks.filter((x) => x !== id) })),

      // เรื่องอาจถูกคนอื่นลบไปแล้ว เก็บไว้เฉพาะ id ที่ยังมีอยู่จริง
      pruneBookmarks: (existingIds) =>
        set((s) => {
          const kept = s.bookmarks.filter((x) => existingIds.includes(x));
          return kept.length === s.bookmarks.length ? s : { bookmarks: kept };
        }),

      setSearch: (text) => set({ search: text }),
      setStatus: (status) => set({ status }),
      setCategoryId: (id) => set({ categoryId: id }),
      clearFilters: () => set({ search: "", status: "", categoryId: 0 }),

      showToast: (text, type = "success") => set({ toast: { text, type } }),
      hideToast: () => set({ toast: null }),
    }),
    {
      name: "klai-chumchon-ui",
      // บันทึกลง localStorage แค่ธีมกับบุ๊กมาร์ก
      partialize: (s) => ({ theme: s.theme, bookmarks: s.bookmarks }),
      // v0 เก็บชื่อธีมเก่า (emerald / dim) แปลงเป็นชื่อธีมใหม่
      version: 1,
      migrate: (persisted, version) => {
        // ข้อมูลเก่าที่เคยเก็บไว้ในเครื่อง
        const state = persisted as UiState;
        if (version < 1) {
          if (state.theme === ("dim" as string)) {
            state.theme = "klai-night";
          } else {
            state.theme = "klai";
          }
        }
        return state;
      },
    }
  )
);
