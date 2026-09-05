import "dotenv/config";
import "./instrument.js"; // Sentry.init — must run before other imports
import * as Sentry from "@sentry/node";
import express from "express";
import cors from "cors";
import productsRouter from "./routes/products.js";
import authRouter from "./routes/auth.js";
import paymentsRouter, { wireWebhook } from "./routes/payments.js";

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
app.use("/api/auth", authRouter);
// Legacy in-memory /api/orders removed (H10): it was unauthenticated (leaked all
// orders / any order by email) and unused — real orders live in Medusa.
app.use("/api/payments", paymentsRouter);

// Report errors to Sentry (no-op if SENTRY_DSN unset) before our JSON handler.
if (process.env.SENTRY_DSN) Sentry.setupExpressErrorHandler(app);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`> Nitec API ready on http://localhost:${PORT}`);
});
