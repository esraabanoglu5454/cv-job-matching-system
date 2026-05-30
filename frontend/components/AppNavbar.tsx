// "use client";

// import { usePathname, useRouter } from "next/navigation";
// import BrandLogo from "./BrandLogo";
// import { useEffect, useState } from "react";

// export default function AppNavbar() {
//   const pathname = usePathname();
//   const router = useRouter();

//   const [userType, setUserType] = useState<string | null>(null);

//   useEffect(() => {
//     const storedUserType = localStorage.getItem("user_type");
//     setUserType(storedUserType);
//   }, []);

//   const navItems =
//     userType === "employer"
//       ? [
//           { label: "İlan Yönetimi", href: "/jobs" },
//           { label: "İlanlarım", href: "/employer/jobs" },
//           { label: "Tüm İlanlar", href: "/job-list" },
//           { label: "Başvurular", href: "/employer/applications" },
//           { label: "Profil", href: "/profile" },
//         ]
//       : [
//           { label: "CV'ler", href: "/resumes" },
//           { label: "İş İlanları", href: "/job-list" },
//           { label: "Eşleşme", href: "/matching" },
//           { label: "Kaydettiklerim", href: "/profile/saved" },
//           { label: "Başvurularım", href: "/profile/applications" },
//           { label: "Profil", href: "/profile" },
//         ];

//   const isActive = (href: string) => pathname === href;

//   const handleLogoClick = () => {
//     if (userType === "employer") {
//       router.push("/employer/dashboard");
//     } else {
//       router.push("/dashboard");
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("access");
//     localStorage.removeItem("refresh");
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("refresh_token");
//     localStorage.removeItem("user_id");
//     localStorage.removeItem("username");
//     localStorage.removeItem("user_type");
//     localStorage.removeItem("company_name");
//     localStorage.removeItem("remembered_username");
//     localStorage.removeItem("social_login_next");
//     localStorage.removeItem("social_login_role");
//     window.location.href = "/";
     
//     // router.push("/");
//   };

//   return (
//     <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
//       <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
//         <button type="button" onClick={handleLogoClick} className="text-left">
//           <BrandLogo />
//         </button>

//         <nav className="hidden items-center gap-2 lg:flex">
//           {navItems.map((item) => (
//             <button
//               key={item.href}
//               type="button"
//               onClick={() => router.push(item.href)}
//               className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
//                 isActive(item.href)
//                   ? "bg-indigo-50 text-indigo-700"
//                   : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
//               }`}
//             >
//               {item.label}
//             </button>
//           ))}
//         </nav>

//         <div className="flex items-center gap-3">
//           {userType !== "employer" && (
//             <button
//               type="button"
//               onClick={() => router.push("/matching")}
//               className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 md:inline-flex"
//             >
//               Yeni Eşleşme
//             </button>
//           )}

//           <button
//             type="button"
//             onClick={handleLogout}
//             className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,70,229,0.25)] transition hover:scale-[1.01]"
//           >
//             Çıkış Yap
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// }





















"use client";

import { usePathname, useRouter } from "next/navigation";
import BrandLogo from "./BrandLogo";
import { useEffect, useState } from "react";

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const token =
      localStorage.getItem("access") || localStorage.getItem("access_token");

    const storedUserType = (localStorage.getItem("user_type") || "")
      .trim()
      .toLowerCase();

    if (!token || !storedUserType) {
      setIsLoggedIn(false);
      setUserType(null);
      return;
    }

    setIsLoggedIn(true);
    setUserType(storedUserType);
  }, []);

  const guestNavItems = [
    { label: "Hakkımızda", href: "/#about" },
    { label: "Misyonumuz", href: "/#mission" },
    { label: "Vizyonumuz", href: "/#vision" },
    { label: "İş İlanları", href: "/job-list" },
  ];

  const candidateNavItems = [
    { label: "CV'ler", href: "/resumes" },
    { label: "İş İlanları", href: "/job-list" },
    { label: "Eşleşme", href: "/matching" },
    { label: "Kaydettiklerim", href: "/profile/saved" },
    { label: "Başvurularım", href: "/profile/applications" },
    { label: "Profil", href: "/profile" },
  ];

  const employerNavItems = [
    { label: "İlan Yönetimi", href: "/jobs" },
    { label: "İlanlarım", href: "/employer/jobs" },
    { label: "Tüm İlanlar", href: "/job-list" },
    { label: "Başvurular", href: "/employer/applications" },
    { label: "Profil", href: "/profile" },
  ];

  const navItems = !isLoggedIn
    ? guestNavItems
    : userType === "employer"
    ? employerNavItems
    : candidateNavItems;

  const isActive = (href: string) => {
    if (href.includes("#")) return false;
    return pathname === href;
  };

  const handleLogoClick = () => {
    if (!isLoggedIn) {
      router.push("/");
      return;
    }

    if (userType === "employer") {
      router.push("/employer/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("user_type");
    localStorage.removeItem("company_name");
    localStorage.removeItem("remembered_username");
    localStorage.removeItem("social_login_next");
    localStorage.removeItem("social_login_role");

    setIsLoggedIn(false);
    setUserType(null);

    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <button type="button" onClick={handleLogoClick} className="text-left">
          <BrandLogo />
        </button>

        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                isActive(item.href)
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            <button
              type="button"
              onClick={() => router.push("/login?role=candidate")}
              className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,70,229,0.25)] transition hover:scale-[1.01]"
            >
              Üye Ol/Giriş Yap
            </button>
          ) : (
            <>
              {userType !== "employer" && (
                <button
                  type="button"
                  onClick={() => router.push("/matching")}
                  className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 md:inline-flex"
                >
                  Yeni Eşleşme
                </button>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,70,229,0.25)] transition hover:scale-[1.01]"
              >
                Çıkış Yap
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}