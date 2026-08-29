import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

// Shared shell for legal pages (terms / privacy / refund). Server component.
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <div className="px-3 pt-3 sm:px-4 sm:pt-4 lg:px-5 lg:pt-5 pb-2 mesh-light min-h-screen">
        <div className="max-w-[820px] mx-auto">
          <Nav />
          <div className="card p-7 sm:p-10 my-6">
            <h1 className="font-display text-[30px] sm:text-[40px] uppercase tracking-tight leading-[.95] mb-2">{title}</h1>
            <p className="tiny mb-8">Сүүлд шинэчилсэн: {updated}</p>
            <div className="legal-prose text-[15px] leading-[1.75] text-muted space-y-5">
              {children}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// Small helpers to keep the pages readable.
export function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[18px] font-semibold text-ink mt-2 mb-2">{n}. {title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
