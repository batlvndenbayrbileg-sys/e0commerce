/** @type {import('next').NextConfig} */

// Allow next/image to optimize images served from the CDN/R2 host (if set).
const remotePatterns = [];
try {
  const cdn = process.env.NEXT_PUBLIC_SITE_URL && process.env.S3_FILE_URL;
  if (process.env.S3_FILE_URL) {
    const u = new URL(process.env.S3_FILE_URL);
    remotePatterns.push({ protocol: u.protocol.replace(":", ""), hostname: u.hostname });
  }
  void cdn;
} catch { /* ignore malformed S3_FILE_URL */ }

const nextConfig = {
  reactStrictMode: true,
  // Standalone output → small production image (only the needed node_modules).
  output: "standalone",
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
