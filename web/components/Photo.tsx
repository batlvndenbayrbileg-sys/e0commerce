"use client";
import Image from "next/image";
import { useState } from "react";

/**
 * Photographic image via next/image (responsive srcset + AVIF/WebP + lazy) with
 * a graceful fallback. Uses `fill`, so the PARENT must be positioned
 * (relative/absolute) and sized. If the image fails, we render the fallback so
 * the UI never shows a broken image.
 */
export function Photo({
  src, alt, fallback, imgClassName, className, sizes, priority,
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
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
      priority={priority}
      onError={() => setFailed(true)}
      className={imgClassName ?? className}
    />
  );
}
