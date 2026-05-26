"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, ArrowLeft, PlusCircle } from "lucide-react";
import api from "../../lib/api";
import AppNavbar from "../../components/AppNavbar";

export default function JobsPage() {
  const router = useRouter();

useEffect(() => {
  const userType = localStorage.getItem("user_type");

  if (userType !== "employer") {
    router.replace("/job-list");
  }
}, [router]);
  
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobList, setJobList] = useState<any[]>([]);

  useEffect(() => {
    api
      .get("/jobs/my-jobs/")
      .then((res) => setJobList(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleCreate = async () => {
    if (!title.trim() || !companyName.trim() || !description.trim()) {
      alert("Lütfen başlık, şirket adı ve açıklama alanlarını doldurun.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/jobs/create/", {
  title,
  company_name: companyName,
  description,
  location,
  employment_type: employmentType || "Tam Zamanlı",
  salary_range: salaryRange,
});

      alert("İş ilanı başarıyla oluşturuldu.");
      setTitle("");
      setCompanyName("");
      setDescription("");
      setLocation("");
      setEmploymentType("");
      setSalaryRange("");

      const res = await api.get("/jobs/my-jobs/");
      setJobList(res.data);
    } catch (error: any) {
  console.error("İLAN OLUŞTURMA HATASI:", error);
  console.error("STATUS:", error?.response?.status);
  console.error("DATA:", error?.response?.data);

  alert(
    typeof error?.response?.data === "string"
      ? error.response.data
      : JSON.stringify(error?.response?.data, null, 2)
  );
} finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#eef2f7]  text-slate-900">
      <AppNavbar />
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-8 flex items-center justify-between rounded-[2rem] border border-slate-200 bg-white px-8 py-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div>
            <p className="text-sm font-medium text-cyan-600">İş İlanı Yönetimi</p>
            <h1 className="mt-1 text-4xl font-bold tracking-tight text-slate-900">
              Yeni İş İlanı Oluştur
            </h1>
            <p className="mt-2 text-slate-500">
              Pozisyon detaylarını girin ve oluşturduğunuz ilanları yönetin.
            </p>
          </div>

          <button
            onClick={() => router.push("/employer/dashboard")}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-5 w-5" />
            
          </button>
        </div>
        

        <div className="mx-auto max-w-5xl">
          <section className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-50 p-3">
                <Briefcase className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  İlan Bilgileri
                </h2>
                <p className="text-sm text-slate-500">
                  Pozisyon detaylarını girerek yeni iş ilanı oluşturun.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Pozisyon Başlığı
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Backend Developer"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Şirket Adı
                </label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Örn: ABC Teknoloji"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Lokasyon
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Örn: Konya"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Çalışma Türü
                </label>
                <select
  value={employmentType}
  onChange={(e) => setEmploymentType(e.target.value)}
  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400"
>
  <option value="">Çalışma türü seçin</option>
  <option value="Tam Zamanlı">Tam Zamanlı</option>
  <option value="Yarı Zamanlı">Yarı Zamanlı</option>
  <option value="Hibrit">Hibrit</option>
  <option value="Uzaktan">Uzaktan</option>
  <option value="Staj">Staj</option>
</select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Maaş Aralığı
                </label>
                <input
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder="Örn: 25.000 - 35.000 TL"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  İş Açıklaması
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={10}
                  placeholder="İş tanımı, gerekli beceriler ve beklentileri yazın..."
                  className="w-full rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="mt-6 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-md transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <PlusCircle className="h-5 w-5" />
              {loading ? "Oluşturuluyor..." : "İş İlanı Oluştur"}
            </button>
          </section>
        </div>
      </div>
      
    </main>
  );
}


