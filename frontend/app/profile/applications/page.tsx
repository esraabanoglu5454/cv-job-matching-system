"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase } from "lucide-react";
import api from "@/lib/api";
import AppNavbar from "@/components/AppNavbar";

type MyApplication = {
  id: number;
  job: number;
  job_title: string;
  company_name: string;
  location?: string;
  employment_type?: string;
  salary_range?: string;
  resume: number;
  resume_title?: string;
  match_result?: number;
  match_score?: number | null;
  status?: string;
  cover_note?: string;
  created_at: string;
};
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
      return "bg-amber-50 text-amber-700";
    case "reviewed":
      return "bg-blue-50 text-blue-700";
    case "accepted":
      return "bg-emerald-50 text-emerald-700";
    case "rejected":
      return "bg-rose-50 text-rose-700";
    case "withdrawn":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export default function MyApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const totalApplications = applications.length;

const pendingCount = applications.filter(
  (application) => application.status === "pending"
).length;

const reviewedCount = applications.filter(
  (application) => application.status === "reviewed"
).length;

const acceptedCount = applications.filter(
  (application) => application.status === "accepted"
).length;

const rejectedCount = applications.filter(
  (application) => application.status === "rejected"
).length;

const withdrawnCount = applications.filter(
  (application) => application.status === "withdrawn"
).length;

const handleWithdrawApplication = async (applicationId: number) => {
  const confirmWithdraw = window.confirm(
    "Bu başvuruyu geri çekmek istediğinize emin misiniz?"
  );

  if (!confirmWithdraw) return;

  try {
    await api.patch(`/applications/withdraw/${applicationId}/`);

    setApplications((prev) =>
      prev.map((application) =>
        application.id === applicationId
          ? { ...application, status: "withdrawn" }
          : application
      )
    );

    alert("Başvuru başarıyla geri çekildi.");
  } catch (error: any) {
    console.error("Başvuru geri çekilemedi:", error);
    alert(
      error?.response?.data?.detail ||
        "Başvuru geri çekilirken bir hata oluştu."
    );
  }
};

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const res = await api.get("/applications/my-applications/");
      setApplications(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Başvurular alınamadı:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userType = (localStorage.getItem("user_type") || "candidate")
      .trim()
      .toLowerCase();

    if (userType === "employer") {
      router.replace("/profile");
      return;
    }

    fetchApplications();
  }, []);

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-900">
      <AppNavbar />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between rounded-[2rem] border border-slate-200 bg-white px-6 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div>
            <p className="text-sm font-medium text-cyan-600">Aday Paneli</p>
            <h1 className="text-3xl font-bold text-slate-900">Başvurularım</h1>
            <p className="mt-2 text-sm text-slate-500">
              Başvurduğunuz ilanları, kullandığınız CV’leri ve eşleşme skorlarınızı buradan takip edebilirsiniz.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Profile Dön
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
      Toplam
    </p>
    <p className="mt-2 text-3xl font-black text-slate-950">
      {totalApplications}
    </p>
    <p className="mt-1 text-xs text-slate-500">Tüm başvurular</p>
  </div>

  <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
      Beklemede
    </p>
    <p className="mt-2 text-3xl font-black text-amber-700">
      {pendingCount}
    </p>
    <p className="mt-1 text-xs text-amber-700/80">Henüz incelenmedi</p>
  </div>

  <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
      İncelendi
    </p>
    <p className="mt-2 text-3xl font-black text-blue-700">
      {reviewedCount}
    </p>
    <p className="mt-1 text-xs text-blue-700/80">İşveren görüntüledi</p>
  </div>

  <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
      Kabul
    </p>
    <p className="mt-2 text-3xl font-black text-emerald-700">
      {acceptedCount}
    </p>
    <p className="mt-1 text-xs text-emerald-700/80">Olumlu sonuçlandı</p>
  </div>

  <div className="rounded-3xl border border-rose-100 bg-rose-50 p-5 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-wide text-rose-700">
      Reddedildi
    </p>
    <p className="mt-2 text-3xl font-black text-rose-700">
      {rejectedCount}
    </p>
    <p className="mt-1 text-xs text-rose-700/80">Olumsuz sonuçlandı</p>
  </div>

  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
      Geri Çekildi
    </p>
    <p className="mt-2 text-3xl font-black text-slate-700">
      {withdrawnCount}
    </p>
    <p className="mt-1 text-xs text-slate-500">Aday iptal etti</p>
  </div>
</div>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-50 p-3">
                <Briefcase className="h-6 w-6 text-cyan-600" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Başvuru Listesi
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Toplam başvuru sayınız aşağıda listelenmiştir.
                </p>
              </div>
            </div>

            <span className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-700">
              {applications.length} başvuru
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-500">
              Başvurular yükleniyor...
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-bold text-slate-900">
                Henüz başvurunuz yok.
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                İş ilanları sayfasından ilanları inceleyip CV’nizle başvuru yapabilirsiniz.
              </p>

              <button
                type="button"
                onClick={() => router.push("/job-list")}
                className="mt-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white"
              >
                İş İlanlarına Git
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <article
                  key={application.id}
                  className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-xl font-black text-slate-950">
                        {application.job_title || "İlan bilgisi yok"}
                      </h3>

                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        {application.company_name || "Şirket bilgisi yok"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-sm">
                        {application.location && (
                          <span className="rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-600">
                            📍 {application.location}
                          </span>
                        )}

                        {application.employment_type && (
                          <span className="rounded-full bg-cyan-50 px-3 py-1 font-semibold text-cyan-700">
                            {application.employment_type}
                          </span>
                        )}

                        {application.salary_range && (
                          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                            💼 {application.salary_range}
                          </span>
                        )}

                        {application.status && (
                            <span
                                className={`rounded-full px-3 py-1 font-semibold ${getApplicationStatusClass(
                                    application.status
                                )}`}
                            >
                            Durum: {getApplicationStatusLabel(application.status)}
                            </span>
                        )}
                      </div>

                      <p className="mt-3 text-sm text-slate-500">
                        Kullanılan CV:{" "}
                        <span className="font-semibold text-slate-700">
                          {application.resume_title || "CV"}
                        </span>
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Başvuru tarihi:{" "}
                        <span className="font-semibold text-slate-700">
                          {new Date(application.created_at).toLocaleDateString("tr-TR")}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="rounded-2xl border border-cyan-100 bg-white px-5 py-4 text-center">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Eşleşme Skoru
                        </p>

                        <p className="mt-2 text-3xl font-black text-cyan-700">
                          {application.match_score !== null &&
                          application.match_score !== undefined
                            ? `%${Math.round(Number(application.match_score))}`
                            : "-"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => router.push(`/job-list/${application.job}`)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        İlanı Gör
                      </button>

                      {application.match_result && (
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/matching/result/${application.match_result}`)
                          }
                          className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white"
                        >
                          Eşleşmeyi Gör
                        </button>
                      )}
                      {application.status !== "withdrawn" &&
                        application.status !== "accepted" &&
                          application.status !== "rejected" && (
                      <button
                        type="button"
                        onClick={() => handleWithdrawApplication(application.id)}
                        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        Başvuruyu Geri Çek
                      </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}