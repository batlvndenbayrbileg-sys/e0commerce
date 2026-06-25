import "dotenv/config";
import express from "express";
import cors from "cors";
import productsRouter from "./routes/products.js";
import authRouter from "./routes/auth.js";
import ordersRouter from "./routes/orders.js";
import paymentsRouter, { wireWebhook } from "./routes/payments.js";

const app = express();
const PORT = +(process.env.PORT || 4000);

app.use(cors({ origin: process.env.WEB_ORIGIN?.split(",") || true, credentials: true }));

// Wire webhook needs the raw body for signature verification — mount BEFORE json
app.post("/api/webhooks/wire", express.raw({ type: "*/*" }), wireWebhook);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "nitec-api" }));
app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payments", paymentsRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`> Nitec API ready on http://localhost:${PORT}`);
});
