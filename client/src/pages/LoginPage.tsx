import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { useLogin, useMe } from "../hooks/useAuth";
import { useUiStore } from "../stores/useUiStore";
import { safeNext } from "../utils";

// บัญชีจาก seed.ts ไว้กดเลือกตอนสาธิต
const demoAccounts = [
  { label: "ประชาชน", email: "somchai@klai.local" },
  { label: "เจ้าหน้าที่", email: "staff1@klai.local" },
  { label: "แอดมิน", email: "admin@klai.local" },
];

export default function LoginPage() {
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const navigate = useNavigate();
  const login = useLogin();
  const { user } = useMe();
  const showToast = useUiStore((s) => s.showToast);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (user) return <Navigate to={next} replace />;

  function submit(e: FormEvent) {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: (result) => {
          showToast(`ยินดีต้อนรับ ${result.user.name}`);
          navigate(next, { replace: true });
        },
      }
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={submit} className="card bg-base-100 border border-base-300">
        <div className="card-body gap-4">
          <h1 className="text-2xl font-bold text-center">เข้าสู่ระบบ</h1>

          {login.isError && (
            <div role="alert" className="alert alert-error text-sm">
              {login.error.message}
            </div>
          )}

          <label className="form-control w-full">
            <span className="label-text mb-1">อีเมล</span>
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
            <span className="label-text mb-1">รหัสผ่าน</span>
            <input
              type="password"
              className="input input-bordered w-full"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button className="btn btn-primary" disabled={login.isPending}>
            {login.isPending && <span className="loading loading-spinner loading-sm" />}
            เข้าสู่ระบบ
          </button>

          <p className="text-sm text-center">
            ยังไม่มีบัญชี?{" "}
            <Link to={`/register?next=${encodeURIComponent(next)}`} className="link link-primary">
              สมัครสมาชิก
            </Link>
          </p>

          <div className="divider text-xs">บัญชีสาธิต (รหัสผ่าน demo1234)</div>
          <div className="flex flex-wrap justify-center gap-2">
            {demoAccounts.map((a) => (
              <button
                key={a.email}
                type="button"
                className="btn btn-xs btn-outline"
                onClick={() => {
                  setEmail(a.email);
                  setPassword("demo1234");
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
