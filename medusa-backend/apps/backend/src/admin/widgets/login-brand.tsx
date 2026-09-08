import { defineWidgetConfig } from "@medusajs/admin-sdk";

// NARAN sun mark — white on the warm brand gradient badge.
const Sun = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
    <circle cx="12" cy="12" r="4.2" fill="#fff" stroke="none" />
    <path d="M12 3v2M12 19v2M5 5l1.5 1.5M17.5 17.5 19 19M3 12h2M19 12h2M5 19l1.5-1.5M17.5 6.5 19 5" />
  </svg>
);

/**
 * Renders the NARAN sun logo + wordmark above the admin login form
 * (the `login.before` zone), giving the sign-in screen a real brand identity.
 */
const LoginBrand = () => {
  return (
    <div className="mb-5 flex flex-col items-center gap-3 text-center">
      <span
        className="grid h-14 w-14 place-items-center rounded-2xl shadow-[0_10px_24px_-8px_rgba(232,85,10,.55)]"
        style={{ background: "linear-gradient(135deg,#FF8A3D 0%,#E8550A 100%)" }}
      >
        <Sun />
      </span>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-ui-fg-base text-2xl font-semibold tracking-tight">NARAN</span>
        <span className="text-ui-fg-subtle txt-compact-small">Гоо сайхны удирдлага</span>
      </div>
    </div>
  );
};

export const config = defineWidgetConfig({
  zone: "login.before",
});

export default LoginBrand;
