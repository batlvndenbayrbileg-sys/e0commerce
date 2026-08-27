"use client";
import { useState } from "react";

const WIDTHS = [400, 640, 828, 1080, 1280];

// Unsplash already serves optimized webp via auto=format; we add a responsive
// srcset by varying the `w` param so phones download far smaller files.
function buildSrcSet(src: string): string | undefined {
  if (!src.includes("images.unsplash.com") || !/[?&]w=\d+/.test(src)) return undefined;
  return WIDTHS.map(w => `${src.replace(/([?&])w=\d+/, `$1w=${w}`)} ${w}w`).join(", ");
}

/**
 * Photographic image with graceful fallback + responsive srcset. If the remote
 * image fails, we render the provided fallback so the UI never shows a broken image.
 */
export function Photo({
  src, alt, className, fallback, imgClassName, sizes, priority,
}: {
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallback?: React.ReactNode;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <>{fallback}</>;
  const srcSet = buildSrcSet(src);
  const extra: Record<string, string> = priority ? { fetchPriority: "high" } : {};
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      srcSet={srcSet}
      sizes={srcSet ? (sizes ?? "(max-width: 768px) 100vw, 50vw") : undefined}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={imgClassName ?? className}
      {...extra}
    />
  );
}
