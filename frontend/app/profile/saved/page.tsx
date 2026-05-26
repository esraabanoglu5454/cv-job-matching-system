"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bookmark } from "lucide-react";
import AppNavbar from "@/components/AppNavbar";

type SavedJob = {
  id: number;
  title: string;
  company_name?: string;
  location?: string;
  employment_type?: string;
  salary_range?: string;
  created_at?: string;
};

export default function SavedJobsPage() {
  const router = useRouter();

  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);

  useEffect(() => {
    const userType = (localStorage.getItem("user_type") || "candidate")
      .trim()
      .toLowerCase();

    if (userType === "employer") {
      router.replace("/profile");
      return;
    }

    const savedJobsRaw = localStorage.getItem("saved_jobs");

    if (!savedJobsRaw) {
      setSavedJobs([]);
      return;
    }

    try {
      const parsed = JSON.parse(savedJobsRaw);
      setSavedJobs(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.error("Kaydedilen ilanlar okunamadı:", error);
      setSavedJobs([]);
    }
  }, [router]);

  const handleRemoveSavedJob = (jobId: number) => {
    const updatedSavedJobs = savedJobs.filter((job) => job.id !== jobId);

    setSavedJobs(updatedSavedJobs);
    localStorage.setItem("saved_jobs", JSON.stringify(updatedSavedJobs));
  };

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-900">
      <AppNavbar />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between rounded-[2rem] border border-slate-200 bg-white px-6 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div>
            <p className="text-sm font-medium text-cyan-600">Aday Paneli</p>
            <h1 className="text-3xl font-bold text-slate-900">
              Kaydettiklerim
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Daha sonra incelemek için kaydettiğiniz iş ilanları burada listelenir.
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

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-50 p-3">
                <Bookmark className="h-6 w-6 text-cyan-600" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Kayıtlı İlanlar
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Toplam kayıtlı ilan sayınız aşağıda listelenmiştir.
                </p>
              </div>
            </div>

            <span className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-700">
              {savedJobs.length} kayıtlı ilan
            </span>
          </div>

          {savedJobs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-bold text-slate-900">
                Henüz kaydedilen ilan yok.
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                İş ilanları sayfasından ilgilendiğiniz ilanları kaydedebilirsiniz.
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
              {savedJobs.map((job) => (
                <article
                  key={job.id}
                  className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-xl font-black text-slate-950">
                        {job.title}
                      </h3>

                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        {job.company_name || "Şirket bilgisi yok"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-sm">
                        {job.location && (
                          <span className="rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-600">
                            📍 {job.location}
                          </span>
                        )}

                        {job.employment_type && (
                          <span className="rounded-full bg-cyan-50 px-3 py-1 font-semibold text-cyan-700">
                            {job.employment_type}
                          </span>
                        )}

                        {job.salary_range && (
                          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                            💼 {job.salary_range}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => router.push(`/job-list/${job.id}`)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        İlanı Gör
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveSavedJob(job.id)}
                        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        Kaldır
                      </button>
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