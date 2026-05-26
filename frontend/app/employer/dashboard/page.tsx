"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppNavbar from "../../../components/AppNavbar";
import {
  BriefcaseBusiness,
  FilePlus2,
  ListChecks,
  SearchCheck,
  ArrowRight,
  Sparkles,
  Users,
} from "lucide-react";

export default function EmployerDashboardPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  
  useEffect(() => {
    const userType = localStorage.getItem("user_type");
    const storedCompanyName = localStorage.getItem("company_name") || "";

    if (userType !== "employer") {
      router.replace("/login");
      return;
    }

    setCompanyName(storedCompanyName || "İşveren");
  }, [router]);

  const cards = [
    {
      title: "İlan Oluştur",
      description: "Yeni pozisyon yayınlayın ve aday havuzuna ulaşın.",
      href: "/jobs",
      icon: FilePlus2,
      badge: "Yeni ilan",
      gradient: "from-cyan-500 to-blue-500",
      bg: "bg-cyan-50",
      border: "border-cyan-100",
      text: "text-cyan-700",
    },
    {
      title: "İlanlarım",
      description: "Yayındaki ilanlarınızı görüntüleyin ve yönetin.",
      href: "/employer/jobs",
      icon: ListChecks,
      badge: "Yönetim",
      gradient: "from-indigo-500 to-violet-500",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      text: "text-indigo-700",
    },
    {
      title: "Tüm İlanlar",
      description: "Platformdaki tüm iş ilanlarını genel olarak inceleyin.",
      href: "/job-list",
      icon: SearchCheck,
      badge: "Genel görünüm",
      gradient: "from-emerald-500 to-cyan-500",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      text: "text-emerald-700",
    },
{
  title: "Gelen Başvurular",
  description: "Aday başvurularını inceleyin, değerlendirin ve durumlarını güncelleyin.",
  href: "/employer/applications",
  icon: Users,
  badge: "Başvurular",
  gradient: "from-rose-500 to-orange-500",
  bg: "bg-rose-50",
  border: "border-rose-100",
  text: "text-rose-700",
}
  ];

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-900">
      <AppNavbar />

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute right-20 top-8 h-48 w-48 rounded-full bg-indigo-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
                <Sparkles className="h-4 w-4" />
                İşveren Paneli
              </div>

              <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950">
                {companyName ? `${companyName} için işe alım merkezi` : "İşe alım merkezi"}
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                İş ilanı oluşturabilir, kendi ilanlarınızı takip edebilir ve
                aday eşleşmelerini daha düzenli şekilde yönetebilirsiniz.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => router.push("/jobs")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(14,165,233,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(14,165,233,0.30)]"
                >
                  Hemen İlan Oluştur
                  <ArrowRight className="h-5 w-5" />
                </button>

                <button
                  onClick={() => router.push("/employer/jobs")}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  İlanlarımı Gör
                </button>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-cyan-600 shadow-sm">
                  <BriefcaseBusiness className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Panel Durumu
                  </p>
                  <h2 className="text-xl font-bold text-slate-950">
                    Aktif İşveren Hesabı
                  </h2>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm text-slate-500">Şirket</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {companyName || "Belirtilmedi"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm text-slate-500">Yetki</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    İlan yayınlama ve yönetme
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-7">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-cyan-600">
              Hızlı İşlemler
            </p>
            <h2 className="mt-1 text-3xl font-bold text-slate-950">
              Ne yapmak istiyorsunuz?
            </h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.href}
                onClick={() => router.push(card.href)}
                className={`group relative overflow-hidden rounded-[2rem] border ${card.border} bg-white p-6 text-left shadow-[0_12px_32px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)]`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.gradient}`}
                />

                <div className="mb-6 flex items-start justify-between gap-4">
                  <div
                    className={`rounded-2xl ${card.bg} p-4 ${card.text} transition group-hover:scale-105`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>

                  <span
                    className={`rounded-full ${card.bg} px-3 py-1 text-xs font-semibold ${card.text}`}
                  >
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-2xl font-extrabold text-slate-950">
                  {card.title}
                </h3>

                <p className="mt-3 min-h-[52px] text-sm leading-7 text-slate-600">
                  {card.description}
                </p>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-700 transition group-hover:translate-x-1">
                  Aç
                  <ArrowRight className="h-4 w-4" />
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}