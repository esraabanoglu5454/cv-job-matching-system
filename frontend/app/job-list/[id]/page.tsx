"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { formatJobDescription } from "@/lib/formatJobDescription";
import JobListNavbar from "@/components/JobListNavbar";


type Job = {
  id: number;
  title: string;
  company_name: string;
  description: string;
  required_skills?: string[] | string;
  optional_skills?: string[] | string;
  location?: string;
  employment_type?: string;
  salary_range?: string;
  created_at?: string;
};

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();

  const jobId = params.id;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access") || localStorage.getItem("access_token")
      : null;

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${jobId}/`);
        setJob(res.data);
      } catch (error) {
        console.error("İlan detayı alınamadı:", error);
        setError("İlan detayı alınırken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const handleApply = () => {
    if (!job) return;

    if (!token) {
      alert("Başvuru yapmak için aday hesabıyla giriş yapmalısınız.");
      router.push(`/login?role=candidate`);
      return;
    }

    router.push(`/matching?job_id=${job.id}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f3f6f9] text-slate-900">
        <JobListNavbar />
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            Yükleniyor...
          </div>
        </div>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="min-h-screen bg-[#f3f6f9] text-slate-900">
        <JobListNavbar />
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="rounded-3xl bg-white p-8 text-red-600 shadow-sm">
            {error || "İlan bulunamadı."}
          </div>
        </div>
      </main>
    );
  }

  const formattedSections = formatJobDescription(job.description || "");

  return (
    <main className="min-h-screen bg-[#f3f6f9] text-slate-900">
      <JobListNavbar />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <button
          type="button"
          onClick={() => router.push("/job-list")}
          className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ← İş ilanlarına dön
        </button>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {job.employment_type && (
                  <span className="rounded-full bg-cyan-50 px-4 py-1 text-sm font-semibold text-cyan-700">
                    {job.employment_type}
                  </span>
                )}

                <span className="rounded-full bg-indigo-50 px-4 py-1 text-sm font-semibold text-indigo-700">
                  Genel
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950">
                {job.title}
              </h1>

              <button
                type="button"
                onClick={() =>
                  router.push(`/company/${encodeURIComponent(job.company_name || "Şirket")}`)
              }
                className="mt-3 text-2xl font-bold text-slate-800 transition hover:text-cyan-600 hover:underline"
              >
                {job.company_name || "Şirket bilgisi yok"}
              </button>

              <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium text-slate-700">
                {job.location && (
                  <span className="rounded-full bg-rose-50 px-4 py-2 text-rose-600">
                    📍 {job.location}
                  </span>
                )}

                {job.salary_range && (
                  <span className="rounded-full bg-slate-100 px-4 py-2">
                    💼 {job.salary_range}
                  </span>
                )}

                {job.created_at && (
                  <span className="rounded-full bg-slate-100 px-4 py-2">
                    🗓️ {new Date(job.created_at).toLocaleDateString("tr-TR")}
                  </span>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-8 text-2xl font-black text-slate-950">
                İş Açıklaması
              </h2>

              <div className="space-y-10">
                {formattedSections.map((section, sectionIndex) => (
                  <section key={sectionIndex} className="space-y-4">
                    <h3 className="text-xl font-black text-slate-900">
                      {section.title}
                    </h3>

                    {section.type === "text" && (
                      <p className="text-base leading-8 text-slate-700">
                        {section.text}
                      </p>
                    )}

                    {section.type === "list" && (
                      <ul className="space-y-3 text-base leading-8 text-slate-700">
                        {section.items?.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex gap-3">
                            <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.type === "criteria" && (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {section.criteria?.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                              {item.label}
                            </p>
                            <p className="mt-2 text-base font-semibold leading-7 text-slate-900">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-2xl font-black text-slate-950">
              Hemen başvur
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              Bu ilana başvurmak için CV’nizle eşleştirme yapabilir ve uygunluk
              skorunuzu görebilirsiniz.
            </p>

            <button
              type="button"
              onClick={handleApply}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-4 font-bold text-white shadow-[0_10px_25px_rgba(14,165,233,0.25)] transition hover:scale-[1.01]"
            >
              Bu İlana Başvur
            </button>

            {!token && (
              <p className="mt-4 text-xs leading-6 text-slate-500">
                Başvuru yapabilmek için aday hesabıyla giriş yapmanız gerekir.
              </p>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}