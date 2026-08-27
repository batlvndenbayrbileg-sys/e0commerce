"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/lib/store";
import { useT } from "@/components/LangProvider";
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
      router.push("/account");
    } catch (err: any) {
      showToast(err.message || t("toast.authFailed"));
      setBusy(false);
    }
  }

  const score = pwScore(form.password);
  const strengthLabel = [t("auth.pwWeak"), t("auth.pwWeak"), t("auth.pwFair"), t("auth.pwStrong")][score];
  const strengthColor = ["#9aa0a6", "#ef4444", "#f59e0b", "#16a34a"][score];

  return (
    <div className="min-h-screen flex flex-col lg:justify-center lg:py-10" style={{ background: "linear-gradient(165deg, #6E54EC 0%, #5230CC 100%)" }}>
      <div className="w-full max-w-[480px] mx-auto flex-1 flex flex-col lg:flex-none lg:rounded-[2.5rem] lg:overflow-hidden lg:shadow-[0_30px_80px_rgba(30,12,70,.4)]">
        {/* Purple header */}
        <header className="px-6 pt-10 sm:pt-12 pb-7 text-white shrink-0">
          <div className="flex items-center justify-between mb-9">
            <Link href="/" aria-label={t("bc.home")} className="w-9 h-9 -ml-1 grid place-items-center rounded-full hover:bg-white/10 transition">
              <ChevronLeft width={20} height={20}/>
            </Link>
            <div className="flex items-center gap-2.5 text-[13px] text-white/80">
              <span className="hidden min-[380px]:inline">{isReg ? t("auth.haveAccount") : t("auth.noAccount")}</span>
              <button type="button" onClick={() => { setMode(isReg ? "login" : "register"); setErrors({}); }}
                className="bg-white/20 hover:bg-white/30 px-3.5 h-8 rounded-full text-white text-[13px] font-medium transition">
                {isReg ? t("auth.signIn") : t("auth.getStarted")}
              </button>
            </div>
          </div>
          <div className="text-center font-display text-[30px] tracking-[.04em]">NARAN</div>
        </header>

        {/* White sheet */}
        <div className="flex-1 lg:flex-none bg-white rounded-t-[2.25rem] lg:rounded-none px-7 pt-9 pb-10 shadow-[0_-12px_40px_rgba(40,20,90,.18)] lg:shadow-none">
          <h1 className="text-center font-display text-[26px] tracking-tight">{isReg ? t("auth.getStartedFree") : t("auth.welcomeBack")}</h1>
          <p className="text-center text-muted text-[14px] mt-1.5">{isReg ? t("auth.freeForever") : t("auth.enterDetails")}</p>

          <form onSubmit={submit} noValidate className="mt-7 space-y-3.5">
            <FloatingField label={t("co.email")} name="email" type="email" inputMode="email" autoComplete="email"
              autoFocus value={form.email} onChange={update("email")} error={errors.email}/>

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

            <button disabled={busy} type="submit"
              className="w-full h-[54px] rounded-2xl text-white font-semibold tracking-wide grid place-items-center disabled:opacity-60 transition active:scale-[.99] shadow-[0_10px_24px_rgba(110,84,236,.35)]"
              style={{ background: "linear-gradient(95deg, #6E54F0 0%, #A95EEA 55%, #CE6FE0 100%)" }}>
              <span className="inline-flex items-center gap-2">
                {busy ? t("common.pleaseWait") : isReg ? t("auth.createAccount") : t("auth.signIn")}
                <ArrowRight width={16} height={16}/>
              </span>
            </button>

            {!isReg && (
              <div className="text-center pt-1">
                <button type="button" onClick={() => showToast(t("auth.forgotSoon"))}
                  className="text-[13px] text-muted hover:text-ink py-1.5 px-2 transition-colors">{t("auth.forgot")}</button>
              </div>
            )}

            <div className="flex items-center gap-3 py-2 text-subtle text-[12px]">
              <span className="flex-1 h-px bg-line"/> {t("auth.or")} <span className="flex-1 h-px bg-line"/>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="h-[52px] rounded-2xl border border-line bg-white hover:bg-surface-2 inline-flex items-center justify-center gap-2.5 text-[14px] font-medium transition">
                <GoogleLogo/> {t("auth.google")}
              </button>
              <button type="button" className="h-[52px] rounded-2xl border border-line bg-white hover:bg-surface-2 inline-flex items-center justify-center gap-2.5 text-[14px] font-medium transition">
                <FacebookLogo/> {t("auth.facebook")}
              </button>
            </div>

            {!isReg && <p className="tiny text-center pt-2">{t("auth.demo")} <span className="font-mono">alex@vexo.gear / password123</span></p>}
          </form>
        </div>
      </div>
    </div>
  );
}

function FloatingField({ label, error, right, labelRight, name, ...props }: {
  label: string; error?: string; right?: React.ReactNode; labelRight?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <div className={`rounded-2xl border px-4 py-2 bg-white transition focus-within:border-[#6E54F0] focus-within:ring-4 focus-within:ring-[#6E54F0]/10 ${error ? "border-red-400" : "border-line"}`}>
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
