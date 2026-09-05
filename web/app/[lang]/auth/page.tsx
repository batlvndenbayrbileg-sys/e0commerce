"use client";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/lib/store";
import { useT, useLang } from "@/components/LangProvider";
import { api } from "@/lib/api";
import { ArrowRight, EyeIcon, EyeOffIcon, ChevronLeft } from "@/components/Icons";

function pwScore(pw: string): 0 | 1 | 2 | 3 {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12 || (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw))) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw)) s++;
  return Math.min(3, s) as 0 | 1 | 2 | 3;
}

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
    <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.4 6.5v5.4h7.1c4.1-3.8 6.6-9.4 6.6-15.9z"/>
    <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-7.1-5.4c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.6C8.1 41.1 15.5 46 24 46z"/>
    <path fill="#FBBC05" d="M11.8 28.4c-.4-1.3-.7-2.7-.7-4.4s.3-3.1.7-4.4v-5.6H4.5C3 17.1 2 20.4 2 24s1 6.9 2.5 9.6l7.3-5.2z"/>
    <path fill="#EA4335" d="M24 10.7c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.5 2 8.1 6.9 4.5 14.4l7.3 5.6c1.7-5.1 6.5-9 12.2-9z"/>
  </svg>
);
const FacebookLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.4 0-1.9.9-1.9 1.8V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12z"/></svg>
);

export default function AuthPage() {
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const setSession = useAuth(s => s.setSession);
  const showToast = useToast(s => s.show);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: "Nicholas Ergemla", email: "alex@vexo.gear", password: "password123" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isReg = mode === "register";

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setErrors(er => ({ ...er, [k]: "" }));
  };

  function validate() {
    const er: Record<string, string> = {};
    if (isReg && !form.name.trim()) er.name = t("common.required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = t("auth.invalidEmail");
    if (form.password.length < (isReg ? 8 : 1)) er.password = isReg ? t("auth.min8") : t("common.required");
    setErrors(er);
    return Object.keys(er).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      let result;
      if (isReg) {
        const parts = form.name.trim().split(/\s+/);
        const firstName = parts[0];
        const lastName = parts.slice(1).join(" ") || firstName;
        result = await api.auth.signup({ firstName, lastName, email: form.email, password: form.password });
      } else {
        result = await api.auth.login(form.email, form.password);
      }
      setSession(result.user, result.token);
      showToast(`${t("auth.welcomeName")}, ${result.user.firstName}!`);
      router.push(`/${lang}/account`);
    } catch (err: any) {
      showToast(err.message || t("toast.authFailed"));
      setBusy(false);
    }
  }

  const score = pwScore(form.password);
  const strengthLabel = [t("auth.pwWeak"), t("auth.pwWeak"), t("auth.pwFair"), t("auth.pwStrong")][score];
  const strengthColor = ["#9aa0a6", "#ef4444", "#f59e0b", "#16a34a"][score];

  const toggle = () => { setMode(isReg ? "login" : "register"); setErrors({}); };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-8 sm:py-12" style={{ background: "linear-gradient(150deg, #FF8A3D 0%, #FF6A1A 55%, #D14A08 100%)" }}>
      <div className="relative w-full max-w-[960px] overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem] bg-white shadow-[0_40px_100px_-25px_rgba(30,12,70,.55)] lg:grid lg:grid-cols-2 lg:min-h-[580px]">

        {/* ============ PROMO (desktop) ============ */}
        <div className="relative hidden lg:flex flex-col items-center justify-center px-12 py-14 text-center text-white"
          style={{ background: "linear-gradient(150deg, #FF7A2E 0%, #E8550A 100%)" }}>
          <div className="relative z-10 max-w-[300px]">
            <h2 className="font-display text-[32px] leading-tight">{isReg ? t("auth.backPromo") : t("auth.newHere")}</h2>
            <p className="mt-4 text-[14px] leading-relaxed text-white/80">{isReg ? t("auth.backPromoDesc") : t("auth.newHereDesc")}</p>
            <button type="button" onClick={toggle}
              className="mt-9 h-11 rounded-full border-2 border-white/80 px-10 text-[13px] font-semibold uppercase tracking-[.12em] transition hover:bg-white hover:text-[#E8550A]">
              {isReg ? t("auth.signIn") : t("auth.signUp")}
            </button>
          </div>
          {/* curved divider bulging into the form panel */}
          <svg className="absolute top-0 right-0 h-full w-[70px] translate-x-[99%]" viewBox="0 0 70 100" preserveAspectRatio="none" aria-hidden style={{ fill: "#E8550A" }}>
            <path d="M0 0 C 48 20, 48 80, 0 100 Z" />
          </svg>
        </div>

        {/* ============ FORM ============ */}
        <div className="relative flex flex-col justify-center px-7 sm:px-10 lg:px-14 py-10 lg:py-12">
          {/* Mobile top: back + brand + switch */}
          <div className="lg:hidden mb-7 flex items-center justify-between">
            <Link href="/" aria-label={t("bc.home")} className="grid h-9 w-9 -ml-1 place-items-center rounded-full text-ink/70 hover:bg-surface-2 transition">
              <ChevronLeft width={20} height={20} />
            </Link>
            <span className="font-display text-[22px] tracking-[.04em]">NARAN</span>
            <button type="button" onClick={toggle} className="text-[13px] font-medium text-accent hover:underline">
              {isReg ? t("auth.signIn") : t("auth.signUp")}
            </button>
          </div>

          <h1 className="font-display text-[28px] tracking-tight text-center lg:text-left">{isReg ? t("auth.signUp") : t("auth.signIn")}</h1>
          <p className="mt-1.5 text-[14px] text-muted text-center lg:text-left">{isReg ? t("auth.freeForever") : t("auth.enterDetails")}</p>

          <form onSubmit={submit} noValidate className="mt-7 space-y-3.5">
            <FloatingField label={t("co.email")} name="email" type="email" inputMode="email" autoComplete="email"
              value={form.email} onChange={update("email")} error={errors.email}/>

            {isReg && (
              <FloatingField label={t("auth.yourName")} name="name" autoComplete="name"
                value={form.name} onChange={update("name")} error={errors.name}/>
            )}

            <FloatingField
              label={t("auth.password")} name="password" type={showPw ? "text" : "password"}
              autoComplete={isReg ? "new-password" : "current-password"}
              value={form.password} onChange={update("password")} error={errors.password}
              labelRight={isReg && form.password ? (
                <span className="flex items-center gap-2">
                  <span className="flex gap-1" aria-hidden>
                    {[1, 2, 3].map(i => <span key={i} className="h-[3px] w-4 rounded-full" style={{ background: i <= score ? strengthColor : "#E3E3E6" }}/>)}
                  </span>
                  <span className="text-[11px] font-semibold" style={{ color: strengthColor }}>{strengthLabel}</span>
                </span>
              ) : undefined}
              right={
                <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? t("auth.hidePw") : t("auth.showPw")}
                  className="grid place-items-center w-9 h-9 -mr-1 rounded-full text-subtle hover:text-ink transition-colors">
                  {showPw ? <EyeOffIcon width={18} height={18}/> : <EyeIcon width={18} height={18}/>}
                </button>
              }
            />

            {!isReg && (
              <div className="text-right -mt-1">
                <button type="button" onClick={() => showToast(t("auth.forgotSoon"))}
                  className="text-[12px] text-muted hover:text-ink transition-colors">{t("auth.forgot")}</button>
              </div>
            )}

            <button disabled={busy} type="submit"
              className="w-full h-[52px] rounded-full text-white font-semibold uppercase tracking-[.12em] text-[13px] grid place-items-center disabled:opacity-60 transition active:scale-[.99] shadow-[0_12px_28px_-8px_rgba(110,84,236,.6)]"
              style={{ background: "linear-gradient(95deg, #FF7A2E 0%, #E8550A 100%)" }}>
              {busy ? t("common.pleaseWait") : isReg ? t("auth.signUp") : t("auth.signIn")}
            </button>

            {/* Social */}
            <div className="pt-3 text-center">
              <p className="text-[13px] text-muted">{t("auth.socialPlatforms")}</p>
              <div className="mt-3.5 flex items-center justify-center gap-3">
                <SocialCircle label={t("auth.google")}><GoogleLogo/></SocialCircle>
                <SocialCircle label={t("auth.facebook")}><FacebookLogo/></SocialCircle>
              </div>
            </div>

            {!isReg && <p className="tiny text-center pt-2">{t("auth.demo")} <span className="font-mono">alex@vexo.gear / password123</span></p>}
          </form>
        </div>
      </div>
    </div>
  );
}

function SocialCircle({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label}
      className="grid h-12 w-12 place-items-center rounded-full border border-line bg-white shadow-soft hover:-translate-y-0.5 hover:shadow-lift transition">
      {children}
    </button>
  );
}

function FloatingField({ label, error, right, labelRight, name, ...props }: {
  label: string; error?: string; right?: React.ReactNode; labelRight?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <div className={`rounded-2xl border px-4 py-2 bg-white transition focus-within:border-[#FF6A1A] focus-within:ring-4 focus-within:ring-[#FF6A1A]/10 ${error ? "border-red-400" : "border-line"}`}>
        <div className="flex items-center justify-between">
          <label htmlFor={name} className="block text-[11px] font-medium text-subtle">{label}</label>
          {labelRight}
        </div>
        <div className="flex items-center">
          <input id={name} name={name} {...props}
            aria-invalid={!!error} aria-describedby={error ? `${name}-err` : undefined}
            className="flex-1 min-w-0 bg-transparent outline-none focus-visible:outline-none border-0 p-0 text-[15px] text-ink placeholder:text-subtle"/>
          {right}
        </div>
      </div>
      {error && <span id={`${name}-err`} role="alert" className="text-[11px] text-red-500 mt-1 block px-1">{error}</span>}
    </div>
  );
}
