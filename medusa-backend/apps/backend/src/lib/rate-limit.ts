import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http";

// Small dependency-free fixed-window rate limiter (H9). Guards brute-force /
// credential-stuffing / reset-spam on the auth endpoints. In-memory per process,
// which is correct for this single-instance deployment; swap for a Redis store
// if the backend is ever scaled horizontally.
type Bucket = { count: number; resetAt: number };

export function rateLimit(opts: { windowMs: number; max: number; name: string }) {
  const hits = new Map<string, Bucket>();
  let lastSweep = Date.now();

  return (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    const now = Date.now();
    // Occasional sweep so the map can't grow unbounded.
    if (now - lastSweep > opts.windowMs) {
      for (const [k, b] of hits) if (now > b.resetAt) hits.delete(k);
      lastSweep = now;
    }
    const fwd = (req.headers["x-forwarded-for"] as string) || "";
    const ip = fwd.split(",")[0].trim() || req.ip || req.socket?.remoteAddress || "unknown";
    const key = `${opts.name}:${ip}`;
    let b = hits.get(key);
    if (!b || now > b.resetAt) { b = { count: 0, resetAt: now + opts.windowMs }; hits.set(key, b); }
    b.count++;
    if (b.count > opts.max) {
      res.setHeader("Retry-After", String(Math.ceil((b.resetAt - now) / 1000)));
      res.status(429).json({ message: "Хэт олон оролдлого хийлээ. Түр хүлээгээд дахин оролдоно уу." });
      return;
    }
    next();
  };
}
