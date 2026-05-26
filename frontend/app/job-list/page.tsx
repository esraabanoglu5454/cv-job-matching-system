"use client";
import { useEffect, useMemo, useState, useRef  } from "react";
import api from "../../lib/api";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import AppNavbar from "@/components/AppNavbar";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  MapPin,
  SlidersHorizontal,
  WalletCards,
} from "lucide-react";

import {
  TURKEY_CITIES,
  DISTRICTS_BY_CITY,
  SECTOR_OPTIONS,
  POSITION_OPTIONS,
} from "../../lib/turkeyLocations";

type Job = {
  id: number;
  title: string;
  company_name: string;
  location: string;
  city?: string;
  district?: string;
  employment_type?: string;
  salary_range?: string;
  description?: string;
  created_at?: string;
  sector?: string;
};

export default function JobListPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedDate, setSelectedDate] = useState("all");
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [topKeyword, setTopKeyword] = useState("");
  const [topLocation, setTopLocation] = useState("");
  const [showGuestApplyCard, setShowGuestApplyCard] = useState(false);
  const [selectedJobForGuestApply, setSelectedJobForGuestApply] = useState<Job | null>(null);
  const guestCardRef = useRef<HTMLDivElement | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserType, setCurrentUserType] = useState<string | null>(null);

  useEffect(() => {
  const token =
    localStorage.getItem("access") || localStorage.getItem("access_token");

  const userType = localStorage.getItem("user_type");

  setIsLoggedIn(Boolean(token));
  setCurrentUserType(userType);
}, []);

  const normalize = (value?: string) =>
    (value || "").trim().toLocaleLowerCase("tr-TR");

  const workTypeOptions = [
    "Tam Zamanlı",
    "Yarı Zamanlı",
    "Hibrit",
    "Uzaktan",
    "Staj",
  ];

  const districtOptions = selectedCity
    ? DISTRICTS_BY_CITY[selectedCity] || []
    : [];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/jobs/public/");

        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
          ? res.data.results
          : [];

        setJobs(data);
      } catch (err) {
        console.error("İlanlar alınamadı:", err);
        setError("İlanlar yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const matchesDateFilter = (createdAt?: string, filter?: string) => {
    if (!filter || filter === "all") return true;
    if (!createdAt) return false;

    const createdDate = new Date(createdAt);
    const now = new Date();

    const diffMs = now.getTime() - createdDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (filter === "today") return diffDays <= 1;
    if (filter === "week") return diffDays <= 7;
    if (filter === "month") return diffDays <= 30;

    return true;
  };

   const handleTopSearch = () => {
  setSearchTerm(topKeyword.trim());
  setLocationSearch(topLocation.trim());
};

const keywordSuggestions = useMemo(() => {
  const values = jobs.flatMap((job) => [
    job.title,
    job.company_name,
  ]);

  return Array.from(
    new Set(
      values
        .filter(Boolean)
        .map((item) => String(item).trim())
    )
  );
}, [jobs]);

const locationSuggestions = useMemo(() => {
  const values = jobs.flatMap((job) => [
    job.location,
    job.city,
    job.district,
  ]);

  return Array.from(
    new Set(
      values
        .filter(Boolean)
        .map((item) => String(item).trim())
    )
  );
}, [jobs]);

const filteredJobs = useMemo(() => {
  return jobs.filter((job) => {
    const jobLocation = normalize(job.location);
    const jobCity = normalize(job.city);
    const jobDistrict = normalize(job.district);
    const jobTitle = normalize(job.title);
    const jobCompany = normalize(job.company_name);
    const jobWorkType = normalize(job.employment_type);
    const jobSector = normalize(job.sector);
    

    const keyword = normalize(searchTerm);
    const locationKeyword = normalize(locationSearch);

    const keywordMatch =
      !keyword ||
      jobTitle.includes(keyword) ||
      jobCompany.includes(keyword);

    const locationSearchMatch =
      !locationKeyword ||
      jobLocation.includes(locationKeyword) ||
      jobCity.includes(locationKeyword) ||
      jobDistrict.includes(locationKeyword);

    const cityMatch =
      !selectedCity ||
      jobLocation.includes(normalize(selectedCity)) ||
      jobCity.includes(normalize(selectedCity));

    const districtMatch =
      !selectedDistrict ||
      jobLocation.includes(normalize(selectedDistrict)) ||
      jobDistrict.includes(normalize(selectedDistrict));

    const positionMatch =
      !selectedPosition || jobTitle.includes(normalize(selectedPosition));

    const sectorMatch =
      !selectedSector || jobSector.includes(normalize(selectedSector));

    const workTypeMatch =
      selectedWorkTypes.length === 0 ||
      selectedWorkTypes.some((type) => jobWorkType.includes(normalize(type)));

    const dateMatch = matchesDateFilter(job.created_at, selectedDate);

    return (
      keywordMatch &&
      locationSearchMatch &&
      cityMatch &&
      districtMatch &&
      positionMatch &&
      sectorMatch &&
      workTypeMatch &&
      dateMatch
    );
  });
}, [
  jobs,
  searchTerm,
  locationSearch,
  selectedCity,
  selectedDistrict,
  selectedPosition,
  selectedSector,
  selectedDate,
  selectedWorkTypes,
]);
  

const toggleWorkType = (type: string) => {
  const normalizedType = normalize(type);

  setSelectedWorkTypes((prev) =>
    prev.includes(normalizedType)
      ? prev.filter((item) => item !== normalizedType)
      : [...prev, normalizedType]
  );
};

const clearFilters = () => {
  setSelectedCity("");
  setSelectedDistrict("");
  setSelectedPosition("");
  setSelectedSector("");
  setSelectedDate("all");
  setSelectedWorkTypes([]);

  setTopKeyword("");
  setTopLocation("");
  setSearchTerm("");
  setLocationSearch("");
};

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("tr-TR");
  };

const handleApply = (job: Job) => {
  const token =
    localStorage.getItem("access") || localStorage.getItem("access_token");

  if (!token) {
    setSelectedJobForGuestApply(job);
    setShowGuestApplyCard(true);

    setTimeout(() => {
      guestCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    return;
  }

  router.push(`/matching?job_id=${job.id}`);
};

const clearAuthStorage = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_type");
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";


const handleGoogleLogin = () => {
  const nextPath = selectedJobForGuestApply?.id
    ? `/matching?job_id=${selectedJobForGuestApply.id}`
    : "/job-list";

  clearAuthStorage();

  localStorage.setItem("social_login_next", nextPath);
  localStorage.setItem("social_login_role", "candidate");
  window.location.href = `${API_BASE_URL}/accounts/google/login/`;

  // window.location.href = "http://127.0.0.1:8000/accounts/google/login/";
};

const handleFacebookLogin = () => {
  const nextPath = selectedJobForGuestApply?.id
    ? `/matching?job_id=${selectedJobForGuestApply.id}`
    : "/job-list";

  clearAuthStorage();

  localStorage.setItem("social_login_next", nextPath);
  localStorage.setItem("social_login_role", "candidate");
  window.location.href = `${API_BASE_URL}/accounts/facebook/login/`;

  // window.location.href = "http://127.0.0.1:8000/accounts/facebook/login/";
};


  return (
  <div className="min-h-screen bg-[#f3f6f9] text-slate-900">
    <AppNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-[2rem] border border-slate-200 bg-white px-6 py-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
            <BriefcaseBusiness className="h-4 w-4" />
            Güncel Fırsatlar
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
            İş İlanları
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Filtreleri kullanarak platformdaki ilanları inceleyin. 
          </p>
        </section>

        <section className="mb-8 bg-white px-8 py-6 shadow-sm">
  <div className="flex w-full max-w-5xl items-center gap-8">
    <div className="relative w-[330px]">
  <input
    type="text"
    list="keyword-suggestions"
    value={topKeyword}
    onChange={(e) => setTopKeyword(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") handleTopSearch();
    }}
    placeholder="Pozisyon veya şirket ara"
    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-5 pr-12 text-base text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
  />

  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
    🔍
  </span>

  <datalist id="keyword-suggestions">
    {keywordSuggestions.map((item) => (
      <option key={item} value={item} />
    ))}
  </datalist>
</div>

    <div className="relative w-[330px]">
  <input
    type="text"
    list="location-suggestions"
    value={topLocation}
    onChange={(e) => setTopLocation(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") handleTopSearch();
    }}
    placeholder="Şehir veya ilçe ara"
    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-5 pr-12 text-base text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
  />

  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
    🔍
  </span>

  <datalist id="location-suggestions">
    {locationSuggestions.map((item) => (
      <option key={item} value={item} />
    ))}
  </datalist>
</div>

    <button
      type="button"
      onClick={handleTopSearch}
      className="ml-2 flex h-12 min-w-[135px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 font-bold text-white shadow-[0_10px_24px_rgba(14,165,233,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(14,165,233,0.36)]"
    >
      <span>🔎</span>
      <span>İş Ara</span>
    </button>
  </div>
</section>

       <section
  className="w-full"
  style={{
    display: "grid",
    gridTemplateColumns: "280px minmax(0, 1fr) 260px",
    gap: "24px",
    alignItems: "start",
  }}
>
          <aside className="min-w-0 lg:sticky lg:top-24">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <SlidersHorizontal className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    Filtreler
                  </h2>
                  <p className="text-sm text-slate-500">
                    İlanları daha hızlı daralt
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Ülke
                  </label>
                  <select
                    disabled
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none disabled:opacity-100"
                  >
                    <option>Türkiye</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Şehir
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setSelectedDistrict("");
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white"
                  >
                    <option value="">Şehir seçin</option>
                    {TURKEY_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    İlçe
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedCity || districtOptions.length === 0}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    <option value="">
                      {!selectedCity
                        ? "Önce şehir seçin"
                        : districtOptions.length === 0
                        ? "İlçe listesi yok"
                        : "Tüm ilçeler"}
                    </option>

                    {districtOptions.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Pozisyon
                  </label>
                  <select
                    value={selectedPosition}
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white"
                  >
                    <option value="">Tüm pozisyonlar</option>
                    {POSITION_OPTIONS.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Çalışma Tercihi
                  </label>

                  <div className="space-y-2">
                    {workTypeOptions.map((type) => (
                      <label
                        key={type}
                        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:border-cyan-300 hover:bg-white"
                      >
                        <input
                          type="checkbox"
                          checked={selectedWorkTypes.includes(normalize(type))}
                          onChange={() => toggleWorkType(type)}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                        <span className="capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Tarih
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white"
                  >
                    <option value="all">Tümü</option>
                    <option value="today">Bugünün ilanları</option>
                    <option value="week">Son 7 gün</option>
                    <option value="month">Son 30 gün</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Sektör
                  </label>
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white"
                  >
                    <option value="">Tüm sektörler</option>
                    {SECTOR_OPTIONS.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={clearFilters}
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(14,165,233,0.22)] transition hover:scale-[1.01]"
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          </aside>

      

          <section className="min-w-0 w-full space-y-5">
            <div className="flex flex-col gap-2 rounded-[1.75rem] border border-slate-200 bg-white px-6 py-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  {filteredJobs.length} ilan bulundu
                </h2>
                <p className="text-sm text-slate-500">
                  Seçilen filtrelere uygun ilanlar listeleniyor.
                </p>
              </div>
            </div>

            {loading && (
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
                İlanlar yükleniyor...
              </div>
            )}

            {error && (
              <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-red-600 shadow-sm">
                {error}
              </div>
            )}

            {!loading && !error && filteredJobs.length === 0 && (
              <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">
                  İlan bulunamadı
                </h3>
                <p className="mt-2 text-slate-500">
                  Filtreleri değiştirerek tekrar deneyin.
                </p>
              </div>
            )}

            {!loading &&
              !error &&
              filteredJobs.map((job) => {
                return (
                  <article
                    key={job.id}
                    className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                            {job.employment_type || "İş ilanı"}
                          </span>

                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                            {job.sector || "Genel"}
                          </span>
                        </div>

                        <h3 className="text-2xl font-bold text-slate-950">
                          {job.title}
                        </h3>

                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                            `/company/${encodeURIComponent(job.company_name || "Şirket")}`
                          )
                          }
                          className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-cyan-600 hover:underline"
                        >
                        <Building2 className="h-4 w-4" />
                        {job.company_name || "Şirket bilgisi yok"}
                        </button>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.location && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </span>
                          )}

                          {job.salary_range && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700">
                              <WalletCards className="h-4 w-4" />
                              {job.salary_range}
                            </span>
                          )}

                          {job.created_at && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
                              <CalendarDays className="h-4 w-4" />
                              {formatDate(job.created_at)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
                        <button
                          type="button"
                          onClick={() => router.push(`/job-list/${job.id}`)}
                          className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
                        >
                          Detayı Gör
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApply(job)}
                          className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(14,165,233,0.22)] transition hover:scale-[1.01]"
                        >
                          Başvur
                        </button>
                        <button
  type="button"
  onClick={() => {
    const savedJobsRaw = localStorage.getItem("saved_jobs");
    const savedJobs = savedJobsRaw ? JSON.parse(savedJobsRaw) : [];

    const alreadySaved = savedJobs.some(
      (savedJob: any) => savedJob.id === job.id
    );

    if (alreadySaved) {
      alert("Bu ilan zaten kaydedilmiş.");
      return;
    }

    const newSavedJob = {
      id: job.id,
      title: job.title,
      company_name: job.company_name,
      location: job.location,
      employment_type: job.employment_type,
      salary_range: job.salary_range,
      created_at: job.created_at,
    };

    localStorage.setItem(
      "saved_jobs",
      JSON.stringify([...savedJobs, newSavedJob])
    );

    alert("İlan kaydedildi.");
  }}
  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
>
  Kaydet
</button>
                      </div>
                    </div>
                  </article>
                );
              })}
          </section>
              <aside className="lg:sticky lg:top-28 h-fit">
{isLoggedIn ? (
  <>
    <h3 className="text-xl font-bold text-slate-950">
      Başvuruya hazırsın
    </h3>

    <p className="mt-2 text-sm leading-6 text-slate-500">
      Aday hesabıyla giriş yaptın. İlanlara başvurmak için ilgili ilanın
      Başvur butonuna basabilirsin.
    </p>

    <button
      type="button"
      onClick={() => router.push("/matching")}
      className="mt-5 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(14,165,233,0.20)] transition hover:scale-[1.01]"
    >
      Eşleştirme Sayfasına Git
    </button>
  </>
) : (
  <>
    <h3 className="text-xl font-bold text-slate-950">
      Hemen ilanlara başvur!
    </h3>

    <p className="mt-2 text-sm leading-6 text-slate-500">
      İş ilanlarını inceleyebilir ve detaylarını görebilirsiniz. Başvuru
      yapmak için aday hesabıyla giriş yapmanız veya yeni hesap oluşturmanız
      gerekir.
    </p>

    <div className="mt-5 space-y-3">
      <button
        type="button"
        onClick={() => router.push("/register?role=candidate")}
        className="w-full rounded-2xl border border-cyan-300 bg-white px-4 py-3 text-sm font-bold text-cyan-700 transition hover:bg-cyan-50"
      >
        Üye Ol
      </button>

      <button
        type="button"
        onClick={() => router.push("/login?role=candidate")}
        className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(14,165,233,0.20)] transition hover:scale-[1.01]"
      >
        Giriş Yap
      </button>
    </div>

    <div className="my-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="text-xs text-slate-400">
        veya sosyal hesap ile devam et
      </span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>

    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:bg-slate-50"
      >
        <FcGoogle className="h-5 w-5" />
        Google
      </button>

      <button
        type="button"
        onClick={handleFacebookLogin}
        className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:bg-slate-50"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
          <FaFacebookF className="h-3 w-3 text-white" />
        </span>
        Facebook
      </button>
    </div>
  </>
)}
</aside>
        </section>
      </main>
    </div>
  );
}