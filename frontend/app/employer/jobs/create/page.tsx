"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function CreateJobPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    company_name: "",
    description: "",
    general_qualifications: "",
    responsibilities: "",
    candidate_criteria: "",
    required_skills: "",
    optional_skills: "",
    location: "",
    employment_type: "",
    salary_range: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const userType = localStorage.getItem("user_type");
    const companyName = localStorage.getItem("company_name") || "";

    if (userType !== "employer") {
      router.replace("/login");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      company_name: companyName,
    }));
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const finalDescription = `
İş İlanı Hakkında
${formData.description}

Genel Nitelikler
${formData.general_qualifications}

Rol ve Sorumluluklar
${formData.responsibilities}

Aday Kriterleri
${formData.candidate_criteria}
`.trim();

    try {
      await api.post("/jobs/create/", {
        title: formData.title,
        company_name: formData.company_name,
        description: finalDescription,
        required_skills: formData.required_skills,
        optional_skills: formData.optional_skills,
        location: formData.location,
        employment_type: formData.employment_type,
        salary_range: formData.salary_range,
      });

      setMessage("İş ilanı başarıyla oluşturuldu.");

      setFormData((prev) => ({
        ...prev,
        title: "",
        description: "",
        general_qualifications: "",
        responsibilities: "",
        candidate_criteria: "",
        required_skills: "",
        optional_skills: "",
        location: "",
        employment_type: "",
        salary_range: "",
      }));

      setTimeout(() => {
        router.push("/employer/jobs");
      }, 1000);
    } catch (error: any) {
      console.error("İLAN OLUŞTURMA HATASI:", error);
      console.error("STATUS:", error?.response?.status);
      console.error("DATA:", error?.response?.data);

      setError(
        error?.response?.data?.detail ||
          (typeof error?.response?.data === "string"
            ? error.response.data
            : JSON.stringify(error?.response?.data, null, 2)) ||
          "İlan oluşturulurken bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#eef2f7] px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <h1 className="text-3xl font-bold">İlan Oluştur</h1>
        <p className="mt-2 text-slate-500">
          Yeni iş ilanınızı buradan yayınlayabilirsiniz.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Pozisyon</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
              placeholder=""
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Şirket Adı</label>
            <input
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              İş İlanı Hakkında
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
              placeholder="Pozisyonu ve işin genel tanımını yazın..."
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Genel Nitelikler
            </label>
            <textarea
              name="general_qualifications"
              value={formData.general_qualifications}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
              placeholder={``}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Rol ve Sorumluluklar
            </label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
              placeholder={``}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Aday Kriterleri
            </label>
            <textarea
              name="candidate_criteria"
              value={formData.candidate_criteria}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
              placeholder={`Tecrübe: 
Eğitim Seviyesi: 
Ehliyet:`}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Aranan Beceriler
            </label>
            <textarea
              name="required_skills"
              value={formData.required_skills}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
              placeholder=""
            />
            <p className="mt-2 text-xs text-slate-500">
              Virgül veya satır satır yazabilirsiniz.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Opsiyonel Beceriler
            </label>
            <textarea
              name="optional_skills"
              value={formData.optional_skills}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
              placeholder=""
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Konum</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
                placeholder="İstanbul"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Çalışma Türü
              </label>
              <input
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
                placeholder="Tam Zamanlı / Hibrit / Uzaktan / Staj"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Maaş Aralığı
            </label>
            <input
              name="salary_range"
              value={formData.salary_range}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
              placeholder=""
            />
          </div>

          {message && (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="whitespace-pre-wrap rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Kaydediliyor..." : "İlanı Yayınla"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/employer/dashboard")}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700"
            >
              Geri Dön
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}