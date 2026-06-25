"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useToast } from "@/lib/store";
import { useT } from "@/components/LangProvider";
import { api } from "@/lib/api";
import { ArrowRight } from "@/components/Icons";

export default function AuthPage() {
  const router = useRouter();
  const t = useT();
  const setSession = useAuth(s => s.setSession);
  const showToast = useToast(s => s.show);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
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

  return (
    <div
      className="min-h-screen grid place-items-center p-6"
      style={{
        background: `radial-gradient(1000px 500px at 20% -100px, #EAF1FF 0%, transparent 60%),
                     radial-gradient(700px 400px at 110% 110%, #F2F7E5 0%, transparent 60%), #F3F4EE`,
      }}
    >
      <div className="bg-white rounded-3xl p-10 max-w-[460px] w-full border border-border shadow-lift">
        <Link href="/" className="flex items-center justify-center font-display text-[22px] tracking-[.04em]">
          VEXO
        </Link>

        <div className="flex gap-1 bg-surface-2 p-1 rounded-pill mt-6 mb-7">
          <button onClick={() => setMode("login")} className={`btn btn-sm flex-1 justify-center ${mode === "login" ? "bg-white shadow-soft" : "bg-transparent"}`}>{t("auth.signIn")}</button>
          <button onClick={() => setMode("register")} className={`btn btn-sm flex-1 justify-center ${mode === "register" ? "bg-white shadow-soft" : "bg-transparent"}`}>{t("auth.createAccount")}</button>
        </div>

        <form onSubmit={submit}>
          <h2 className="h-2 text-[28px] mb-1.5">{mode === "login" ? t("auth.welcomeBack") : t("auth.createTitle")}</h2>
          <p className="text-muted mb-6">
            {mode === "login" ? t("auth.signInDesc") : t("auth.createDesc")}
          </p>

          {mode === "register" && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Input label={t("co.firstName")} value={form.firstName} onChange={update("firstName")} error={errors.firstName}/>
              <Input label={t("co.lastName")} value={form.lastName} onChange={update("lastName")} error={errors.lastName}/>
            </div>
          )}

          <Input label={t("co.email")} type="email" value={form.email} onChange={update("email")} error={errors.email}/>
          <div className="mt-3">
            <Input label={t("auth.password")} type="password" value={form.password} onChange={update("password")} error={errors.password}/>
          </div>

          {mode === "login" && (
            <div className="flex justify-between mt-4.5 mb-4">
              <label className="text-[13px] flex items-center gap-2"><input type="checkbox" className="accent-ink"/> {t("auth.remember")}</label>
              <a href="#" className="tiny underline">{t("auth.forgot")}</a>
            </div>
          )}

          <button disabled={busy} type="submit" className={`btn ${mode === "login" ? "btn-dark" : "btn-primary"} w-full justify-center h-[52px] mt-3 disabled:opacity-50`}>
            {busy ? t("common.pleaseWait") : mode === "login" ? t("auth.signIn") : t("auth.createAccount")}
            <span className="arrow-cap"><ArrowRight width={14} height={14}/></span>
          </button>

          <div className="flex items-center gap-3 my-4.5 text-subtle text-xs">
            <span className="flex-1 h-px bg-border"/> {t("auth.or")} <span className="flex-1 h-px bg-border"/>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" className="btn h-12 justify-center bg-surface-2">{t("auth.google")}</button>
            <button type="button" className="btn h-12 justify-center bg-surface-2">{t("auth.apple")}</button>
          </div>

          {mode === "login" && (
            <p className="tiny text-center mt-5">{t("auth.demo")} <span className="font-mono">alex@vexo.gear / password123</span></p>
          )}
        </form>
      </div>
    </div>
  );
}

function Input({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="field block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <input {...props} className="mt-1.5" style={error ? { borderColor: "#E24B4A" } : undefined}/>
      {error && <span className="text-[11px] text-red-500 mt-1 block">{error}</span>}
    </label>
  );
}
