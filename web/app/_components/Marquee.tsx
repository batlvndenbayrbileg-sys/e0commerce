export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden" aria-hidden="true">
      <div className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none bg-gradient-to-r from-mist to-transparent"/>
      <div className="absolute inset-y-0 right-0 w-16 z-10 pointer-events-none bg-gradient-to-l from-mist to-transparent"/>
      <div className="flex items-center gap-12 whitespace-nowrap animate-marquee" style={{ width: "max-content" }}>
        {doubled.map((s, i) => (
          <span key={i} className="font-display text-[18px] sm:text-[22px] tracking-tight text-subtle hover:text-ink transition-colors">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
