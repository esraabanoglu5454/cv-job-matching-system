"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Briefcase,
  Sparkles,
  SearchCheck,
  LogOut,
  User,
} from "lucide-react";
import api from "../../lib/api";
import AppNavbar from "../../components/AppNavbar";

const features = [
  {
    title: "CV Analizi",
    description: "PDF, DOCX ve TXT formatındaki özgeçmişleri analiz eder.",
    icon: FileText,
    path: "/resumes",
  },
  {
    title: "İş İlanı Yönetimi",
    description: "İş ilanı oluşturma ve yönetimi.",
    icon: Briefcase,
    path: "/jobs",
  },
  {
    title: "Akıllı Eşleştirme",
    description: "CV ile iş ilanlarını yapay zeka ile eşleştirir.",
    icon: SearchCheck,
    path: "/matching",
  },
  {
    title: "Akıllı Öneri Sistemi",
    description: "Eksik becerilere göre roadmap üretir.",
    icon: Sparkles,
    path: "/matching",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [profileRes, resumeRes, jobRes] = await Promise.all([
          api.get("/auth/profile/"),
          api.get("/resumes/my-resumes/"),
          api.get("/jobs/my-jobs/"),
        ]);

        setProfile(profileRes.data);
        setResumes(resumeRes.data || []);
        setJobs(jobRes.data || []);
        setMatches(profileRes.data?.matches || []);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          localStorage.clear();
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const lastMatch =
    matches?.length > 0
      ? matches.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )[0]
      : null;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Yükleniyor...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-900">
      <AppNavbar />

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* HEADER */}
        

        {/* ANA GRID */}
        <section className="grid lg:grid-cols-2 gap-8">
          
          {/* SOL */}
          <div className="bg-white p-10 rounded-2xl shadow">
            <h2 className="text-5xl font-bold">
              Özgeçmiş ile
              <br />
              <span className="text-cyan-500">doğru işi eşleştir</span>
            </h2>

            <p className="mt-6 text-lg text-gray-600">
              CV’leri ve iş ilanlarını analiz ederek en uygun eşleşmeleri üretir.
            </p>

            <button
              onClick={() => router.push("/matching")}
              className="mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl"
            >
              Eşleştirmeyi Başlat
            </button>
          </div>

          {/* SAĞ */}
<div className="bg-white p-8 rounded-2xl shadow">
  <h3 className="text-2xl font-bold mb-6">Sistem Özeti</h3>

  <div className="grid grid-cols-3 gap-4">
    
    <div className="bg-gray-100 p-4 rounded-xl text-center">
      <p>Toplam Yüklenen CV</p>
      <p className="text-2xl font-bold">{resumes.length}</p>
    </div>

    <div className="bg-gray-100 p-4 rounded-xl text-center">
      <p>Toplam Yüklenen İş İlanı</p>
      <p className="text-2xl font-bold">{jobs.length}</p>
    </div>

    { <div className="bg-gray-100 p-4 rounded-xl text-center">
      <p>Son Yapılan Eşleşme</p>
      <p className="text-2xl font-bold">
        {lastMatch ? `%${lastMatch.final_score}` : "-"}
      </p>
    </div> }

  </div>
</div>
        </section>

        {/* FEATURES */}
        <section className="mt-10 bg-white p-8 rounded-2xl shadow">
          <h3 className="text-2xl font-bold mb-6">Platform Özellikleri</h3>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  onClick={() => router.push(f.path)}
                  className="cursor-pointer p-5 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="text-cyan-500" />
                    <h4 className="font-semibold">{f.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{f.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}


