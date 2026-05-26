"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

export default function JobListNavbar() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const token =
      localStorage.getItem("access") || localStorage.getItem("access_token");

    const storedUserType = localStorage.getItem("user_type");

    setIsLoggedIn(Boolean(token));
    setUserType(storedUserType);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_type");
    localStorage.removeItem("company_name");
    localStorage.removeItem("social_login_next");

    setIsLoggedIn(false);
    setUserType(null);

    router.push("/job-list");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center"
        >
          <BrandLogo />
        </button>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
          <button
            type="button"
            onClick={() => router.push("/job-list")}
            className="rounded-2xl bg-indigo-50 px-5 py-3 text-indigo-700"
          >
            İş İlanları
          </button>

          <button
            type="button"
            onClick={() => router.push("/login?role=employer")}
            className="transition hover:text-slate-950"
          >
            İşverenler İçin
          </button>

          {isLoggedIn && userType === "candidate" && (
            <>
              <button
                type="button"
                onClick={() => router.push("/matching")}
                className="transition hover:text-slate-950"
              >
                Eşleşme
              </button>

              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="transition hover:text-slate-950"
              >
                Profil
              </button>
            </>
          )}

          {isLoggedIn && userType === "employer" && (
            <>
              <button
                type="button"
                onClick={() => router.push("/employer/dashboard")}
                className="transition hover:text-slate-950"
              >
                İşveren Paneli
              </button>

              <button
                type="button"
                onClick={() => router.push("/employer/jobs")}
                className="transition hover:text-slate-950"
              >
                İlanlarım
              </button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(14,165,233,0.25)] transition hover:scale-[1.01]"
            >
              Çıkış Yap
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => router.push("/login?role=candidate")}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Giriş Yap
              </button>

              <button
                type="button"
                onClick={() => router.push("/register?role=candidate")}
                className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(14,165,233,0.25)] transition hover:scale-[1.01]"
              >
                Üye Ol
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}