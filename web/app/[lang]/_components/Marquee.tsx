const Sparkle = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-accent/80" aria-hidden="true">
    <path d="M12 0c.7 4.9 2.1 8.9 4.9 11.1C14.1 13.3 12.7 17.2 12 24c-.7-6.8-2.1-10.7-4.9-12.9C9.9 8.9 11.3 4.9 12 0Z"/>
  </svg>
);

/**
 * Infinite brand marquee. Phrases glide past separated by an accent sparkle;
 * "NARAN" tokens are picked out in accent so the band reads with rhythm rather
 * than as a flat string. Pauses on hover. Purely decorative (aria-hidden).
 */
export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="group relative overflow-hidden" aria-hidden="true">
      {/* Soft edge fades so items dissolve in/out instead of clipping hard. */}
      <div className="absolute inset-y-0 left-0 w-20 sm:w-32 z-10 pointer-events-none bg-gradient-to-r from-mist to-transparent" />
      <div className="absolute inset-y-0 right-0 w-20 sm:w-32 z-10 pointer-events-none bg-gradient-to-l from-mist to-transparent" />
      <div
        className="flex items-center gap-7 sm:gap-10 whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused]"
        style={{ width: "max-content" }}
      >
        {doubled.map((s, i) => (
          <span key={i} className="flex items-center gap-7 sm:gap-10">
            <span
              className={
                s === "NARAN"
                  ? "font-display text-[19px] sm:text-[26px] tracking-tight text-accent-deep"
                  : "font-display text-[19px] sm:text-[26px] tracking-tight text-ink/65 transition-colors group-hover:text-ink/80"
              }
            >
              {s}
            </span>
            <Sparkle />
          </span>
        ))}
      </div>
    </div>
  );
}
