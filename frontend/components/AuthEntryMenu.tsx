"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  ChevronDown,
  LogIn,
  UserCircle2,
  UserPlus,
} from "lucide-react";

export default function AuthEntryMenu() {
  const router = useRouter();

  const menuRef = useRef<HTMLDivElement>(null);
  const registerButtonRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    right: 0,
  });

  const updateMenuPosition = () => {
    const button = registerButtonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();

    setMenuPosition({
      top: rect.bottom + 12,
      right: window.innerWidth - rect.right,
    });
  };

  useEffect(() => {
    if (open) {
      updateMenuPosition();
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleReposition() {
      if (open) {
        updateMenuPosition();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open]);

  const goTo = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <div ref={menuRef} className="relative z-[9999] flex items-center gap-3">
      {/* <button
        type="button"
        onClick={() => router.push("/login")}
        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        Giriş Yap
      </button> */}

      <button
        ref={registerButtonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(14,165,233,0.20)] transition hover:scale-[1.01]"
      >
        Üye Ol/Giriş yap
        <ChevronDown
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`,
          }}
          className="z-[99999] w-[390px] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.16)]"
        >
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-600">
              Hesap Seçimi
            </p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">
              Sisteme nasıl devam etmek istersiniz?
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Rolünüze uygun giriş veya üyelik seçeneğini kullanın.
            </p>
          </div>

          <div className="space-y-3">
            {/* Aday */}
            <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/40">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-cyan-600 shadow-sm">
                  <UserCircle2 className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">Aday</h4>
                    <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[11px] font-medium text-cyan-700">
                      İş Arayan
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => goTo("/login?role=candidate")}
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
                    >
                      Aday Girişi
                    </button>

                    <button
                      type="button"
                      onClick={() => goTo("/register?role=candidate")}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-cyan-700"
                    >
                      <UserPlus className="h-4 w-4" />
                      Üye Ol
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* İşveren */}
            <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-blue-200 hover:bg-blue-50/40">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-blue-600 shadow-sm">
                  <Briefcase className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">İşveren</h4>
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                      İlan Veren
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => goTo("/login?role=employer")}
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                    >
                      İşveren Girişi
                    </button>

                    <button
                      type="button"
                      onClick={() => goTo("/register?role=employer")}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-blue-700"
                    >
                      <UserPlus className="h-4 w-4" />
                      Üye Ol
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}