"use client";
import { useState } from "react";

export function SwatchGroup({ colors, onChange }: { colors: string[]; onChange?: (c: string) => void }) {
  const [active, setActive] = useState(0);
  return (
    <div className="flex gap-2.5 flex-wrap">
      {colors.map((c, i) => (
        <button
          key={`${c}-${i}`}
          onClick={() => { setActive(i); onChange?.(c); }}
          aria-label={`Color ${i + 1}`}
          className="w-9 h-9 rounded-full cursor-pointer border-[3px] border-white transition-transform hover:scale-110"
          style={{
            background: c,
            boxShadow: active === i ? "0 0 0 2px #0A0A0B" : "0 0 0 1px rgba(10,10,11,.06)",
          }}
        />
      ))}
    </div>
  );
}
