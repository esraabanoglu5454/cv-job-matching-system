"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../lib/api";
import BrandLogo from "../../components/BrandLogo";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#eef2f7] px-6 text-slate-900">
          <div className="rounded-2xl bg-white px-6 py-4 text-slate-600 shadow-sm">
            Giriş sayfası yükleniyor...
          </div>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "candidate";

  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");

    try {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("username");
      localStorage.removeItem("user_type");
      localStorage.removeItem("company_name");

      const res = await api.post("/auth/login/", {
        username,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      localStorage.setItem("remembered_username", username);

      const meRes = await api.get("/users/me/");
      const user = meRes.data;

      const resolvedUserType =
        user.user_type && String(user.user_type).trim() !== ""
          ? String(user.user_type).trim().toLowerCase()
          : role;

      localStorage.setItem("user_id", String(user.id));
      localStorage.setItem("username", user.username || username);
      localStorage.setItem("user_type", resolvedUserType);
      localStorage.setItem("company_name", user.company_name || "");

      if (resolvedUserType === "employer") {
        router.push("/employer/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("LOGIN ERROR:", err);

      if (err?.response?.status === 401) {
        setError("Kullanıcı adı veya şifre hatalı.");
      } else if (err?.message === "Network Error") {
        setError("Sunucuya bağlanılamadı. Backend çalışıyor mu kontrol edin.");
      } else {
        setError("Giriş sırasında bir hata oluştu.");
      }
    }
  };

  const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const handleGoogleLogin = () => {
  const selectedRole = role || "candidate";

  localStorage.setItem("social_login_role", selectedRole);

  // window.location.href = "http://127.0.0.1:8000/accounts/google/login/";
  window.location.href = `${API_BASE_URL}/accounts/google/login/`;
};

const handleFacebookLogin = () => {
  const selectedRole = role || "candidate";

  localStorage.setItem("social_login_role", selectedRole);
  window.location.href = `${API_BASE_URL}/accounts/facebook/login/`;

  // window.location.href = "http://127.0.0.1:8000/accounts/facebook/login/";
};

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef2f7] px-6 text-slate-900">
      <div className="flex w-full max-w-md flex-col items-center">
        <div className="mb-8">
          <BrandLogo />
        </div>

        <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">
            {role === "employer"
              ? "İşveren Girişi"
              : role === "candidate"
              ? "Aday Girişi"
              : "Giriş Yap"}
          </h1>

          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="mt-2 text-slate-500">
                {role === "employer"
                  ? "İlan yayınlamak ve işveren paneline erişmek için giriş yapın."
                  : role === "candidate"
                  ? "CV yüklemek ve ilan eşleşmelerini görmek için giriş yapın."
                  : "AI destekli CV eşleştirme sistemine giriş yapın."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleLogin} autoComplete="on" className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Kullanıcı Adı
              </label>

              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400"
                placeholder="Kullanıcı adınızı girin"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Şifre
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400"
                placeholder="Şifrenizi girin"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-md transition hover:scale-[1.01]"
            >
              Giriş Yap
            </button>
            <div className="mt-6">
  <div className="flex items-center gap-3">
    <div className="h-px flex-1 bg-slate-200" />
    <span className="text-sm font-medium text-slate-400">
      veya sosyal hesap ile devam et
    </span>
    <div className="h-px flex-1 bg-slate-200" />
  </div>

  <div className="mt-4 grid grid-cols-2 gap-3">
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
    >
      <span className="text-lg">G</span>
      Google
    </button>

    <button
      type="button"
      onClick={handleFacebookLogin}
      className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
    >
      <span className="text-lg text-blue-600">f</span>
      Facebook
    </button>
  </div>
</div>
          </form>
        </div>
      </div>
    </main>
  );
}