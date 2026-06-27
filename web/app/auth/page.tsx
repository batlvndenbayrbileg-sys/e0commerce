"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/lib/store";
import { useT } from "@/components/LangProvider";
import { api } from "@/lib/api";
import { Photo } from "@/components/Photo";
import { ArrowRight, CheckIcon, EyeIcon, EyeOffIcon } from "@/components/Icons";
import { GROUP_IMG } from "@/lib/images";

function pwScore(pw: string): 0 | 1 | 2 | 3 {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12 || (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw))) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw)) s++;
  return Math.min(3, s) as 0 | 1 | 2 | 3;
}

export default function AuthPage() {
  const router = useRouter();
  const t = useT();
  const setSession = useAuth(s => s.setSession);
  const showToast = useToast(s => s.show);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "alex@vexo.gear", password: "password123" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setErrors(er => ({ ...er, [k]: "" }));
  };

  function validate() {
    const er: Record<string, string> = {};
    if (mode === "register") {
      if (!form.firstName.trim()) er.firstName = t("common.required");
      if (!form.lastName.trim()) er.lastName = t("common.required");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = t("auth.invalidEmail");
    if (form.password.length < (mode === "register" ? 8 : 1)) er.password = mode === "register" ? t("auth.min8") : t("common.required");
    setErrors(er);
    return Object.keys(er).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      const result = mode === "login"
        ? await api.auth.login(form.email, form.password)
        : await api.auth.signup({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password });
      setSession(result.user, result.token);
      showToast(`${t("auth.welcomeName")}, ${result.user.firstName}!`);
      router.push("/account");
    } catch (err: any) {
      showToast(err.message || t("toast.authFailed"));
      setBusy(false);
    }
  }

  const isReg = mode === "register";
  const score = pwScore(form.password);
  const strengthLabel = [t("auth.pwWeak"), t("auth.pwWeak"), t("auth.pwFair"), t("auth.pwStrong")][score];
  const strengthColor = ["bg-line", "bg-red-500", "bg-amber-500", "bg-green-600"][score];

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Brand panel — desktop only */}
      <aside className="hidden lg:block relative overflow-hidden bg-graphite">
        <Photo src={GROUP_IMG} alt="" priority sizes="50vw"
          fallback={<div className="absolute inset-0 card-dark"/>}
          imgClassName="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C0D]/92 via-[#0B0C0D]/45 to-[#0B0C0D]/25"/>
        <div className="relative z-10 h-full flex flex-col justify-between p-12 text-white">
          <Link href="/" className="font-display text-[24px] tracking-[.04em] w-fit">VEXO</Link>
          <div>
            <h2 className="hd-1 !text-[clamp(38px,3.4vw,58px)] leading-[.95]">{t("auth.brandTag")}</h2>
            <ul className="mt-8 space-y-3.5">
              {["auth.perk1", "auth.perk2", "auth.perk3"].map(k => (
                <li key={k} className="flex items-center gap-3 text-white/85 text-[15px]">
                  <span className="w-7 h-7 rounded-full bg-white/12 grid place-items-center shrink-0"><CheckIcon width={14} height={14}/></span>
                  {t(k)}
                </li>
              ))}
            </ul>
          </div>
          <p className="tiny text-white/45">{t("foot.rights")}</p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="grid place-items-center p-6 sm:p-10 mesh-light">
        <div className="w-full max-w-[420px] bg-white rounded-3xl p-7 sm:p-9 border border-line shadow-lift lg:bg-transparent lg:border-0 lg:shadow-none lg:p-0">
          <Link href="/" className="lg:hidden flex justify-center font-display text-[22px] tracking-[.04em] mb-6">VEXO</Link>

          <div role="tablist" aria-label={t("auth.signIn")} className="flex gap-1 bg-surface-2 p-1 rounded-pill mb-7">
            <button role="tab" aria-selected={!isReg} onClick={() => { setMode("login"); setErrors({}); }}
              className={`btn btn-sm flex-1 justify-center ${!isReg ? "bg-white shadow-soft" : "bg-transparent"}`}>{t("auth.signIn")}</button>
            <button role="tab" aria-selected={isReg} onClick={() => { setMode("register"); setErrors({}); }}
              className={`btn btn-sm flex-1 justify-center ${isReg ? "bg-white shadow-soft" : "bg-transparent"}`}>{t("auth.createAccount")}</button>
          </div>

          <form onSubmit={submit} noValidate>
            <h1 className="hd-2 !text-[26px] mb-2">{isReg ? t("auth.createTitle") : t("auth.welcomeBack")}</h1>
            <p className="text-muted mb-6">{isReg ? t("auth.createDesc") : t("auth.signInDesc")}</p>

            {isReg && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Field label={t("co.firstName")} name="firstName" autoComplete="given-name" autoFocus value={form.firstName} onChange={update("firstName")} error={errors.firstName}/>
                <Field label={t("co.lastName")} name="lastName" autoComplete="family-name" value={form.lastName} onChange={update("lastName")} error={errors.lastName}/>
              </div>
            )}

            <Field label={t("co.email")} name="email" type="email" inputMode="email" autoComplete="email" autoFocus={!isReg} value={form.email} onChange={update("email")} error={errors.email}/>

            <div className="mt-3">
              <Field
                label={t("auth.password")} name="password"
                type={showPw ? "text" : "password"}
                autoComplete={isReg ? "new-password" : "current-password"}
                value={form.password} onChange={update("password")} error={errors.password}
                right={
                  <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? t("auth.hidePw") : t("auth.showPw")} className="grid place-items-center w-9 h-9 -mr-1.5 rounded-full text-subtle hover:text-ink hover:bg-surface-2 transition-colors">
                    {showPw ? <EyeOffIcon width={18} height={18}/> : <EyeIcon width={18} height={18}/>}
                  </button>
                }
              />
              {isReg && form.password && (
                <div className="mt-2">
                  <div className="flex gap-1.5" aria-hidden>
                    {[1, 2, 3].map(i => <span key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? strengthColor : "bg-line"}`}/>)}
                  </div>
                  <p className="tiny mt-1">{t("auth.pwStrength")}: <span className="font-medium text-ink">{strengthLabel}</span></p>
                </div>
              )}
            </div>

            {!isReg && (
              <div className="flex justify-between items-center mt-3 mb-3">
                <label className="text-[13px] flex items-center gap-2 text-muted py-1.5 cursor-pointer"><input type="checkbox" className="accent-ink w-[18px] h-[18px]"/> {t("auth.remember")}</label>
                <button type="button" onClick={() => showToast(t("auth.forgotSoon"))} className="tiny underline hover:text-ink py-1.5 px-0.5">{t("auth.forgot")}</button>
              </div>
            )}

            <button disabled={busy} type="submit" className={`btn ${isReg ? "btn-primary" : "btn-dark"} w-full justify-center h-[52px] ${isReg ? "mt-5" : ""} disabled:opacity-50`}>
              {busy ? t("common.pleaseWait") : isReg ? t("auth.createAccount") : t("auth.signIn")}
              <span className="arrow-cap"><ArrowRight width={14} height={14}/></span>
            </button>

            <div className="flex items-center gap-3 my-5 text-subtle text-xs">
              <span className="flex-1 h-px bg-line"/> {t("auth.or")} <span className="flex-1 h-px bg-line"/>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button type="button" className="btn h-12 justify-center bg-surface-2 hover:bg-white border border-line transition">{t("auth.google")}</button>
              <button type="button" className="btn h-12 justify-center bg-surface-2 hover:bg-white border border-line transition">{t("auth.apple")}</button>
            </div>

            {!isReg && <p className="tiny text-center mt-5">{t("auth.demo")} <span className="font-mono">alex@vexo.gear / password123</span></p>}
          </form>
        </div>
      </main>
    </div>
  );
}

function Field({ label, error, right, name, ...props }: {
  label: string; error?: string; right?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="field block" htmlFor={name}>
      <span className="text-xs font-medium text-muted">{label}</span>
      <div className="relative mt-1.5">
        <input id={name} name={name} {...props}
          aria-invalid={!!error} aria-describedby={error ? `${name}-err` : undefined}
          className={right ? "!pr-11" : ""} style={error ? { borderColor: "#E24B4A" } : undefined}/>
        {right && <span className="absolute right-3 top-1/2 -translate-y-1/2">{right}</span>}
      </div>
      {error && <span id={`${name}-err`} role="alert" className="text-[11px] text-red-500 mt-1 block">{error}</span>}
    </label>
  );
}
