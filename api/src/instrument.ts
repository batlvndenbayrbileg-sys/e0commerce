import * as Sentry from "@sentry/node";

// Error monitoring (NFR-09). Inert unless SENTRY_DSN is set, so local/dev and
// deployments without a DSN run unchanged. Imported FIRST in index.ts.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
  });
  // eslint-disable-next-line no-console
  console.log("[sentry] error monitoring enabled");
}
