import "dotenv/config";
import "./instrument.js"; // Sentry.init — must run before other imports
import * as Sentry from "@sentry/node";
import express from "express";
import cors from "cors";
import productsRouter from "./routes/products.js";
import authRouter from "./routes/auth.js";
import paymentsRouter, { wireWebhook } from "./routes/payments.js";
import { rateLimit } from "./lib/rate-limit.js";

const IS_PROD = process.env.NODE_ENV === "production";

// B1 — never run mock payments in production. Without WIRE_SECRET_KEY the Wire
// client auto-"succeeds" every intent, so a live store would take orders while
// collecting no money. Refuse to boot instead of failing silently.
if (IS_PROD && !process.env.WIRE_SECRET_KEY) {
  throw new Error("WIRE_SECRET_KEY is required in production — refusing to start in mock payment mode.");
}

const app = express();
const PORT = +(process.env.PORT || 4000);

// Fail closed on CORS in production: a missing WEB_ORIGIN must not reflect every
// origin with credentials (M14). Dev keeps the permissive default for convenience.
const webOrigins = process.env.WEB_ORIGIN?.split(",").map(s => s.trim()).filter(Boolean);
if (IS_PROD && (!webOrigins || webOrigins.length === 0)) {
  throw new Error("WEB_ORIGIN is required in production (allowed CORS origins).");
}
app.use(cors({ origin: webOrigins && webOrigins.length ? webOrigins : true, credentials: true }));

// Wire webhook needs the raw body for signature verification — mount BEFORE json
app.post("/api/webhooks/wire", express.raw({ type: "*/*" }), wireWebhook);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "nitec-api" }));
app.use("/api/products", productsRouter);
// Rate limit (H9): throttle auth abuse per IP.
app.use("/api/auth", rateLimit({ name: "api-auth", windowMs: 15 * 60_000, max: 20 }), authRouter);
// Legacy in-memory /api/orders removed (H10): it was unauthenticated (leaked all
// orders / any order by email) and unused — real orders live in Medusa.
// NOTE: payment-intent CREATION is rate-limited inside the router (POST /intent);
// the status poll (GET /intent) is intentionally not, since the processing page
// polls it frequently while waiting for payment.
app.use("/api/payments", paymentsRouter);

// Report errors to Sentry (no-op if SENTRY_DSN unset) before our JSON handler.
if (process.env.SENTRY_DSN) Sentry.setupExpressErrorHandler(app);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

const server = app.listen(PORT, () => {
  console.log(`> Nitec API ready on http://localhost:${PORT}`);
});

// Graceful shutdown: stop accepting connections and let in-flight requests finish
// before exit (clean redeploys — no dropped requests). Force-exit after 10s.
for (const sig of ["SIGTERM", "SIGINT"] as const) {
  process.on(sig, () => {
    console.log(`${sig} received — shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  });
}
