import { create } from "zustand";
import { persist } from "zustand/middleware";

// เก็บแค่ token (ฝั่ง client) ส่วนข้อมูลผู้ใช้ดึงจาก /api/auth/me ผ่าน TanStack Query
interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

// store เก็บ token เซฟลง localStorage รีเฟรชหน้าแล้วไม่หลุด
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      logout: () => set({ token: null }),
    }),
    { name: "klai-chumchon-auth" }
  )
);
