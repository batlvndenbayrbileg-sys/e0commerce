import type { Request, Response, NextFunction } from "express";

// Dependency-free fixed-window limiter (H9). Throttles payment-intent creation
// (abuse / cost) and the legacy auth endpoints. In-memory per process — correct
// for the single-instance api; move to Redis if ever scaled out.
type Bucket = { count: number; resetAt: number };

export function rateLimit(opts: { windowMs: number; max: number; name: string }) {
  const hits = new Map<string, Bucket>();
  let lastSweep = Date.now();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
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
      return res.status(429).json({ error: "Too many requests — please wait and try again." });
    }
    next();
  };
}
