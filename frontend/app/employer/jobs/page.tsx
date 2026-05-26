"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { formatJobDescription } from "@/lib/formatJobDescription";

type Job = {
  id: number;
  title: string;
  company_name: string;
  description: string;
  required_skills: string[] | string;
  location: string;
  employment_type: string;
  salary_range: string;
  created_at: string;
};

export default function EmployerJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const userType = localStorage.getItem("user_type");
      if (userType !== "employer") {
        router.replace("/login");
        return;
      }

      const res = await api.get("/jobs/my-jobs/");
      setJobs(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id: number) => {
    const ok = confirm("Bu ilanı silmek istediğinize emin misiniz?");
    if (!ok) return;

    try {
      await api.delete(`/jobs/delete/${id}/`);
      setJobs((prev) => prev.filter((job) => job.id !== id));
    } catch (error) {
      console.error(error);
      alert("İlan silinirken hata oluştu.");
    }
  };

  return (
    <main className="min-h-screen bg-[#eef2f7] px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">İlanlarım</h1>
            <p className="mt-2 text-slate-500">
              Yayındaki iş ilanlarınızı buradan yönetebilirsiniz.
            </p>
          </div>

          <button
            onClick={() => router.push("/employer/jobs/create")}
            className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 font-semibold text-white"
          >
            Yeni İlan
          </button>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8">
            Yükleniyor...
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8">
            Henüz ilanınız yok.
          </div>
        ) : (
          <div className="space-y-4">
           {jobs.map((job) => {
  const formattedSections = formatJobDescription(job.description || "");

  return (
    <div
      key={job.id}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{job.title}</h2>
                    <p className="mt-1 text-slate-500">{job.company_name}</p>

                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      {job.location && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                          {job.location}
                        </span>
                      )}
                      {job.employment_type && (
                        <span className="rounded-full bg-cyan-100 px-3 py-1 text-cyan-700">
                          {job.employment_type}
                        </span>
                      )}
                      {job.salary_range && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                          {job.salary_range}
                        </span>
                      )}
                    </div>

 <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
{formattedSections.map((section, sectionIndex) => (
  <section key={sectionIndex} className="space-y-4">
    <h4 className="text-lg font-bold text-slate-900">
      {section.title}
    </h4>

    {section.type === "text" && (
      <p className="text-sm leading-7 text-slate-700">
        {section.text}
      </p>
    )}

    {section.type === "list" && (
      <ul className="space-y-2 text-sm leading-7 text-slate-700">
        {(section.items || []).map((item, itemIndex) => (
          <li key={itemIndex} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    )}

    {section.type === "criteria" && (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(section.criteria || []).map((item, itemIndex) => (
          <div
            key={itemIndex}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {item.label}
            </p>
            <p className="mt-2 text-sm font-semibold leading-7 text-slate-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    )}
  </section>
))} 
</div>
                  </div>

                  <button
                    onClick={() => handleDelete(job.id)}
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
                  >
                    Sil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}