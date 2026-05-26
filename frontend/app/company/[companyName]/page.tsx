"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Briefcase,
  MapPin,
  Users,
  Heart,
  CalendarDays,
} from "lucide-react";
import AppNavbar from "@/components/AppNavbar";
import api from "@/lib/api";

type Job = {
  id: number;
  title: string;
  company_name: string;
  description?: string;
  location?: string;
  employment_type?: string;
  salary_range?: string;
  created_at?: string;
  sector?: string;
};

export default function CompanyProfilePage() {
  const router = useRouter();
  const params = useParams();

  const companyNameParam = params.companyName as string;
  const companyName = decodeURIComponent(companyNameParam || "");
  const [companyProfile, setCompanyProfile] = useState<any | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const normalizeText = (value?: string) =>
  String(value || "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ");

const companyJobs = useMemo(() => {
  return jobs.filter((job) => {
    const jobCompanyName = normalizeText(job.company_name);
    const pageCompanyName = normalizeText(companyName);

    return jobCompanyName === pageCompanyName;
  });
}, [jobs, companyName]);

  const mainCompanyJob = companyJobs[0];

useEffect(() => {
  const fetchJobs = async () => {
    try {
      setLoading(true);

      const res = await api.get("/jobs/public/");

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.results)
        ? res.data.results
        : [];

      console.log("COMPANY PAGE PARAM:", companyName);
      console.log("ALL JOBS:", data);
      console.log(
        "JOB COMPANY NAMES:",
        data.map((job: any) => job.company_name)
      );

      setJobs(data);
    } catch (error) {
      console.error("Şirket ilanları alınamadı:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  fetchJobs();
}, [companyName]);

useEffect(() => {
  const fetchCompanyProfile = async () => {
    try {
      const res = await api.get(
        `/users/company-profile/public/?company_name=${encodeURIComponent(
          companyName
        )}`
      );

      setCompanyProfile(res.data);
    } catch (error) {
      console.error("Public şirket profili alınamadı:", error);
      setCompanyProfile(null);
    }
  };

  if (companyName) {
    fetchCompanyProfile();
  }
}, [companyName]);

  useEffect(() => {
    const followedCompaniesRaw = localStorage.getItem("followed_companies");

    if (!followedCompaniesRaw) {
      setIsFollowing(false);
      return;
    }

    try {
      const followedCompanies = JSON.parse(followedCompaniesRaw);

      setIsFollowing(
        Array.isArray(followedCompanies) &&
          followedCompanies.some(
            (company: string) =>
              company.trim().toLowerCase() === companyName.trim().toLowerCase()
          )
      );
    } catch {
      setIsFollowing(false);
    }
  }, [companyName]);

  const handleToggleFollow = () => {
    const followedCompaniesRaw = localStorage.getItem("followed_companies");
    let followedCompanies: string[] = [];

    if (followedCompaniesRaw) {
      try {
        const parsed = JSON.parse(followedCompaniesRaw);
        followedCompanies = Array.isArray(parsed) ? parsed : [];
      } catch {
        followedCompanies = [];
      }
    }

    const alreadyFollowing = followedCompanies.some(
      (company) =>
        company.trim().toLowerCase() === companyName.trim().toLowerCase()
    );

    let updatedCompanies: string[];

    if (alreadyFollowing) {
      updatedCompanies = followedCompanies.filter(
        (company) =>
          company.trim().toLowerCase() !== companyName.trim().toLowerCase()
      );
      setIsFollowing(false);
    } else {
      updatedCompanies = [...followedCompanies, companyName];
      setIsFollowing(true);
    }

    localStorage.setItem(
      "followed_companies",
      JSON.stringify(updatedCompanies)
    );
  };

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-900">
      <AppNavbar />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </button>

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
          <div className="h-40 bg-gradient-to-r from-indigo-100 via-cyan-100 to-blue-100" />

          <div className="relative px-8 pb-8">
            <div className="-mt-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                <div className="flex h-32 w-32 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-lg">
                  <Building2 className="h-16 w-16 text-cyan-600" />
                </div>

                <div className="pb-2">
                  <h1 className="text-4xl font-black text-slate-950">
                    {companyName || "Şirket"}
                  </h1>

                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                      <Briefcase className="h-4 w-4" />
                      {companyProfile?.sector || mainCompanyJob?.sector || "Sektör bilgisi yok"}
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-600">
                      <MapPin className="h-4 w-4" />
                      {companyProfile?.location || mainCompanyJob?.location || "Konum bilgisi yok"}
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 font-semibold text-cyan-700">
                      <Users className="h-4 w-4" />
                      {companyJobs.length} aktif ilan
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleFollow}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-bold transition ${
                  isFollowing
                    ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_12px_28px_rgba(14,165,233,0.25)]"
                }`}
              >
                <Heart className="h-5 w-5" />
                {isFollowing ? "Takip Ediliyor" : "Takip Et"}
              </button>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.35fr_0.65fr]">
          <aside className="space-y-4">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">
                Şirket Menüsü
              </h2>

              <div className="mt-4 space-y-2">
                <a
                  href="#hakkinda"
                  className="block rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700"
                >
                  Hakkında
                  {companyProfile?.employee_count && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-700">
                    👥 {companyProfile.employee_count} çalışan
                    </span>
                  )}
                  {companyProfile?.website && (
                    <a
                      href={companyProfile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                       Web Sitesini Gör
                    </a>
                  )}
                </a>

                <a
                  href="#ilanlar"
                  className="block rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Şirket İlanları
                </a>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Aktif İlan Sayısı
              </p>
              <p className="mt-2 text-4xl font-black text-cyan-700">
                {companyJobs.length}
              </p>
            </div>
          </aside>

          <section className="space-y-8">
            <div
              id="hakkinda"
              className="rounded-[1.5rem] border border-slate-200 bg-white p-7 shadow-sm"
            >
              <h2 className="text-2xl font-black text-slate-950">
                {companyName} Hakkında
              </h2>

              <p className="mt-4 text-base leading-8 text-slate-600">
                {companyProfile?.description ||
                `${companyName}, platformda iş ilanı yayınlayan ve adaylarla dijital ortamda buluşan bir işveren profilidir. Adaylar bu sayfa üzerinden şirketin açık pozisyonlarını inceleyebilir, uygun ilanlara başvurabilir ve şirketi takip ederek daha sonra tekrar değerlendirebilir.`}
              </p>

              <div className="mt-6 rounded-2xl border-l-4 border-cyan-500 bg-cyan-50 p-5">
                <p className="text-sm font-bold text-slate-900">
                  Şirket Lokasyonu
                </p>
                <p className="mt-1 text-slate-700">
                  {mainCompanyJob?.location || "Konum bilgisi belirtilmemiş"}
                </p>
              </div>
            </div>

            <div
              id="ilanlar"
              className="rounded-[1.5rem] border border-slate-200 bg-white p-7 shadow-sm"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">
                    {companyName} İş İlanları
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Bu şirket tarafından yayınlanan açık pozisyonlar.
                  </p>
                </div>

                <span className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-700">
                  {companyJobs.length} ilan
                </span>
              </div>

              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-500">
                  İlanlar yükleniyor...
                </div>
              ) : companyJobs.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <h3 className="text-lg font-bold text-slate-900">
                    Bu şirkete ait aktif ilan bulunamadı.
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Şirket yeni ilan yayınladığında burada görüntülenir.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {companyJobs.map((job) => (
                    <article
                      key={job.id}
                      className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-xl font-black text-slate-950">
                            {job.title}
                          </h3>

                          <div className="mt-3 flex flex-wrap gap-2 text-sm">
                            {job.employment_type && (
                              <span className="rounded-full bg-cyan-50 px-3 py-1 font-semibold text-cyan-700">
                                {job.employment_type}
                              </span>
                            )}

                            {job.location && (
                              <span className="rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-600">
                                📍 {job.location}
                              </span>
                            )}

                            {job.salary_range && (
                              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                                💼 {job.salary_range}
                              </span>
                            )}

                            {job.created_at && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                                <CalendarDays className="h-4 w-4" />
                                {new Date(job.created_at).toLocaleDateString(
                                  "tr-TR"
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => router.push(`/job-list/${job.id}`)}
                          className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-sm font-bold text-white"
                        >
                          İlanı İncele
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}