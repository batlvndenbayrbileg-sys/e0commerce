/** @type {import('next').NextConfig} */

// Allow next/image to optimize images served from the CDN/R2 host (if set) plus
// Unsplash (the demo/seed catalog's image host — real catalogs use R2).
const remotePatterns = [{ protocol: "https", hostname: "images.unsplash.com" }];
try {
  const cdn = process.env.NEXT_PUBLIC_SITE_URL && process.env.S3_FILE_URL;
  if (process.env.S3_FILE_URL) {
    const u = new URL(process.env.S3_FILE_URL);
    remotePatterns.push({ protocol: u.protocol.replace(":", ""), hostname: u.hostname });
  }
  // Medusa's own file host — admin-uploaded images (e.g. hero/promo pictures) are
  // served from Medusa's /static in dev, and from R2 above in prod. Allow it so
  // next/image can render them.
  if (process.env.NEXT_PUBLIC_MEDUSA_URL) {
    const m = new URL(process.env.NEXT_PUBLIC_MEDUSA_URL);
    remotePatterns.push({ protocol: m.protocol.replace(":", ""), hostname: m.hostname, port: m.port || undefined });
  }
  void cdn;
} catch { /* ignore malformed URLs */ }

const nextConfig = {
  reactStrictMode: true,
  // Standalone output → small production image (only the needed node_modules).
  output: "standalone",
  // Drop console.* (except errors/warnings) from the production client bundle —
  // smaller JS and no dev logging cost in the browser.
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  images: {
    // Serve modern formats + responsive sizes; product images are local (public/)
    // in dev and move to R2/CDN in prod (remotePatterns above).
    formats: ["image/avif", "image/webp"],
    remotePatterns,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL || "http://localhost:4000"}/api/:path*`,
      },
    ];
  },
};

// Wrap with Sentry only when a DSN is configured, so builds without Sentry are
// completely unaffected (no source-map step, no runtime overhead).
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  const { withSentryConfig } = require("@sentry/nextjs");
  module.exports = withSentryConfig(nextConfig, {
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    // Source maps upload only when an auth token is present (CI/prod).
    authToken: process.env.SENTRY_AUTH_TOKEN,
  });
} else {
  module.exports = nextConfig;
}
