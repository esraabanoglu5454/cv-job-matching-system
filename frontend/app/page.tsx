"use client";

import { useRouter } from "next/navigation";
import AuthEntryMenu from "../components/AuthEntryMenu";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { X } from "lucide-react";
import {
  Sparkles,
  SearchCheck,
  Target,
  CheckCircle2,
  BrainCircuit,
  Route,
  BriefcaseBusiness,
  Users,
  FileText,
  BarChart3,
  Building2,
  GraduationCap,
  UserCheck,
  ClipboardList,
  ArrowUp
} from "lucide-react";

function LandingLogo() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-[1.6rem] bg-gradient-to-br from-indigo-600 via-violet-500 to-cyan-400 shadow-[0_14px_30px_rgba(79,70,229,0.28)]">
        <div className="absolute inset-0 rounded-[1.6rem] bg-white/10 blur-[2px]" />
        <svg
          viewBox="0 0 64 64"
          className="relative h-8 w-8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="24" cy="22" r="10" fill="white" fillOpacity="0.96" />
          <path
            d="M39 38c0-6.627-5.373-12-12-12h-6c-6.627 0-12 5.373-12 12v1h30v-1Z"
            fill="white"
            fillOpacity="0.96"
          />
          <path
            d="M38 18l4 4 10-10"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-cyan-600">
          AI Job Matching
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Careea
        </h1>
      </div>
    </div>
  );
}

type FeaturedJob = {
  id: number;
  title: string;
  company_name: string;
  location: string;
  employment_type?: string;
  salary_range?: string;
  description?: string;
  required_skills?: string[] | string;
  sector?: string;
  created_at?: string;
};


const candidateFeatures = [
  {
    title: "CV Analizi",
    desc: "PDF, DOCX veya metin formatındaki özgeçmişlerden beceriler çıkarılır.",
    icon: FileText,
  },
  {
    title: "Eksik Beceri Tespiti",
    desc: "Adayın hedef role göre eksik kaldığı teknik ve mesleki beceriler belirlenir.",
    icon: Target,
  },
  {
    title: "Kurs Yönlendirme",
    desc: "Eksik becerilere göre öğrenme kaynakları ve kurs önerileri sunulur.",
    icon: GraduationCap,
  },
  {
    title: "Kariyer Yol Haritası",
    desc: "Adayın hedef role ulaşması için izleyebileceği kişisel gelişim planı oluşturulur.",
    icon: Route,
  },
];

const employerFeatures = [
  {
    title: "İlan Oluşturma",
    desc: "İşverenler açık pozisyonlarını sistemde hızlıca yayınlayabilir.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Başvuru Yönetimi",
    desc: "Gelen başvurular tek panel üzerinden düzenli şekilde takip edilir.",
    icon: ClipboardList,
  },
  {
    title: "CV İnceleme",
    desc: "Başvuran adayların CV dosyaları sistem üzerinden görüntülenebilir.",
    icon: FileText,
  },
  {
    title: "Eşleşme Verileri",
    desc: "Adayların ilana uygunluğu ve eşleşme geçmişi işveren tarafından incelenebilir.",
    icon: BarChart3,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [featuredJobs, setFeaturedJobs] = useState<FeaturedJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [selectedJob, setSelectedJob] = useState<FeaturedJob | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationEmail, setApplicationEmail] = useState("");

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (!element) return;

  const navbarOffset = 115;
  const y =
    element.getBoundingClientRect().top + window.pageYOffset - navbarOffset;

  window.scrollTo({
    top: y,
    behavior: "smooth",
  });
};

const openJobDetail = (job: FeaturedJob) => {
  setSelectedJob(job);
  setShowApplyModal(false);
};

const openApplyModal = (job: FeaturedJob) => {
  setSelectedJob(job);
  setShowApplyModal(true);
};

const closeJobModals = () => {
  setSelectedJob(null);
  setShowApplyModal(false);
  setApplicationEmail("");
};

const handleGuestApply = () => {
  if (!applicationEmail.trim()) {
    alert("Lütfen e-posta adresinizi girin.");
    return;
  }

  router.push("/login?role=candidate");
};
useEffect(() => {
  const fetchFeaturedJobs = async () => {
    try {
      setJobsLoading(true);
      setJobsError("");

      const res = await api.get("/jobs/public/");

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.results)
        ? res.data.results
        : [];

      setFeaturedJobs(data.slice(0, 3));
    } catch (error) {
      console.error("Öne çıkan ilanlar alınamadı:", error);
      setJobsError("Öne çıkan ilanlar yüklenemedi.");
    } finally {
      setJobsLoading(false);
    }
  };

  fetchFeaturedJobs();
}, []);

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};


  return (
    <main className="min-h-screen bg-[#eef3f8] pt-[118px] text-slate-800 lg:pt-[122px]">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
  <div className="mx-auto max-w-7xl px-6">
    <header className="flex flex-col gap-5 px-8 py-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:flex-row lg:items-center lg:justify-between lg:rounded-b-[2rem]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-10">
        <LandingLogo />

        <nav className="flex flex-wrap items-center gap-3 lg:gap-8">
          <button
            type="button"
            onClick={() => scrollToSection("hakkimizda")}
            className="text-sm font-medium text-slate-700 transition hover:text-cyan-600 lg:text-base"
          >
            Hakkımızda
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("misyonumuz")}
            className="text-sm font-medium text-slate-700 transition hover:text-cyan-600 lg:text-base"
          >
            Misyonumuz
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("vizyonumuz")}
            className="text-sm font-medium text-slate-700 transition hover:text-cyan-600 lg:text-base"
          >
            Vizyonumuz
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("is-ilanlari")}
            className="text-sm font-medium text-slate-700 transition hover:text-cyan-600 lg:text-base"
          >
            İş İlanları
          </button>
        </nav>
      </div>

      <AuthEntryMenu />
    </header>
  </div>
</div>

      <div className="mx-auto max-w-7xl px-6 pb-8">
        <section className="mb-8 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="grid items-center gap-10 px-8 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700">
                <Sparkles className="h-4 w-4" />
                AI Destekli Kariyer ve İşe Alım Platformu
              </div>

             <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-950 lg:text-6xl">
                Adayı doğru işle,
              <span className="block bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                işvereni doğru yetenekle buluştur
              </span>
            </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                Platform; adayların CV’lerini iş ilanlarıyla analiz ederken, işverenlerin de doğru adaya daha hızlı ulaşmasını sağlar. Adaylar uygunluk skorunu, eksik yetkinliklerini ve gelişim önerilerini görebilir; işverenler ise ilan yayınlayabilir, aday başvurularını ve eşleşme sonuçlarını takip edebilir.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
  <div className="mt-8 flex flex-wrap gap-4">
  <button
    type="button"
    onClick={() => router.push("/login?role=candidate")}
    className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-3.5 text-base font-bold text-white shadow-[0_14px_30px_rgba(14,165,233,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:from-violet-600 hover:to-blue-600 hover:shadow-[0_18px_38px_rgba(79,70,229,0.35)]"
  >
    Aday Olarak Başla
  </button>

  <button
    type="button"
    onClick={() => router.push("/login?role=employer")}
    className="rounded-2xl border border-slate-300 bg-white px-8 py-3.5 text-base font-bold text-slate-800 shadow-[0_8px_22px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-transparent hover:bg-blue-600 hover:text-white hover:shadow-[0_18px_38px_rgba(37,99,235,0.28)]"
  >
    İşveren Olarak İlan Ver
  </button>
</div>
</div>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                  Akıllı beceri analizi
                </span>
                <span className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
                  Eksik yetkinlik tespiti
                </span>
                <span className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700">
                  Yol haritası önerisi
                </span>
                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                  İşveren paneli
                </span>
                
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-3 shadow-inner">
              <img
                src="/images/giriş.png"
                alt="AI CV matching hero"
                className="h-[520px] w-full rounded-[1.5rem] object-cover"
              />
            </div>
          </div>

        </section>

        <section className="mb-8 grid gap-5 lg:grid-cols-2">
  <div className="rounded-[2.5rem] border border-cyan-100 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
    <div className="mb-5 inline-flex rounded-2xl bg-cyan-100 p-3 text-cyan-700">
      <Users className="h-7 w-7" />
    </div>

    <p className="text-sm font-medium text-cyan-600">Adaylar İçin</p>

    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
      İş bulmanın yanında kendini geliştirme desteği
    </h2>

    <p className="mt-4 leading-8 text-slate-600">
      Adaylar CV’lerini yükleyerek uygun ilanları görebilir, eşleşme skorunu
      inceleyebilir, eksik becerilerini öğrenebilir ve bu eksikler için kurs
      önerileri alabilir.
    </p>

    <div className="mt-6 grid gap-3">
      {[
        "CV yükleme ve beceri çıkarımı",
        "İlanlarla eşleşme skoru",
        "Eksik yetkinlik analizi",
        "Kurs ve öğrenme planı önerisi",
      ].map((item) => (
        <div
          key={item}
          className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-slate-700"
        >
          <CheckCircle2 className="h-5 w-5 text-cyan-600" />
          <span>{item}</span>
        </div>
      ))}
    </div>

    <button
      onClick={() => router.push("/register?role=candidate")}
      className="mt-7 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-[0_10px_24px_rgba(14,165,233,0.22)] transition hover:scale-[1.02]"
    >
      Aday Olarak Kayıt Ol
    </button>
  </div>

  <div className="rounded-[2.5rem] border border-indigo-100 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
    <div className="mb-5 inline-flex rounded-2xl bg-indigo-100 p-3 text-indigo-700">
      <Building2 className="h-7 w-7" />
    </div>

    <p className="text-sm font-medium text-indigo-600">İşverenler İçin</p>

    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
      Doğru adaya daha hızlı ve güvenilir ulaşma imkânı
    </h2>

    <p className="mt-4 leading-8 text-slate-600">
      İşverenler ilan oluşturabilir, gelen başvuruları takip edebilir,
      adayların CV’lerini inceleyebilir ve eşleşme verileriyle daha bilinçli
      değerlendirme yapabilir.
    </p>

    <div className="mt-6 grid gap-3">
      {[
        "İş ilanı oluşturma",
        "Başvuruları tek panelde görme",
        "Aday CV’sini inceleme",
        "Eşleşme geçmişi ve uygunluk verisi",
      ].map((item) => (
        <div
          key={item}
          className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-slate-700"
        >
          <CheckCircle2 className="h-5 w-5 text-indigo-600" />
          <span>{item}</span>
        </div>
      ))}
    </div>

    <button
      onClick={() => router.push("/register?role=employer")}
      className="mt-7 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-3 font-semibold text-white shadow-[0_10px_24px_rgba(79,70,229,0.22)] transition hover:scale-[1.02]"
    >
      İşveren Olarak Başla
    </button>
  </div>
</section>

        <section className="mb-8 rounded-[2.5rem] border border-slate-200 bg-white px-8 py-10 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="max-w-3xl">
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
              Sadece eşleştirme değil, gelişim rehberi
            </h2>
            <p className="mt-4 text-lg leading-9 text-slate-600">
              Platform; adayın yalnızca işe ne kadar uygun olduğunu göstermekle
              kalmaz, eksik kaldığı becerileri belirler ve bu role ulaşmak için
              izlenebilecek kişisel öğrenme yolunu oluşturur.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
              <div className="mb-4 inline-flex rounded-2xl bg-cyan-100 p-3 text-cyan-700">
                <SearchCheck className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-slate-900">
                Akıllı Beceri Analizi
              </h3>
              <p className="leading-8 text-slate-600">
                CV ve iş ilanı içerikleri üzerinden beceriler çıkarılır, adayın
                güçlü ve zayıf yönleri sistematik biçimde belirlenir.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
              <div className="mb-4 inline-flex rounded-2xl bg-blue-100 p-3 text-blue-700">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-slate-900">
                Eksik Yetkinlik Tespiti
              </h3>
              <p className="leading-8 text-slate-600">
                Kullanıcının hangi alanlarda eksik kaldığı tespit edilir ve hedef
                role yaklaşabilmesi için gelişim alanları net biçimde gösterilir.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
              <div className="mb-4 inline-flex rounded-2xl bg-indigo-100 p-3 text-indigo-700">
                <Route className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-slate-900">
                Yol Haritası Mantığı
              </h3>
              <p className="leading-8 text-slate-600">
                Hedef role ulaşmak için hangi becerilerin hangi sırayla
                öğrenilebileceği adım adım planlanır.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
              <div className="mb-4 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-slate-900">
                AI Destekli Skorlama
              </h3>
              <p className="leading-8 text-slate-600">
                Sistem, beceri eşleşme mantığını anlamsal benzerlik analiziyle
                destekleyerek daha güçlü ve daha anlamlı sonuçlar üretir.
              </p>
            </div>
          </div>
        </section>

        <section
  id="is-ilanlari"
  className="mb-8 scroll-mt-[125px] rounded-[2.5rem] border border-slate-200 bg-white px-8 py-10 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
>
  <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <p className="text-sm font-medium text-cyan-600">Güncel Fırsatlar</p>

      <h2 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
        Öne çıkan iş ilanları
      </h2>

      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
        Platformda yayınlanan ilanlardan bazılarını inceleyin. Adaylar bu
        ilanları CV’leriyle eşleştirerek uygunluk skorunu görebilir.
      </p>
    </div>

    <button
      onClick={() => router.push("/job-list")}
      className="w-fit rounded-2xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      Tüm İlanları Gör
    </button>
  </div>

  <div className="mt-8">
  {jobsLoading && (
    <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 text-slate-600">
      Öne çıkan ilanlar yükleniyor...
    </div>
  )}

  {jobsError && (
    <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-600">
      {jobsError}
    </div>
  )}

  {!jobsLoading && !jobsError && featuredJobs.length === 0 && (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
      Henüz yayınlanan ilan bulunmuyor.
    </div>
  )}

  {!jobsLoading && !jobsError && featuredJobs.length > 0 && (
    <div className="grid gap-5 lg:grid-cols-3">
      {featuredJobs.map((job) => (
        <div
          key={job.id}
          className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="rounded-2xl bg-white p-3 text-cyan-700 shadow-sm">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>

            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {job.employment_type || "İş ilanı"}
            </span>
          </div>

          <h3 className="text-2xl font-bold text-slate-900">
            {job.title}
          </h3>

          <p className="mt-2 text-slate-600">
            {job.company_name || "Şirket bilgisi yok"}
          </p>

          <div className="mt-5 space-y-2 text-sm text-slate-600">
            <p>📍 {job.location || "Lokasyon belirtilmedi"}</p>
            <p>💰 {job.salary_range || "Maaş belirtilmedi"}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => openJobDetail(job)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Detayı Gör
          </button>

            <button
              onClick={() => openApplyModal(job)}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white"
            > 
              Başvur
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
</section>

<section className="mb-8 rounded-[2.5rem] border border-slate-200 bg-white px-8 py-10 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
  <div className="max-w-4xl">
    <p className="text-sm font-medium text-indigo-600">İşveren Paneli</p>

    <h2 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
      İşverenler için daha akıllı aday değerlendirme
    </h2>

    <p className="mt-4 text-lg leading-9 text-slate-600">
      Careea, işverenlerin yalnızca ilan yayınlamasını değil; gelen başvuruları
      düzenli şekilde görmesini, aday CV’lerini incelemesini ve uygunluk
      verileriyle daha hızlı karar vermesini sağlar.
    </p>
  </div>

  <div className="mt-8 grid gap-5 lg:grid-cols-4">
    {employerFeatures.map((feature) => {
      const Icon = feature.icon;

      return (
        <div
          key={feature.title}
          className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6"
        >
          <div className="mb-4 inline-flex rounded-2xl bg-indigo-100 p-3 text-indigo-700">
            <Icon className="h-6 w-6" />
          </div>

          <h3 className="mb-3 text-xl font-semibold text-slate-900">
            {feature.title}
          </h3>

          <p className="leading-7 text-slate-600">{feature.desc}</p>
        </div>
      );
    })}
  </div>
</section>

        <section className="mb-8 rounded-[2.5rem] border border-slate-200 bg-white px-8 py-10 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <h3 className="mt-2 text-3xl font-bold text-slate-900">
    Aday tarafında süreç nasıl ilerler?
  </h3>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
              <div className="mb-4 text-5xl font-bold text-cyan-600">1</div>
              <h3 className="mb-3 text-2xl font-semibold text-slate-900">
                CV Yükle
              </h3>
              <p className="leading-8 text-slate-600">
                Kullanıcı CV’sini sisteme yükler, metin ayrıştırılır ve beceri
                analizi başlatılır.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
              <div className="mb-4 text-5xl font-bold text-cyan-600">2</div>
              <h3 className="mb-3 text-2xl font-semibold text-slate-900">
                İlanı Seç
              </h3>
              <p className="leading-8 text-slate-600">
                İlgili iş ilanı ile eşleştirme yapılır, uyumlu ve eksik beceriler
                sistem tarafından belirlenir.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
              <div className="mb-4 text-5xl font-bold text-cyan-600">3</div>
              <h3 className="mb-3 text-2xl font-semibold text-slate-900">
                Kişisel Öneri Al
              </h3>
              <p className="leading-8 text-slate-600">
                Kullanıcıya kurs önerileri, yol haritası ve tahmini gelişim süresi
                gibi yönlendirici çıktılar sunulur.
              </p>
            </div>
          </div>
          <div className="mt-10 border-t border-slate-200 pt-8">
  <h3 className="mt-2 text-3xl font-bold text-slate-900">
    İşveren tarafında süreç nasıl ilerler?
  </h3>

  <div className="mt-6 grid gap-5 lg:grid-cols-3">
    <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
      <div className="mb-4 text-5xl font-bold text-cyan-600">1</div>
      <h4 className="mb-3 text-2xl font-semibold text-slate-900">
        İlan Oluştur
      </h4>
      <p className="leading-8 text-slate-600">
        İşveren açık pozisyon için ilan bilgilerini girer ve sistemi adaylara
        açık hale getirir.
      </p>
    </div>

    <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
      <div className="mb-4 text-5xl font-bold text-cyan-600">2</div>
      <h4 className="mb-3 text-2xl font-semibold text-slate-900">
        Başvuruları İncele
      </h4>
      <p className="leading-8 text-slate-600">
        Gelen başvurular panelde listelenir; adayın CV dosyası ve temel
        bilgileri görüntülenebilir.
      </p>
    </div>

    <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
      <div className="mb-4 text-5xl font-bold text-cyan-600">3</div>
      <h4 className="mb-3 text-2xl font-semibold text-slate-900">
        Uygun Adayı Seç
      </h4>
      <p className="leading-8 text-slate-600">
        Eşleşme verileri ve adayın geçmiş analizleri kullanılarak daha bilinçli
        işe alım kararı verilir.
      </p>
    </div>
  </div>
</div>
        </section>

        <section
          id="hakkimizda"
          className="mb-8 scroll-mt-[120px] rounded-[2.5rem] border border-slate-200 bg-white px-8 py-10 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
        >
          <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-3">
              <img
                src="/images/hakkımızda.png"
                alt="Hakkımızda"
                className="h-[420px] w-full rounded-[1.5rem] object-cover"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-cyan-600">Hakkımızda</p>
              <h2 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
                Bu platform ne için geliştirildi?
              </h2>

              <p className="mt-5 text-lg leading-9 text-slate-600">
                Bu proje, yalnızca adayların iş ilanlarına başvurmasını değil; adayların hangi role ne kadar uygun olduğunu görmesini, eksik yetkinliklerini fark etmesini ve gelişim planı oluşturmasını sağlar. Aynı zamanda işverenlerin de ilan yayınlama, başvuruları görüntüleme ve adayları CV-iş ilanı uyumuna göre daha bilinçli değerlendirme sürecini destekler.
              </p>

              <div className="mt-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
                <h3 className="mb-3 text-2xl font-semibold text-slate-900">
                  Klasik platformlardan farkımız
                </h3>
                <p className="leading-8 text-slate-600">
                  Klasik platformlar çoğunlukla yalnızca ilan listeleme ve başvuru alma üzerine çalışır. Bu sistem ise adayın CV’sini, iş ilanı içeriğini ve beceri yapısını birlikte analiz ederek aday tarafında uygunluk skoru, eksik beceri tespiti ve öğrenme önerileri üretir; işveren tarafında ise başvuruları daha anlamlı şekilde incelemeyi ve doğru adayları daha hızlı ayırt etmeyi kolaylaştırır.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-5 lg:grid-cols-2">
          <div
            id="misyonumuz"
            className="scroll-mt-[120px] rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
          >
            <p className="mb-3 text-sm font-medium text-cyan-600">Misyonumuz</p>
            <h3 className="mb-4 text-3xl font-bold text-slate-900">
              Doğru adayı doğru rolle buluşturmak
            </h3>
            <p className="leading-8 text-slate-600">
              Adayların yetkinliklerini daha görünür hale getirirken, işverenlerin de ilanlarına en uygun adayları daha veriye dayalı biçimde değerlendirmesini sağlamak.
            </p>
          </div>

          <div
            id="vizyonumuz"
            className="scroll-mt-[120px] rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
          >
            <p className="mb-3 text-sm font-medium text-cyan-600">Vizyonumuz</p>
            <h3 className="mb-4 text-3xl font-bold text-slate-900">
              Yapay zekâ destekli işe alım ve kariyer platformu olmak
            </h3>
            <p className="leading-8 text-slate-600">
              Eşleştirme, öğrenme önerisi, başvuru yönetimi ve aday değerlendirme süreçlerini tek platformda birleştiren akıllı ve açıklanabilir bir sistem sunmak.
            </p>
          </div>
        </section>

        <section className="mb-12 rounded-[2.5rem] border border-slate-200 bg-gradient-to-r from-cyan-50 to-blue-50 px-8 py-12 text-center shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="mx-auto max-w-4xl">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-white/80 p-3 shadow-sm">
                <CheckCircle2 className="h-7 w-7 text-cyan-600" />
              </div>
            </div>

            <p className="text-sm font-medium text-cyan-700">Hemen Başlayın</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
              Kariyer yolculuğunu ve işe alım sürecini akıllı hale getirin
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-9 text-slate-600">
               Adaylar doğru fırsatlara ulaşırken eksik becerilerini geliştirebilir;
              işverenler ise ilanlarını yayınlayıp uygun adayları daha düzenli biçimde
              değerlendirebilir.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => router.push("/register?role=candidate")}
                  className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3.5 text-lg font-semibold text-white shadow-[0_10px_24px_rgba(14,165,233,0.22)] transition hover:scale-[1.02]"
                >
                   Aday Olarak Kayıt Ol
                </button>

                <button
                  onClick={() => router.push("/register?role=employer")}
                  className="rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-lg font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  İşveren Olarak Başla
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
   <button
  type="button"
  onClick={scrollToTop}
  aria-label="Yukarı çık"
  title="Yukarı çık"
  style={{
    position: "fixed",
    right: "32px",
    bottom: "32px",
    zIndex: 999999,
  }}
  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_14px_35px_rgba(14,165,233,0.35)] transition hover:scale-105"
>
  <ArrowUp className="h-6 w-6" />
</button>

{selectedJob && !showApplyModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 999999,
      backgroundColor: "rgba(15, 23, 42, 0.55)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}
  >
    <div
      style={{
        width: "560px",
        height: "560px",
        maxWidth: "calc(100vw - 32px)",
        maxHeight: "calc(100vh - 32px)",
        backgroundColor: "white",
        borderRadius: "28px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 25px 80px rgba(15, 23, 42, 0.28)",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Kapat */}
      <button
        type="button"
        onClick={closeJobModals}
        style={{
          position: "absolute",
          top: "18px",
          right: "18px",
          zIndex: 20,
          width: "38px",
          height: "38px",
          borderRadius: "999px",
          border: "1px solid #e2e8f0",
          backgroundColor: "white",
          color: "#64748b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <X className="h-5 w-5" />
      </button>

      {/* HEADER */}
      <div
        style={{
          padding: "28px 32px 18px 32px",
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "white",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 700,
            color: "#0891b2",
          }}
        >
          İş İlanı
        </p>

        <h2
          style={{
            margin: "8px 48px 0 0",
            fontSize: "26px",
            lineHeight: "32px",
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          {selectedJob.title}
        </h2>

        <p
          style={{
            margin: "8px 0 0 0",
            fontSize: "16px",
            color: "#475569",
          }}
        >
          {selectedJob.company_name || "Şirket bilgisi yok"}
        </p>

        <div
          style={{
            marginTop: "14px",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {selectedJob.location && (
            <span
              style={{
                borderRadius: "999px",
                backgroundColor: "#fff1f2",
                color: "#e11d48",
                padding: "6px 12px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              📍 {selectedJob.location}
            </span>
          )}

          {selectedJob.employment_type && (
            <span
              style={{
                borderRadius: "999px",
                backgroundColor: "#eef2ff",
                color: "#4f46e5",
                padding: "6px 12px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {selectedJob.employment_type}
            </span>
          )}

          {selectedJob.salary_range && (
            <span
              style={{
                borderRadius: "999px",
                backgroundColor: "#fffbeb",
                color: "#b45309",
                padding: "6px 12px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              💰 {selectedJob.salary_range}
            </span>
          )}
        </div>
      </div>

      {/* BODY - sadece burası scroll olur */}
      <div
        style={{
          overflowY: "auto",
          padding: "22px 32px",
          backgroundColor: "white",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "19px",
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          İş İlanı Hakkında
        </h3>

        <p
          style={{
            margin: "12px 0 0 0",
            fontSize: "15px",
            lineHeight: "27px",
            color: "#475569",
          }}
        >
          {selectedJob.description || "Bu ilan için açıklama bulunmuyor."}
        </p>

        
      </div>

      {/* FOOTER - artık aşağı kaymaz */}
      <div
        style={{
          padding: "16px 32px",
          borderTop: "1px solid #e2e8f0",
          backgroundColor: "white",
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={closeJobModals}
          style={{
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            backgroundColor: "white",
            padding: "10px 20px",
            fontWeight: 700,
            color: "#334155",
            cursor: "pointer",
          }}
        >
          Kapat
        </button>

        <button
          type="button"
          onClick={() => setShowApplyModal(true)}
          style={{
            borderRadius: "16px",
            border: "none",
            background: "linear-gradient(to right, #06b6d4, #3b82f6)",
            padding: "10px 22px",
            fontWeight: 700,
            color: "white",
            cursor: "pointer",
          }}
        >
          Başvur
        </button>
      </div>
    </div>
  </div>
)}

      {selectedJob && showApplyModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-md">
          <div className="relative w-[430px] max-w-[calc(100vw-32px)] rounded-[2rem] border border-slate-200 bg-white px-8 pb-8 pt-12 shadow-[0_25px_80px_rgba(15,23,42,0.35)]">
            <button
              type="button"
              onClick={closeJobModals}
              aria-label="Kapat"
              style={{
                position: "absolute",
                top: "18px",
                right: "18px",
                zIndex: 50,
                width: "36px",
                height: "36px",
                borderRadius: "999px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(15, 23, 42, 0.10)",
              }}
              >
                <X className="h-5 w-5" />
            </button>

            <h3 className="pr-12 text-2xl font-bold leading-snug text-slate-900">
              Başvurmak için e-posta adresini gir
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              <span className="font-semibold text-slate-900">
                {selectedJob.title}
              </span>{" "}
              ilanına başvuruyu tamamlamak için aday girişine
              yönlendirileceksin.
            </p>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                E-posta adresi
              </label>
              <input
                type="email"
                value={applicationEmail}
                onChange={(e) => setApplicationEmail(e.target.value)}
                placeholder="ornek@mail.com"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-500"
              />
            </div>

            <button
              type="button"
              onClick={handleGuestApply}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 font-semibold text-white transition hover:opacity-95"
            >
              Devam Et
            </button>

            <p className="mt-4 text-center text-sm text-slate-500">
              Başvuruyu tamamlamak için aday girişi yapman gerekir.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}