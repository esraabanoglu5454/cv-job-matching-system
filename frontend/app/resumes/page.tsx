"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowLeft, UploadCloud, Trash2, Info } from "lucide-react";
import api from "../../lib/api";
import AppNavbar from "../../components/AppNavbar";
export default function ResumesPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumeList, setResumeList] = useState<any[]>([]);

  const fetchResumes = async () => {
    try {
      const res = await api.get("/resumes/my-resumes/");
      setResumeList(res.data || []);
    } catch (err) {
      console.error("CV listesi alınamadı:", err);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUpload = async () => {
    if (!title.trim()) {
      alert("Lütfen başlık girin.");
      return;
    }

    if (!file && !rawText.trim()) {
      alert("Lütfen dosya seçin veya CV metni girin.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);

      if (file) {
        formData.append("file", file);
      }

      if (rawText.trim()) {
        formData.append("raw_text", rawText);
      }

      const res = await api.post("/resumes/upload/", formData);
      console.log("UPLOAD RESPONSE:", res.data);

      alert("CV başarıyla yüklendi.");
      setTitle("");
      setFile(null);
      setRawText("");

      await fetchResumes();
    } catch (error: any) {
      console.error("UPLOAD ERROR:", error);
      console.error("UPLOAD ERROR DATA:", error?.response?.data);

      alert(
        error?.response?.data?.error ||
          error?.response?.data?.detail ||
          JSON.stringify(error?.response?.data) ||
          "CV yüklenirken bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async (resumeId: number) => {
    const ok = confirm("Bu CV'yi silmek istediğinize emin misiniz?");
    if (!ok) return;

    try {
      await api.delete(`/resumes/delete/${resumeId}/`);
      setResumeList((prev) => prev.filter((cv) => cv.id !== resumeId));
      alert("CV başarıyla silindi.");
    } catch (error) {
      console.error("CV silinemedi:", error);
      alert("CV silinirken bir hata oluştu.");
    }
  };

  return (
    <main className="min-h-screen bg-[#eef2f7]  text-slate-900">
      <AppNavbar />
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-8 flex items-center justify-between rounded-[2rem] border border-slate-200 bg-white px-8 py-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div>
            
            <h1 className="mt-1 text-4xl font-bold tracking-tight text-slate-900">
              Yeni CV Yükle
            </h1>
            <p className="mt-2 text-slate-500">
              CV yükleyin, metin çıkarımını görün ve kayıtlı CV’lerinizi yönetin.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            
          </button>
        </div>
       

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-50 p-3">
                <FileText className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Yeni CV Ekle</h2>
                <p className="text-sm text-slate-500">
                  PDF, DOC, DOCX veya TXT formatında CV yükleyin.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  CV Başlığı
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Backend Developer CV"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  CV Dosyası
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  CV Metni / Beceriler
                </label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Örn: Python, Django, React, SQL, Git, Docker..."
                  className="h-40 w-full rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400"
                />
                <p className="mt-2 text-xs text-slate-500">
                  PDF okunamazsa bu metin eşleştirme için kullanılacaktır.
                </p>
              </div>

              <button
                onClick={handleUpload}
                disabled={loading}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-md transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <UploadCloud className="h-5 w-5" />
                {loading ? "Yükleniyor..." : "CV Yükle"}
              </button>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-50 p-3">
                <Info className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900">Bilgilendirme</h3>
            </div>

            <div className="space-y-4 text-sm leading-7 text-slate-600">
              <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                PDF, DOC, DOCX veya TXT formatında dosya yükleyebilirsiniz.
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                Sistem yüklenen dosyadan metni çıkararak iş ilanlarıyla eşleştirme
                yapacaktır.
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                Dosya içeriğinde yetenekler, deneyimler ve kullanılan teknolojiler
                yer almalıdır.
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-50 p-3">
              <FileText className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">Yüklenen CV’ler</h3>
              <p className="text-sm text-slate-500">
                Sisteme yüklediğiniz CV kayıtları burada listelenir.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {resumeList.length > 0 ? (
              resumeList.map((cv) => (
                <div
                  key={cv.id}
                  className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5"
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xl font-semibold text-slate-900">{cv.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Tarih: {new Date(cv.created_at).toLocaleString("tr-TR")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-2xl bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-700">
                        {cv.file_type}
                      </span>

                      <button
                        onClick={() => handleDeleteResume(cv.id)}
                        className="flex items-center gap-1 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Sil
                      </button>
                    </div>
                  </div>

                  <p className="mb-2 text-sm font-semibold text-slate-700">
                    Çıkarılan Beceriler
                  </p>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {cv.skills?.length > 0 ? (
                      cv.skills.map((skill: string) => (
                        <span
                          key={skill}
                          className="rounded-2xl bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">Beceri bulunamadı.</span>
                    )}
                  </div>

                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5 text-slate-500">
                Henüz yüklenen CV bulunmuyor.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}




