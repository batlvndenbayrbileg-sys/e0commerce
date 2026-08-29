import * as Sentry from "@sentry/nextjs";
// Client-side error monitoring. Inert unless the DSN is set.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}
