"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/AppNavbar";
import api from "@/lib/api";
import {
  ArrowLeft,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";

type EmployerApplication = {
  id: number;
  job_title?: string;
  candidate_username?: string;
  candidate_email?: string;
  resume_title?: string;
  resume_file_url?: string | null;
  match_id?: number | null;
  match_score?: number | null;
  status?: string;
  cover_note?: string;
  created_at?: string;
};

export default function EmployerApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<EmployerApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const getApplicationStatusLabel = (status?: string) => {
    switch (status) {
      case "pending":
        return "Beklemede";
      case "reviewed":
        return "İncelendi";
      case "accepted":
        return "Kabul Edildi";
      case "rejected":
        return "Reddedildi";
      case "withdrawn":
        return "Geri Çekildi";
      default:
        return "Durum belirtilmedi";
    }
  };

  const getApplicationStatusClass = (status?: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "reviewed":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "accepted":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "withdrawn":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const userType = localStorage.getItem("user_type");

      if (userType !== "employer") {
        router.replace("/login?role=employer");
        return;
      }

      const res = await api.get("/applications/employer/");
      setApplications(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Başvurular alınamadı:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    applicationId: number,
    newStatus: string
  ) => {
    try {
      await api.patch(`/applications/status/${applicationId}/`, {
        status: newStatus,
      });

      setApplications((prev) =>
        prev.map((application) =>
          application.id === applicationId
            ? { ...application, status: newStatus }
            : application
        )
      );
    } catch (error: any) {
      console.error("Başvuru durumu güncellenemedi:", error);

      alert(
        error?.response?.data?.detail ||
          "Başvuru durumu güncellenirken hata oluştu."
      );
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-900">
      <AppNavbar />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <button
          type="button"
          onClick={() => router.push("/employer/dashboard")}
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          İşveren Paneline Dön
        </button>

        <section className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-rose-50 p-4">
                <Users className="h-8 w-8 text-rose-600" />
              </div>

              <div>
                <p className="text-sm font-bold text-rose-600">
                  Aday Başvuruları
                </p>
                <h1 className="mt-1 text-4xl font-black text-slate-950">
                  Gelen Başvurular
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                  İlanlarınıza başvuran adayları inceleyebilir, CV dosyalarını
                  görüntüleyebilir, eşleşme sonuçlarına ulaşabilir ve başvuru
                  durumlarını güncelleyebilirsiniz.
                </p>
              </div>
            </div>

            <span className="rounded-full bg-cyan-50 px-5 py-3 text-sm font-black text-cyan-700">
              {applications.length} başvuru
            </span>
          </div>
        </section>

        {loading ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
            Başvurular yükleniyor...
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Henüz başvuru bulunmuyor.
            </h2>
            <p className="mt-3 text-slate-500">
              Adaylar ilanlarınıza başvurduğunda bu sayfada listelenecek.
            </p>
          </div>
        ) : (
          <section className="space-y-5">
            {applications.map((application) => (
              <article
                key={application.id}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-black text-slate-950">
                      {application.job_title || "İlan bilgisi yok"}
                    </h2>

                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      Aday:{" "}
                      <span className="text-slate-900">
                        {application.candidate_username || "Aday bilgisi yok"}
                      </span>
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      E-posta: {application.candidate_email || "Belirtilmedi"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-sm font-bold ${getApplicationStatusClass(
                          application.status
                        )}`}
                      >
                        Durum: {getApplicationStatusLabel(application.status)}
                      </span>

                      {application.resume_title && (
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                          CV: {application.resume_title}
                        </span>
                      )}

                      {application.match_score !== null &&
                        application.match_score !== undefined && (
                          <span className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-sm font-bold text-cyan-700">
                            Eşleşme: %{Math.round(Number(application.match_score))}
                          </span>
                        )}
                    </div>

                    {application.cover_note && (
                      <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                        Not: {application.cover_note}
                      </p>
                    )}

                    {application.created_at && (
                      <p className="mt-3 text-xs text-slate-400">
                        Başvuru tarihi:{" "}
                        {new Date(application.created_at).toLocaleDateString(
                          "tr-TR"
                        )}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateStatus(application.id, "reviewed")
                      }
                      disabled={
                        application.status === "accepted" ||
                        application.status === "rejected" ||
                        application.status === "withdrawn"
                      }
                      className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Eye className="h-4 w-4" />
                      İncelendi Yap
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateStatus(application.id, "accepted")
                      }
                      disabled={application.status === "withdrawn"}
                      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Kabul Et
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateStatus(application.id, "rejected")
                      }
                      disabled={application.status === "withdrawn"}
                      className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Reddet
                    </button>

                    {application.resume_file_url && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            window.open(application.resume_file_url || "", "_blank")
                          }
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          <FileText className="h-4 w-4" />
                          CV Gör
                        </button>

                        <a
                          href={application.resume_file_url}
                          download
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          CV İndir
                        </a>
                      </>
                    )}

                    {application.match_id && (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/matching/result/${application.match_id}`)
                        }
                        className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-bold text-white shadow-[0_10px_24px_rgba(14,165,233,0.22)]"
                      >
                        Eşleşmeyi Gör
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}