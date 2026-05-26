"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  FileText,
  Briefcase,
  Sparkles,
  Lock,
  Trash2,
  Building2,
  MapPin,
  Globe2,
} from "lucide-react";
import api from "../../lib/api";
import AppNavbar from "../../components/AppNavbar";

type SavedJob = {
  id: number;
  job: number;
  job_title: string;
  company_name: string;
  location?: string;
  employment_type?: string;
  salary_range?: string;
  created_at: string;
};

type ProfileData = {
  user: {
    id: number;
    username: string;
    email: string;
  };
  resumes: any[];
  jobs: any[];
  matches: any[];
};

type CompanyProfile = {
  company_name: string;
  sector: string;
  location: string;
  employee_count: string;
  description: string;
  website: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recommendationHistory, setRecommendationHistory] = useState<any[]>([]);
  const [learningPlans, setLearningPlans] = useState<any[]>([]);
  const [userType, setUserType] = useState<string | null>(null);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [savedJobsLoading, setSavedJobsLoading] = useState(true);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
  company_name: "",
  sector: "",
  location: "",
  employee_count: "",
  description: "",
  website: "",
});

  const [employerApplications, setEmployerApplications] = useState<any[]>([]);
  const [employerApplicationsLoading, setEmployerApplicationsLoading] = useState(true);

const fetchSavedJobs = async () => {
  try {
    setSavedJobsLoading(true);

    const res = await api.get("/saved-jobs/my-saved-jobs/");
    setSavedJobs(Array.isArray(res.data) ? res.data : []);
  } catch (error) {
    console.error("Kaydedilen ilanlar alınamadı:", error);
    setSavedJobs([]);
  } finally {
    setSavedJobsLoading(false);
  }
};

const fetchEmployerApplications = async () => {
  try {
    setEmployerApplicationsLoading(true);
    const res = await api.get("/applications/employer/");
    setEmployerApplications(Array.isArray(res.data) ? res.data : []);
  } catch (error) {
    console.error("İşveren başvuruları alınamadı:", error);
    setEmployerApplications([]);
  } finally {
    setEmployerApplicationsLoading(false);
  }
};

const fetchCompanyProfile = async () => {
  try {
    const res = await api.get("/users/company-profile/");

    setCompanyProfile({
      company_name: res.data.company_name || "",
      sector: res.data.sector || "",
      location: res.data.location || "",
      employee_count: res.data.employee_count || "",
      description: res.data.description || "",
      website: res.data.website || "",
    });
  } catch (error) {
    console.error("Şirket profili alınamadı:", error);
  }
};
  
 useEffect(() => {
const storedUserType = (localStorage.getItem("user_type") || "candidate")
  .trim()
  .toLowerCase();

setUserType(storedUserType);

  const fetchProfile = async () => {
    try {
      const profileRes = await api.get("/auth/profile/");
      console.log("PROFILE RES:", profileRes.data);

      setProfile(profileRes.data);
      setUsername(profileRes.data.user?.username || "");
      setEmail(profileRes.data.user?.email || "");

      try {
        const historyRes = await api.get("/matching/recommendation-history/");
        setRecommendationHistory(historyRes.data || []);
      } catch (historyErr) {
        console.error("Recommendation history alınamadı:", historyErr);
        setRecommendationHistory([]);
      }

      try {
        const plansRes = await api.get("/matching/learning-plans/");
        setLearningPlans(plansRes.data || []);
      } catch (plansErr) {
        console.error("Learning plans alınamadı:", plansErr);
        setLearningPlans([]);
      }

      

      if (storedUserType === "employer") {
  await fetchEmployerApplications();
  await fetchCompanyProfile();
}
    } catch (err: any) {
      console.error("Profil alınamadı:", err);
      console.error("STATUS:", err?.response?.status);
      console.error("DATA:", err?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, []);

  const handleUpdateProfile = async () => {
    try {
      const res = await api.put("/auth/profile/", {
        username,
        email,
      });

      const updatedUser = res.data.user ? res.data.user : res.data;

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              user: {
                ...prev.user,
                username: updatedUser.username,
                email: updatedUser.email,
              },
            }
          : prev
      );

      alert("Profil başarıyla güncellendi.");
    } catch (err) {
      console.error(err);
      alert("Profil güncellenemedi.");
    }
  };

  const handleSaveCompanyProfile = async () => {
  try {
    const res = await api.patch("/users/company-profile/", companyProfile);

    setCompanyProfile({
      company_name: res.data.company_name || "",
      sector: res.data.sector || "",
      location: res.data.location || "",
      employee_count: res.data.employee_count || "",
      description: res.data.description || "",
      website: res.data.website || "",
    });

    localStorage.setItem("company_name", res.data.company_name || "");

    alert("Şirket profili başarıyla güncellendi.");
  } catch (error) {
    console.error("Şirket profili güncellenemedi:", error);
    alert("Şirket profili güncellenirken hata oluştu.");
  }
};

  const handleChangePassword = async () => {
    try {
      await api.post("/auth/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
      });

      setOldPassword("");
      setNewPassword("");

      alert("Şifre başarıyla değiştirildi. Lütfen yeniden giriş yapın.");

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      router.push("/login");
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.detail ||
          "Şifre değiştirme sırasında hata oluştu."
      );
    }
  };

  const handleDeleteAccount = async () => {
    const ok = confirm("Hesabınızı silmek istediğinize emin misiniz?");
    if (!ok) return;

    try {
      await api.delete("/auth/delete-account/");

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      alert("Hesap silindi.");
      router.push("/login");
    } catch (err) {
      console.error(err);
      alert("Hesap silinemedi.");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#eef2f7] px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          Profil yükleniyor...
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#eef2f7] px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          Profil bilgisi alınamadı.
        </div>
      </main>
    );
  }


  const handleDeleteMatch = async (matchId: number) => {
  const ok = confirm("Bu eşleşme geçmişi silinsin mi?");
  if (!ok) return;

  try {
    await api.delete(`/matching/delete-match/${matchId}/`);

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            matches: prev.matches.filter((match) => match.id !== matchId),
          }
        : prev
    );

    alert("Eşleşme kaydı silindi.");
  } catch (error) {
    console.error(error);
    alert("Eşleşme kaydı silinemedi.");
  }
};

const handleDeleteRecommendationHistory = async (historyId: number) => {
  const ok = confirm("Bu öneri geçmişi silinsin mi?");
  if (!ok) return;

  try {
    await api.delete(`/matching/recommendation-history/${historyId}/delete/`);

    setRecommendationHistory((prev) =>
      prev.filter((item) => item.id !== historyId)
    );

    alert("Öneri geçmişi silindi.");
  } catch (error) {
    console.error(error);
    alert("Öneri geçmişi silinemedi.");
  }
};
const handleDeleteLearningPlan = async (planId: number) => {
  const ok = confirm("Bu öğrenme planı silinsin mi?");
  if (!ok) return;

  try {
    await api.delete(`/matching/learning-plans/${planId}/delete/`);

    setLearningPlans((prev) => prev.filter((plan) => plan.id !== planId));

    alert("Öğrenme planı silindi.");
  } catch (error) {
    console.error(error);
    alert("Öğrenme planı silinemedi.");
  }
};

  return (
    <main className="min-h-screen bg-[#eef2f7]  text-slate-900">
      <AppNavbar />
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-8 flex items-center justify-between rounded-[2rem] border border-slate-200 bg-white px-6 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div>
            <p className="text-sm font-medium text-cyan-600">Kullanıcı Hesabı</p>
            <h1 className="text-3xl font-bold text-slate-900">Profil</h1>
          </div>

          <button
  onClick={() => {
    if (userType === "employer") {
      router.push("/employer/dashboard");
    } else {
      router.push("/dashboard");
    }
  }}
  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
>
  <ArrowLeft className="h-4 w-4" />
</button>
        </div>
        

        <div className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-50 p-3">
                  <User className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Kullanıcı Bilgileri
                  </h2>
                  <p className="text-sm text-slate-500">
                    Kullanıcı adı ve e-posta bilgilerinizi güncelleyin.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Kullanıcı Adı
                  </label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    E-posta
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400"
                  />
                </div>

                <button
                  onClick={handleUpdateProfile}
                  className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-md transition hover:scale-[1.01]"
                >
                  Bilgileri Güncelle
                </button>
              </div>
            </section>

            <section className="space-y-8">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-2xl bg-cyan-50 p-3">
                    <Lock className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">
                      Şifre Değiştir
                    </h2>
                    <p className="text-sm text-slate-500">
                      Hesap güvenliği için şifrenizi güncelleyin.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <input
                    type="password"
                    placeholder="Eski şifre"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400"
                  />

                  <input
                    type="password"
                    placeholder="Yeni şifre"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400"
                  />

                  <button
                    onClick={handleChangePassword}
                    className="rounded-2xl border border-slate-200 bg-slate-100 px-6 py-3 font-semibold text-slate-800 transition hover:bg-slate-200"
                  >
                    Şifreyi Değiştir
                  </button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                <div className="mb-4 flex items-center gap-3">
                  <Trash2 className="h-6 w-6 text-red-500" />
                  <h2 className="text-2xl font-semibold text-red-700">
                    Hesabı Sil
                  </h2>
                </div>

                <p className="mb-5 text-sm text-slate-600">
                  Bu işlem geri alınamaz. Hesabınız ve size ait veriler silinir.
                </p>

                <button
                  onClick={handleDeleteAccount}
                  className="rounded-2xl bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-600"
                >
                  Hesabı Sil
                </button>
              </div>
            </section>
          </div>

          {userType === "employer" && (
  <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
    <div className="mb-6 flex items-center gap-3">
      <div className="rounded-2xl bg-cyan-50 p-3">
        <Building2 className="h-6 w-6 text-cyan-600" />
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Şirket Profili
        </h2>
        <p className="text-sm text-slate-500">
          Adayların şirket sayfanızda göreceği bilgileri buradan düzenleyin.
        </p>
      </div>
    </div>

    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Şirket Adı
        </label>
        <input
          value={companyProfile.company_name}
          onChange={(e) =>
            setCompanyProfile((prev) => ({
              ...prev,
              company_name: e.target.value,
            }))
          }
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400"
          placeholder="ABC YAZILIM"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Sektör
        </label>
        <input
          value={companyProfile.sector}
          onChange={(e) =>
            setCompanyProfile((prev) => ({
              ...prev,
              sector: e.target.value,
            }))
          }
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400"
          placeholder="Yazılım, Lojistik, Finans..."
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Konum
        </label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={companyProfile.location}
            onChange={(e) =>
              setCompanyProfile((prev) => ({
                ...prev,
                location: e.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-cyan-400"
            placeholder="İstanbul, Sakarya..."
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Çalışan Sayısı
        </label>
        <input
          value={companyProfile.employee_count}
          onChange={(e) =>
            setCompanyProfile((prev) => ({
              ...prev,
              employee_count: e.target.value,
            }))
          }
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400"
          placeholder="50-100 çalışan"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Web Sitesi
        </label>
        <div className="relative">
          <Globe2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={companyProfile.website}
            onChange={(e) =>
              setCompanyProfile((prev) => ({
                ...prev,
                website: e.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-cyan-400"
            placeholder="https://www.sirketiniz.com"
          />
        </div>
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Şirket Hakkında
        </label>
        <textarea
          value={companyProfile.description}
          onChange={(e) =>
            setCompanyProfile((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          rows={5}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400"
          placeholder="Şirketinizin faaliyet alanını, çalışma kültürünü ve adaylara sunduğu fırsatları yazın."
        />
      </div>
    </div>

    <button
      type="button"
      onClick={handleSaveCompanyProfile}
      className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-md transition hover:scale-[1.01]"
    >
      Şirket Profilini Kaydet
    </button>
  </section>
)}
        {userType !== "employer" && (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-50 p-3">
                <FileText className="h-6 w-6 text-cyan-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Yüklenen CV’ler
              </h2>
            </div>

            <div className="space-y-4">
              {profile.resumes.length > 0 ? (
                profile.resumes.map((cv) => (
                  <div
                    key={cv.id}
                    className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-lg font-semibold text-slate-900">
                        {cv.title}
                      </p>
                      <span className="rounded-2xl bg-cyan-50 px-3 py-1 text-sm text-cyan-700">
                        {cv.file_type}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500">
                      Oluşturulma:{" "}
                      {new Date(cv.created_at).toLocaleString("tr-TR")}
                    </p>

                    {cv.skills?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {cv.skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="rounded-2xl bg-cyan-50 px-3 py-1 text-xs text-cyan-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5 text-slate-500">
                  Henüz CV yüklenmemiş.
                </div>
              )}
            </div>
          </section>
          )}
        {userType === "employer" && (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-50 p-3">
                <Briefcase className="h-6 w-6 text-cyan-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Oluşturulan İş İlanları
              </h2>
            </div>
            <div className="space-y-4">
              {profile.jobs.length > 0 ? (
                profile.jobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5"
                  >
                    <p className="text-lg font-semibold text-slate-900">
                      {job.title}
                    </p>
                    <p className="text-sm text-slate-600">
                      Şirket: {job.company_name}
                    </p>
                    <p className="text-sm text-slate-600">
                      Lokasyon: {job.location || "Belirtilmedi"}
                    </p>
                    <p className="text-sm text-slate-600">
                      Maaş: {job.salary_range || "Belirtilmedi"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5 text-slate-500">
                  Henüz iş ilanı oluşturulmamış.
                </div>
              )}
            </div>
          </section>
           )}
           {userType === "employer" && (
  <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
    <div className="mb-6 flex items-center gap-3">
      <div className="rounded-2xl bg-blue-50 p-3">
        <User className="h-6 w-6 text-blue-600" />
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Gelen Başvurular
        </h2>
        <p className="text-sm text-slate-500">
          İlanlarınıza başvuran adayları ve CV bilgilerini buradan inceleyin.
        </p>
      </div>
    </div>

    {employerApplications.length > 0 ? (
  <div className="space-y-4">
    {employerApplications.map((application) => (
          <div
            key={application.id}
            className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {application.candidate_username || "Aday"}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Başvurulan ilan:{" "}
                  <span className="font-semibold">
                    {application.job_title || "İlan bilgisi yok"}
                  </span>
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  E-posta: {application.candidate_email || "Belirtilmedi"}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Eşleşme Skoru:{" "}
                  <span className="font-bold text-cyan-600">
                    %{application.match_score ?? 0}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {application.resume_file_url && (
                  <a
                    href={application.resume_file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    CV PDF Gör
                  </a>
                )}

                {application.match_id && (
                  <button
                    onClick={() => router.push(`/matching/result/${application.match_id}`)
                    }
                    className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Eşleşmeyi Gör
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5 text-slate-500">
        Henüz başvuru bulunmuyor.
      </div>
    )}
  </section>
)}


           {userType !== "employer" && (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-50 p-3">
                <Sparkles className="h-6 w-6 text-cyan-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Eşleşme Geçmişi
              </h2>
            </div>

            { <section className="mb-8 rounded-[2rem] border border-slate-200 ">
              
              <div className="space-y-4">
              
              {profile.matches.length > 0 ? (
  profile.matches.map((match) => (
    <div
      key={match.id}
      className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-slate-900">
            {match.resume_title} ↔ {match.job_title}
          </p>

          <p className="text-sm text-slate-600">
            Şirket: {match.company_name}
          </p>
        </div>

        <button
          onClick={() => handleDeleteMatch(match.id)}
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 transition hover:bg-red-100"
        >
          Sil
        </button>
      </div>

      <p className="mt-2 text-xl font-bold text-cyan-600">
        %{match.final_score}
      </p>

      <p className="mt-2 text-sm text-slate-600">
        {match.recommendation}
      </p>

      {match.matched_skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {match.matched_skills.map((skill: string) => (
            <span
              key={skill}
              className="rounded-2xl bg-emerald-50 px-3 py-1 text-xs text-emerald-700"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {match.missing_skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {match.missing_skills.map((skill: string) => (
            <span
              key={skill}
              className="rounded-2xl bg-rose-50 px-3 py-1 text-xs text-rose-700"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  ))
) : (
  <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5 text-slate-500">
    Henüz eşleşme yapılmamış.
  </div>
)}
            </div>

            
            </section> }

            <section className="mb-8 rounded-[2rem] border border-slate-200 bg-[#f8fafc] p-8">
              <h2 className="mb-6 text-2xl font-semibold text-slate-900">
                Öğrenme Planları
              </h2>

              <div className="space-y-4">
                {learningPlans.length > 0 ? (
                  learningPlans.map((plan) => (
  <div
    key={plan.id}
    className="rounded-[1.5rem] border border-slate-200 bg-white p-5"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-lg font-semibold text-slate-900">
          {plan.target_role}
        </p>
        <div className="mt-2 text-sm text-slate-600">
  {plan.plan_data?.steps?.length > 0 ? (
    <>
      <p>{plan.plan_data.steps.length} adımlı öğrenme planı hazır.</p>
      <p>
        Tamamlanan: {plan.plan_data.completed_steps || 0} /{" "}
        {plan.plan_data.total_steps || 0}
      </p>
      <p>
        Kalan beceriler:{" "}
        {plan.plan_data.remaining_steps?.length > 0
          ? plan.plan_data.remaining_steps.join(", ")
          : "Yok"}
      </p>
    </>
  ) : (
    "Plan özeti yok."
  )}
</div>
      </div>

      <button
        onClick={() => handleDeleteLearningPlan(plan.id)}
        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 transition hover:bg-red-100"
      >
        Sil
      </button>
    </div>
  </div>
))
                ) : (
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-slate-500">
                    Henüz öğrenme planı yok.
                  </div>
                )}
                
              </div>
            </section>
          </section>
          )}
        </div>
      </div>
    </main>
  );
}