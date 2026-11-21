import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { useMe, useRegister } from "../hooks/useAuth";
import { useUiStore } from "../stores/useUiStore";
import { safeNext } from "../utils";

// หน้าสมัครสมาชิก
export default function RegisterPage() {
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const navigate = useNavigate();
  const register = useRegister();
  const { user } = useMe();
  const showToast = useUiStore((s) => s.showToast);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to={next} replace />;

  // กดสมัคร เช็กรหัสผ่านตรงกันก่อน แล้วค่อยส่งไป server
  function submit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setError("กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร");
    if (password.length < 8) return setError("รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร");
    if (password !== confirm) return setError("ยืนยันรหัสผ่านไม่ตรงกัน");
    setError("");

    register.mutate(
      { name, email, phone, password },
      {
        onSuccess: () => {
          showToast("สมัครสมาชิกเรียบร้อย");
          navigate(next, { replace: true });
        },
      }
    );
  }

  const shownError = error || (register.isError ? register.error.message : "");

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={submit} className="card bg-base-100 border border-base-300">
        <div className="card-body gap-4">
          <h1 className="text-2xl font-bold text-center">สมัครสมาชิก</h1>
          <p className="text-sm text-center text-base-content/70">สมัครแล้วแจ้งปัญหาและแสดงความคิดเห็นได้ทันที</p>

          {shownError && (
            <div role="alert" className="alert alert-error text-sm">
              {shownError}
            </div>
          )}

          <label className="form-control w-full">
            <span className="label-text mb-1">ชื่อ-นามสกุล *</span>
            <input className="input input-bordered w-full" value={name} maxLength={100} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="form-control w-full">
            <span className="label-text mb-1">อีเมล *</span>
            <input
              type="email"
              className="input input-bordered w-full"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text mb-1">เบอร์โทร (ไม่บังคับ)</span>
            <input
              className="input input-bordered w-full"
              value={phone}
              inputMode="tel"
              maxLength={12}
              placeholder="0812345678"
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text mb-1">รหัสผ่าน * (อย่างน้อย 8 ตัว)</span>
            <input
              type="password"
              className="input input-bordered w-full"
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text mb-1">ยืนยันรหัสผ่าน *</span>
            <input
              type="password"
              className="input input-bordered w-full"
              value={confirm}
              autoComplete="new-password"
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </label>

          <button className="btn btn-primary" disabled={register.isPending}>
            {register.isPending && <span className="loading loading-spinner loading-sm" />}
            สมัครสมาชิก
          </button>

          <p className="text-sm text-center">
            มีบัญชีแล้ว?{" "}
            <Link to={`/login?next=${encodeURIComponent(next)}`} className="link font-medium underline-offset-4">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
