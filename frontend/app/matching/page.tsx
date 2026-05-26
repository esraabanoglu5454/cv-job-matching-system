"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles, SearchCheck } from "lucide-react";
import api from "../../lib/api";
import AppNavbar from "../../components/AppNavbar";

export default function MatchingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#eef2f7] p-8 text-slate-900">
          Eşleşme sayfası yükleniyor...
        </main>
      }
    >
      <MatchingContent />
    </Suspense>
  );
}

function MatchingContent() {
  const router = useRouter();

  const [resumes, setResumes] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const jobIdFromUrl = searchParams.get("job_id");

  const normalizeList = (value: any): string[] => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter(Boolean).map((item) => String(item));
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const getMatchedSkills = (data: any): string[] => {
  return normalizeList(
    data?.matched_skills ||
      data?.matchedSkills ||
      data?.matched ||
      data?.matching_skills ||
      data?.common_skills
  );
};

const getMissingSkills = (data: any): string[] => {
  return normalizeList(
    data?.missing_skills ||
      data?.missingSkills ||
      data?.missing ||
      data?.unmatched_skills
  );
};

const getResumeSkills = (data: any): string[] => {
  return normalizeList(
    data?.resume_skills ||
      data?.resumeSkills ||
      data?.cv_skills ||
      data?.candidate_skills
  );
};

const getJobSkills = (data: any): string[] => {
  return normalizeList(
    data?.job_skills ||
      data?.jobSkills ||
      data?.required_skills ||
      data?.job_required_skills
  );
};

  useEffect(() => {
  if (!jobIdFromUrl || jobs.length === 0) return;

  const exists = jobs.some((job) => Number(job.id) === Number(jobIdFromUrl));

  if (exists) {
    setSelectedJob(String(jobIdFromUrl));
  }
}, [jobIdFromUrl, jobs]);

  useEffect(() => {
    Promise.all([api.get("/resumes/my-resumes/"), api.get("/jobs/public/")])
      .then(([resumeRes, jobRes]) => {
        setResumes(resumeRes.data);
        setJobs(jobRes.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const runMatching = async () => {
    if (!selectedResume || !selectedJob) {
      alert("Lütfen bir CV ve bir iş ilanı seçin.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/matching/run/", {
        resume_id: Number(selectedResume),
        job_id: Number(selectedJob),
      });
      console.log("MATCH RESPONSE:", res.data);
      setResult(res.data);
    } catch (error: any) {
      console.error("MATCH ERROR:", error);
      console.error("MATCH ERROR DATA:", error?.response?.data);
      if (error?.response?.status === 401) {
        alert("Oturum süresi dolmuş olabilir. Lütfen yeniden giriş yapın.");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        router.push("/login");
        return;
      }
      alert(
        error?.response?.data?.detail ||
          "Eşleştirme işlemi sırasında bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  };

const handleApplyWithSelectedResume = async () => {
  if (!selectedResume) {
    alert("Başvuru yapmak için önce bir CV seçmelisin.");
    return;
  }

  if (!selectedJob) {
    alert("Başvuru yapmak için önce bir iş ilanı seçmelisin.");
    return;
  }

  const matchResultId =
    result?.id || result?.match_id || result?.match_result_id;

  if (!matchResultId) {
    alert("Başvuru yapmadan önce eşleştirme sonucunun oluşması gerekiyor.");
    console.log("Result içinde gelen veri:", result);
    return;
  }

  try {
    const res = await api.post(`/applications/apply/${selectedJob}/`, {
      resume_id: Number(selectedResume),
      match_result_id: Number(matchResultId),
    });

    alert(res.data.detail || "Başvurunuz başarıyla alındı.");
    router.push("/job-list");
  } catch (error: any) {
    console.error("Başvuru hatası:", error);
    console.error("Başvuru hata detayı:", error?.response?.data);

    alert(
      error?.response?.data?.detail ||
        "Başvuru yapılırken bir hata oluştu."
    );
  }
};

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-600";
    if (score >= 50) return "text-amber-500";
    return "text-rose-500";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 75) return "Yüksek Uyum";
    if (score >= 50) return "Orta Uyum";
    return "Düşük Uyum";
  };

  const matchedSkills = getMatchedSkills(result);
  const missingSkills = getMissingSkills(result);
  const resumeSkills = getResumeSkills(result);
  const jobSkills = getJobSkills(result);

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-900">
      <AppNavbar />
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-8 flex items-center justify-between rounded-[2rem] border border-slate-200 bg-white px-8 py-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div>
            <p className="text-sm font-medium text-cyan-600">
              Yapay Zeka Eşleştirme
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              CV - İş İlanı Eşleştirme
            </h1>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-50 p-3">
                <SearchCheck className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Eşleştirme Parametreleri
                </h2>
                <p className="text-sm text-slate-500">
                  Bir CV ve bir iş ilanı seçerek eşleştirmeyi başlatın.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  CV Seç
                </label>
                <select
                  value={selectedResume}
                  onChange={(e) => setSelectedResume(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400"
                >
                  <option value="">CV seçin</option>
                  {resumes.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.title} ({cv.file_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                {jobIdFromUrl && selectedJob && (
  <div className="mb-4 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
    İş ilanları sayfasından geldin. Seçilen ilan otomatik olarak işaretlendi.
    Şimdi CV seçip eşleştirmeyi başlatabilirsin.
  </div>
)}
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  İş İlanı Seç
                </label>
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400"
                >
                  <option value="">İş ilanı seçin</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} - {job.company_name} -{" "}
                      {job.location || "Lokasyon yok"}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={runMatching}
                disabled={loading}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-md transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Sparkles className="h-5 w-5" />
                {loading ? "Eşleştiriliyor..." : "Eşleştirme Başlat"}
              </button>
            </div>

            {result && (
              <div className="mt-8 space-y-5">
                <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                  <p className="mb-2 text-sm text-slate-500">
                    Opsiyonel Beceriler
                  </p>
                  <div className="text-base leading-7 text-slate-800">
                    {result.optional_skills?.length > 0
                      ? result.optional_skills.join(", ")
                      : "Opsiyonel beceri bulunamadı."}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                  <p className="mb-2 text-sm text-slate-500">
                    Eşleşen Beceriler
                  </p>
                  <div className="text-base leading-7 text-slate-800">
                    {matchedSkills.length > 0
                      ? matchedSkills.join(", ")
                      : "Eşleşen beceri bulunamadı."}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                  <p className="mb-2 text-sm text-slate-500">Öneri</p>
                  <p className="text-slate-800">{result.recommendation}</p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                  <p className="mb-2 text-sm text-slate-500">
                    Tahmini Gelişim Süresi
                  </p>
                  <p className="text-lg font-semibold text-cyan-600">
                    {result.learning_time?.label || "-"}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {result.learning_time?.description ||
                      "Tahmini süre bilgisi yok."}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                  <p className="mb-4 text-sm text-slate-500">
                    Akıllı Gelişim Önerileri
                  </p>

                  {(result.recommendations?.length > 0 ||
  result.learning_plan?.steps?.length > 0) ? (
  <div className="space-y-4">
    {result.recommendations?.length > 0 ? (
      result.recommendations.map((item: any, index: number) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-cyan-700">
              {item.skill}
            </h4>
            <span className="rounded-xl bg-cyan-50 px-3 py-1 text-xs text-cyan-700">
              {item.priority || "Orta"} Öncelik
            </span>
          </div>

          <p className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Kurs:</span>{" "}
            {item.course || "Öneri hazırlanıyor"}
          </p>
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Süre:</span>{" "}
            {item.duration || "-"}
          </p>
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Seviye:</span>{" "}
            {item.level || "-"}
          </p>
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Katkı:</span>{" "}
            {item.impact || "-"}
          </p>
        </div>
      ))
    ) : (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        Bu eşleşme için detaylı öğrenme planı oluşturuldu. Yol haritasını görmek
        için alttaki butonu kullanın.
      </div>
    )}
    {result.final_score < 70 && (
                  <button
                    onClick={() =>
                      router.push(
                        `/recommendations?resume_id=${selectedResume}&job_id=${selectedJob}`
                      )
                    }
                    className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-md transition hover:scale-[1.01]"
                  >
                    Eksik Becerilere Göre Kurs ve Yol Haritası Önerilerini Gör
                  </button>
                )}
                
  </div>
) : (
  <p className="text-sm text-slate-600">
    Şu an için gelişim önerisi bulunmuyor.
  </p>
)}
                </div>
              </div>
            )}
          </section>
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <h2 className="mb-6 text-2xl font-semibold text-slate-900">
              Eşleşme Sonucu
            </h2>

            {result ? (
              <div className="space-y-5">
                <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                  <p className="mb-2 text-sm text-slate-500">Seçilen CV</p>
                  <p className="text-slate-800">
                    {resumes.find((r) => String(r.id) === selectedResume)
                      ?.title || "-"}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                  <p className="mb-2 text-sm text-slate-500">
                    Seçilen İş İlanı
                  </p>
                  <p className="text-slate-800">
                    {jobs.find((j) => String(j.id) === selectedJob)?.title ||
                      "-"}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                  <p className="mb-2 text-sm text-slate-500">Final Skor</p>
                  <div
                    className={`text-3xl font-bold ${getScoreColor(
                      result.final_score
                    )}`}
                  >
                    %{result.final_score}
                  </div>
                  <button
  type="button"
  onClick={handleApplyWithSelectedResume}
  className="mt-5 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-md transition hover:scale-[1.01]"
>
  Bu CV ile Başvur
</button>
                  <span className="mt-3 inline-block rounded-2xl bg-slate-100 px-3 py-1 text-sm text-slate-700">
                    {getScoreBadge(result.final_score)}
                  </span>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                  <p className="mb-2 text-sm text-slate-500">CV Becerileri</p>
                  <div className="text-base leading-7 text-slate-800">
                    {resumeSkills.length > 0
                      ? resumeSkills.join(", ")
                      : "CV içinde beceri bulunamadı."}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                  <p className="mb-2 text-sm text-slate-500">
                    İş İlanı Becerileri
                  </p>
                  <div className="text-base leading-7 text-slate-800">
                    {jobSkills.length > 0
                      ? jobSkills.join(", ")
                      : "İş ilanında beceri bulunamadı."}
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                  <p className="mb-2 text-sm text-slate-500">
                    Eksik Beceriler
                  </p>
                  <div className="text-base leading-7 text-slate-800">
                    {missingSkills.length > 0
                      ? missingSkills.join(", ")
                      : "Eksik beceri bulunamadı."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5 text-slate-600">
                Henüz bir eşleştirme sonucu yok. Sol taraftan seçim yapıp işlemi
                başlatın.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}