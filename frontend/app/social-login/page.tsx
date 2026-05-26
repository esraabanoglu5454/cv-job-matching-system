"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

function SocialLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
const access = searchParams.get("access");
const refresh = searchParams.get("refresh");

const socialRole = localStorage.getItem("social_login_role");

const userType =
  searchParams.get("user_type") ||
  socialRole ||
  "candidate";

    if (!access || !refresh) {
      router.replace("/login?social_error=token_missing");
      return;
    }

    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("user_type", userType);
    localStorage.removeItem("social_login_role");

    const nextPath = localStorage.getItem("social_login_next");

if (nextPath) {
  localStorage.removeItem("social_login_next");
  router.replace(nextPath);
  return;
}

if (userType === "employer") {
  router.replace("/employer/dashboard");
} else {
  router.replace("/job-list");
}
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef5f9] px-4">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        <div className="mb-6 flex justify-center">
          <BrandLogo />
        </div>

        <h1 className="text-2xl font-bold text-slate-950">
          Giriş tamamlanıyor
        </h1>

        <p className="mt-3 text-slate-600">
          Sosyal hesabınız doğrulandı. Hesabınıza yönlendiriliyorsunuz.
        </p>
      </div>
    </main>
  );
}

export default function SocialLoginPage() {
  return (
    <Suspense fallback={null}>
      <SocialLoginContent />
    </Suspense>
  );
}