"use client";

import {  Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, BookOpen, Target } from "lucide-react";
import api from "../../lib/api";
import AppNavbar from "../../components/AppNavbar";


export default function RecommendationsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#eef2f7] p-8 text-slate-900">
          Öneriler sayfası yükleniyor...
        </main>
      }
    >
      <RecommendationsContent />
    </Suspense>
  );
}

function RecommendationsContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [completedSkillsLocal, setCompletedSkillsLocal] = useState<string[]>([]);
  const resumeId = searchParams.get("resume_id");
  const jobId = searchParams.get("job_id");
  const hasFetchedRef = useRef(false);

useEffect(() => {
  if (!resumeId || !jobId) return;
  if (hasFetchedRef.current) return;

  hasFetchedRef.current = true;
  fetchRecommendationData();
}, [resumeId, jobId]);
  const fetchRecommendationData = async () => {
    if (loading) return;
  try {
    setLoading(true);

    // if (!resumeId || !jobId) {
    //   setData(null);
    //   return;
    // }

    const res = await api.post("/matching/run/", {
      resume_id: Number(resumeId),
      job_id: Number(jobId),
    });

    console.log("YENI DATA:", res.data);
    setData(res.data);
  } catch (err) {
    console.error("FETCH RECOMMENDATION ERROR:", err);
    setData(null);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  const skills = (data?.completed_by_user || []).map((s: string) =>
    s.trim().toLowerCase()
  );

  setCompletedSkillsLocal((prev) => [...new Set([...prev, ...skills])]);
}, [data]);

const markSkillCompleted = async (skill: string) => {
  const normalizedSkill = skill.trim().toLowerCase();

  if (completedSkillsLocal.includes(normalizedSkill)) return;

  try {
    setCompletedSkillsLocal((prev) => [...new Set([...prev, normalizedSkill])]);

    await api.post("/matching/skill-progress/", {
      skill_name: skill,
      status: "completed",
      source: "manual",
    });

    await fetchRecommendationData();
  } catch (error) {
    console.error("MARK SKILL ERROR:", error);

    setCompletedSkillsLocal((prev) =>
      prev.filter((item) => item !== normalizedSkill)
    );

    alert("Skill güncellenemedi.");
  }
};

 const isSkillCompleted = (skill: string) => {
  return completedSkillsLocal.includes(skill.trim().toLowerCase());
};

  const roadmapSteps =
  data?.learning_plan?.steps?.filter((step: any) => step.status !== "cv_present") || [];

  const completedStepCount = roadmapSteps.filter((step: any) =>
    completedSkillsLocal.includes(step.skill.trim().toLowerCase())
  ).length;

  const totalStepCount = roadmapSteps.length;
  const formatTitle = (text: string) =>
  String(text || "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");




  return (
    <main className="min-h-screen bg-[#eef2f7]  text-slate-900">
      <AppNavbar />
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-8 flex items-center justify-between rounded-[2rem] border border-slate-200 bg-white px-6 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div>
            <p className="text-sm text-cyan-600">Akıllı Öneri Sistemi</p>
            <h1 className="text-3xl font-bold text-slate-900">
              Kurs ve Yol Haritası Önerileri
            </h1>
          </div>
          

          <button
            onClick={() => router.push("/matching")}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Matching
          </button>
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            Yükleniyor...
          </div>
        ) : !data ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            Öneri verisi bulunamadı.
          </div>
        ) : (
            
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          
            <section className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-cyan-600" />
                <h2 className="text-2xl font-semibold text-slate-900">
                  Eksik Beceri Önerileri
                </h2>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                <p className="mb-2 text-sm text-slate-500">Final Skor</p>
                <p className="text-3xl font-bold text-cyan-600">
                  %{data.final_score}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                <p className="mb-2 text-sm text-slate-500">Zorunlu Beceriler</p>
                <p className="text-slate-700">
                  {data.required_skills?.length > 0
                    ? data.required_skills.join(", ")
                    : "Zorunlu beceri bulunamadı."}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                <p className="mb-2 text-sm text-slate-500">Opsiyonel Beceriler</p>
                <p className="text-slate-700">
                  {data.optional_skills?.length > 0
                    ? data.optional_skills.join(", ")
                    : "Opsiyonel beceri bulunamadı."}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                <p className="mb-2 text-sm text-slate-500">
                  Tahmini Gelişim Süresi
                </p>
                <p className="text-xl font-semibold text-cyan-600">
                  {data.learning_time?.label || "-"}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {data.learning_time?.description || "Tahmini süre bilgisi yok."}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
  <p className="mb-2 text-sm text-slate-500">Hedef Rol</p>
  <p className="text-xl font-semibold text-slate-900">
    {formatTitle(data.target_role)}
  </p>
</div>

<div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
  <p className="mb-2 text-sm text-slate-500">İlerleme</p>
  <p className="text-lg font-semibold">
    {completedStepCount} / {totalStepCount} tamamlandı
  </p>
</div>

<div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
  <div className="mb-3 flex items-center gap-2">
    <BookOpen className="h-5 w-5 text-cyan-600" />
    <p className="font-semibold text-slate-900">
      Bu role ulaşmak için kalan adımlar
    </p>
  </div>
  <p className="text-slate-600">
    {data.roadmap?.remaining_skills?.filter(
      (skill: string) => !isSkillCompleted(skill)
    )?.length > 0
      ? data.roadmap.remaining_skills
          .filter((skill: string) => !isSkillCompleted(skill))
          .join(", ")
      : "Bu role ait tüm ana beceriler tamamlandı."}
  </p>
</div>
              
            </section>

            <section className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <Target className="h-6 w-6 text-cyan-600" />
                <h2 className="text-2xl font-semibold text-slate-900">
                  Yol Haritası
                </h2>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                <p className="mb-3 text-sm text-slate-500">
                  Kişiye Özel Öğrenme Planı
                </p>
                <div className="space-y-4">
  {Array.isArray(data?.learning_plan?.steps) &&
  data.learning_plan.steps
    .filter((step: any) => step.status !== "cv_present")
    .map((step: any, index: number) => {
      const relatedRecommendation =
        data?.recommendations?.find(
          (item: any) =>
            String(item.skill || "").trim().toLowerCase() ===
            String(step.skill || "").trim().toLowerCase()
        ) || null;

      const completed = isSkillCompleted(step.skill);
      const cvPresent = step.status === "cv_present";
      const showCompleteButton = !completed;

      return (
        <div
          key={`${step.skill}-${index}`}
          className="rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Adım {step.step_number || index + 1}: {step.skill}
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                {completed
                  ? "Bu beceri tamamlandı olarak işaretlendi."
                  : cvPresent
                  ? "Bu beceri CV içinde bulundu."
                  : "Bu beceri şu anda eksik görünüyor."}
              </p>
            </div>

            <span
  className={`rounded-full px-4 py-2 text-sm font-semibold ${
    completed
      ? "bg-emerald-50 text-emerald-700"
      : cvPresent
      ? "bg-cyan-50 text-cyan-700"
      : "bg-yellow-50 text-yellow-700"
  }`}
>
  {completed ? "Tamamlandı" : cvPresent ? "CV'de Var" : "Eksik"}
</span>
          </div>

          {completed ? (
            <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
              Bu beceri tamamlandı olarak işaretlendi.
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Önerilen Kurs</p>

              <a
                href={`https://www.udemy.com/courses/search/?q=${encodeURIComponent(
                  step.skill
                )}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block text-base font-medium text-cyan-700 hover:underline"
              >
                {relatedRecommendation?.course || "Udemy'de Ara"}
              </a>

              <p className="mt-1 text-sm text-slate-500">
                {relatedRecommendation?.duration || "Udemy"} •{" "}
                {relatedRecommendation?.level || "Başlangıç"}
              </p>

              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <p>
                  <span className="font-semibold text-slate-900">Süre:</span>{" "}
                  {relatedRecommendation?.duration || "2-4 hafta"}
                </p>

                <p>
                  <span className="font-semibold text-slate-900">Seviye:</span>{" "}
                  {relatedRecommendation?.level || "Başlangıç / Orta"}
                </p>

                <p>
                  <span className="font-semibold text-slate-900">Katkı:</span>{" "}
                  {relatedRecommendation?.impact ||
                    "Bu beceri hedef role yaklaşmanı sağlar."}
                </p>

                <p>
                  <span className="font-semibold text-slate-900">Önem:</span>{" "}
                  {relatedRecommendation?.priority || "Orta"}
                </p>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  Yaklaşacağın Roller:
                </p>

                <div className="flex flex-wrap gap-2">
                  {(relatedRecommendation?.target_roles?.length > 0
                    ? relatedRecommendation.target_roles
                    : data?.target_role
                    ? [data.target_role]
                    : []
                  ).map((role: string, roleIndex: number) => (
                    <span
                      key={`${role}-${roleIndex}`}
                      className="rounded-2xl bg-blue-50 px-3 py-1 text-xs text-blue-700"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  Öğrenme Yolu:
                </p>

                <ul className="space-y-1 text-sm text-slate-700">
                  {(relatedRecommendation?.roadmap?.length > 0
                    ? relatedRecommendation.roadmap
                    : [
                        `${step.skill} temellerini öğren`,
                        `${step.skill} ile küçük bir proje geliştir`,
                        `${step.skill} bilgisini CV ve portföyünde göster`,
                      ]
                  ).map((roadmapItem: string, roadmapIndex: number) => (
                    <li key={`${roadmapItem}-${roadmapIndex}`}>• {roadmapItem}</li>
                  ))}
                </ul>
              </div>

              {showCompleteButton && (
  <button
    onClick={() => markSkillCompleted(step.skill)}
    className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
  >
    Tamamladım
  </button>
)}
            </div>
          )}
        </div>
      );
    })}
</div>
  </div>
  </section>
  </div>
  )}
  </div>
</main>
  );
}