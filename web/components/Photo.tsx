"use client";
import { useState } from "react";

/**
 * Photographic image with graceful fallback. If the remote image fails to
 * load, we render the provided fallback (a styled gradient + SVG) so the UI
 * never shows a broken image.
 */
export function Photo({
  src, alt, className, fallback, imgClassName,
}: {
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallback?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={imgClassName ?? className}
    />
  );
}
