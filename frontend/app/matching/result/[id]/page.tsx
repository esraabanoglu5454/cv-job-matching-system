"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../../lib/api";


export default function EmployerMatchResultPage() {
  const params = useParams();
  const router = useRouter();

  const matchId = params.id;

  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const fetchMatchDetail = async () => {
      try {
        const userType = localStorage.getItem("user_type");

        const endpoint =
         userType === "employer"
            ? `/matching/employer-result/${matchId}/`
            : `/matching/result/${matchId}/`;

const res = await api.get(endpoint);
        setMatch(res.data);
      } catch (error: any) {
        console.error("Eşleşme detayı alınamadı:", error);
        alert(
          error?.response?.data?.detail ||
            "Eşleşme detayı alınırken hata oluştu."
        );
        router.push("/profile");
      } finally {
        setLoading(false);
      }
    };

    if (matchId) {
      fetchMatchDetail();
    }
  }, [matchId, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-white p-8">
          <p className="text-slate-600">Eşleşme detayı yükleniyor...</p>
        </div>
      </main>
    );
  }

  if (!match) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ← Profile Dön
        </button>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold text-cyan-600">
            Aday - İlan Eşleşme Sonucu
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            {match.job?.title}
          </h1>

          <p className="mt-2 text-lg text-slate-600">
            {match.job?.company_name} · {match.job?.location}
          </p>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Aday</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                {match.candidate?.username}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {match.candidate?.email || "E-posta bilgisi yok"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">CV</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                {match.resume?.title}
              </h2>
            </div>

            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
              <p className="text-sm text-cyan-700">Final Eşleşme Skoru</p>
              <h2 className="mt-2 text-4xl font-bold text-cyan-700">
                %{match.final_score}
              </h2>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Eşleşen Beceriler
            </h2>

            {match.matched_skills?.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {match.matched_skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-slate-500">
                Eşleşen beceri bulunamadı.
              </p>
            )}
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Eksik Beceriler
            </h2>

            {match.missing_skills?.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {match.missing_skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-slate-500">
                Eksik beceri bulunamadı.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Sistem Yorumu
          </h2>

          <p className="mt-4 leading-8 text-slate-600">
            {match.recommendation || "Bu eşleşme için öneri bulunmuyor."}
          </p>
        </section>
      </div>
    </main>
  );
}