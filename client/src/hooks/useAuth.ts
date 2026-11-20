import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMe, fetchUsers, login, register, updateUserRole } from "../api/reportApi";
import { useAuthStore } from "../stores/useAuthStore";
import type { LoginData, RegisterData, Role } from "../types";

// ผู้ใช้ที่ล็อกอินอยู่ (ถ้าไม่มี token จะไม่ยิง API)
export function useMe() {
  const token = useAuthStore((s) => s.token);
  const query = useQuery({
    queryKey: ["me", token],
    queryFn: fetchMe,
    enabled: token !== null,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
  return {
    user: token ? query.data : undefined,
    // มี token แต่ยังโหลดไม่เสร็จ = ยังไม่รู้ว่าเป็นใคร
    isLoading: token !== null && query.isLoading,
    // มี token แต่ถาม server ไม่ได้ (server ล่ม/เน็ตหลุด) ไม่ใช่ token หมดอายุ
    // ถ้า token หมดอายุ (401) reportApi จะ logout ให้ token เป็น null ไปแล้ว
    connectionError: token !== null && !query.data && query.isError ? query.error.message : null,
    retry: query.refetch,
  };
}

export function useLogin() {
  const setToken = useAuthStore((s) => s.setToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginData) => login(data),
    onSuccess: (result) => {
      // ใส่ข้อมูลผู้ใช้ลง cache เลย ไม่ต้องยิง /me ซ้ำ
      qc.setQueryData(["me", result.token], result.user);
      setToken(result.token);
    },
  });
}

export function useRegister() {
  const setToken = useAuthStore((s) => s.setToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterData) => register(data),
    onSuccess: (result) => {
      qc.setQueryData(["me", result.token], result.user);
      setToken(result.token);
    },
  });
}

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: fetchUsers });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: number; role: Role }) => updateUserRole(v.id, v.role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
