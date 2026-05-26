"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowLeft } from "lucide-react";
import api from "../../lib/api";
import BrandLogo from "@/components/BrandLogo";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#eef2f7] px-6 py-10 text-slate-900">
          <div className="rounded-2xl bg-white px-6 py-4 text-slate-600 shadow-sm">
            Kayıt sayfası yükleniyor...
          </div>
        </main>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<"candidate" | "employer">("candidate");
  const [companyName, setCompanyName] = useState("");
  

  useEffect(() => {
  if (role === "employer") {
    setUserType("employer");
  } else if (role === "candidate") {
    setUserType("candidate");
  }
}, [role]);

  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    password2?: string;
    companyName?: string;
    general?: string;
  }>({});

  const passwordErrors = useMemo(() => {
    const list: string[] = [];

    if (password && password.length < 8) {
      list.push("Şifre en az 8 karakter olmalıdır.");
    }
    if (password && !/[A-ZÇĞİÖŞÜ]/.test(password)) {
      list.push("Şifre en az 1 büyük harf içermelidir.");
    }
    if (password && !/[a-zçğıöşü]/.test(password)) {
      list.push("Şifre en az 1 küçük harf içermelidir.");
    }
    if (password && !/\d/.test(password)) {
      list.push("Şifre en az 1 rakam içermelidir.");
    }

    return list;
  }, [password]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegister = async () => {
    const newErrors: {
      username?: string;
      email?: string;
      password?: string;
      password2?: string;
      companyName?: string;
      general?: string;
    } = {};

    if (!username.trim()) {
      newErrors.username = "Kullanıcı adı zorunludur.";
    } else if (username.trim().length < 3) {
      newErrors.username = "Kullanıcı adı en az 3 karakter olmalıdır.";
    }

    if (!email.trim()) {
      newErrors.email = "E-posta zorunludur.";
    } else if (!isEmailValid) {
      newErrors.email = "Geçerli bir e-posta adresi girin.";
    }

    if (!password.trim()) {
      newErrors.password = "Şifre zorunludur.";
    } else if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors[0];
    }

    if (!password2.trim()) {
      newErrors.password2 = "Şifre tekrar alanı zorunludur.";
    } else if (password !== password2) {
      newErrors.password2 = "Şifreler eşleşmiyor.";
    }

    if (userType === "employer" && !companyName.trim()) {
    newErrors.companyName = "İşveren hesabı için şirket adı zorunludur.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      await api.post("/users/register/", {
        username,
        email,
        password,
        user_type: userType,
        company_name: userType === "employer" ? companyName : "",
      });

      // await api.post("/auth/register/", {
      //   username,
      //   email,
      //   password,
      //   password2,
      // });

      router.replace("/login");
    } catch (error: any) {
      console.error("REGISTER ERROR:", error);
      console.error("REGISTER ERROR DATA:", error?.response?.data);

      const data = error?.response?.data;

      if (data) {
        if (typeof data === "string") {
          setErrors({ general: data });
        } else if (typeof data === "object") {
          setErrors({
            username: Array.isArray(data.username) ? data.username[0] : undefined,
            email: Array.isArray(data.email) ? data.email[0] : undefined,
            password: Array.isArray(data.password) ? data.password[0] : undefined,
            password2: Array.isArray(data.password2) ? data.password2[0] : undefined,
            companyName: Array.isArray(data.company_name) ? data.company_name[0] : undefined,
            general: data.detail || "Kayıt sırasında bir hata oluştu.",
          });
        } else {
          setErrors({ general: "Kayıt sırasında bir hata oluştu." });
        }
      } else {
        setErrors({ general: "Kayıt sırasında bir hata oluştu." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
  const selectedRole = role || "candidate";

  localStorage.setItem("social_login_role", selectedRole);

  window.location.href = "http://127.0.0.1:8000/accounts/google/login/";
};

const handleFacebookRegister = () => {
  const selectedRole = role || "candidate";

  localStorage.setItem("social_login_role", selectedRole);

  window.location.href = "http://127.0.0.1:8000/accounts/facebook/login/";
};

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef2f7] px-6 py-10 text-slate-900">
      <div className="flex w-full max-w-md flex-col items-center">
        <div className="mb-6">
          <BrandLogo />
        </div>

        <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-cyan-600">Yeni Hesap</p>
              <h1 className="text-4xl font-bold text-slate-900">Üye Ol</h1>
              <p className="mt-2 text-slate-500">
                AI destekli CV eşleştirme sistemine kayıt olun.
              </p>
            </div>

            <button
              onClick={() => router.push("/")}
              className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-5">
            <div>
  <label className="mb-2 block text-sm font-medium text-slate-700">
    Hesap Türü
  </label>

  <div className="grid grid-cols-2 gap-3">
    <button
      type="button"
      onClick={() => {
        setUserType("candidate");
        setCompanyName("");
        setErrors((prev) => ({
          ...prev,
          companyName: undefined,
          general: undefined,
        }));
      }}
      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
        userType === "candidate"
          ? "border-cyan-400 bg-cyan-50 text-cyan-700"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      Aday
    </button>

    <button
      type="button"
      onClick={() => {
        setUserType("employer");
        setErrors((prev) => ({
          ...prev,
          companyName: undefined,
          general: undefined,
        }));
      }}
      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
        userType === "employer"
          ? "border-blue-400 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      İşveren
    </button>
  </div>
</div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Kullanıcı Adı
              </label>
              <input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrors((prev) => ({ ...prev, username: undefined, general: undefined }));
                }}
                placeholder="Kullanıcı adınızı girin"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400"
              />
              {errors.username && (
                <p className="mt-2 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                E-posta
              </label>
              {userType === "employer" && (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700">
      Şirket Adı
    </label>
    <input
      value={companyName}
      onChange={(e) => {
        setCompanyName(e.target.value);
        setErrors((prev) => ({
          ...prev,
          companyName: undefined,
          general: undefined,
        }));
      }}
      placeholder="ABC Yazılım"
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400"
    />
    {errors.companyName && (
      <p className="mt-2 text-sm text-red-600">{errors.companyName}</p>
    )}
  </div>
)}
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: undefined, general: undefined }));
                }}
                placeholder="ornek@mail.com"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: undefined, general: undefined }));
                }}
                placeholder="Şifrenizi girin"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Şifre Tekrar
              </label>
              <input
                type="password"
                value={password2}
                onChange={(e) => {
                  setPassword2(e.target.value);
                  setErrors((prev) => ({ ...prev, password2: undefined, general: undefined }));
                }}
                placeholder="Şifreyi tekrar girin"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400"
              />
              {errors.password2 && (
                <p className="mt-2 text-sm text-red-600">{errors.password2}</p>
              )}
            </div>

            {errors.general && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errors.general}
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-md transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <UserPlus className="h-5 w-5" />
              {loading ? "Kayıt oluşturuluyor..." : "Üye Ol"}
            </button>

            <div className="mt-6">
  <div className="flex items-center gap-3">
    <div className="h-px flex-1 bg-slate-200" />
    <span className="text-sm font-medium text-slate-400">
      veya sosyal hesap ile üye ol
    </span>
    <div className="h-px flex-1 bg-slate-200" />
  </div>

  <div className="mt-4 grid grid-cols-2 gap-3">
    <button
      type="button"
      onClick={handleGoogleRegister}
      className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
    >
      <span className="text-lg">G</span>
      Google
    </button>

    <button
      type="button"
      onClick={handleFacebookRegister}
      className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
    >
      <span className="text-lg text-blue-600">f</span>
      Facebook
    </button>
  </div>
</div>

            <button
              onClick={() => router.push("/login")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Zaten hesabım var, giriş yap
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}