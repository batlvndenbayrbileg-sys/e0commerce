import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const router = Router();
const SECRET = process.env.JWT_SECRET || "nitec-dev-secret-change-me";

type User = { id: string; email: string; firstName: string; lastName: string; passwordHash: string };
const users = new Map<string, User>();

(async () => {
  users.set("alex@vexo.gear", {
    id: "u1", email: "alex@vexo.gear", firstName: "Alex", lastName: "Rivera",
    passwordHash: await bcrypt.hash("password123", 10),
  });
})();

const signupSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function issueToken(user: User) {
  return jwt.sign({ sub: user.id, email: user.email }, SECRET, { expiresIn: "7d" });
}
function publicUser(u: User) {
  return { id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName };
}

router.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password, firstName, lastName } = parsed.data;
  if (users.has(email)) return res.status(409).json({ error: "Email already registered" });
  const user: User = {
    id: "u" + (users.size + 1), email, firstName, lastName,
    passwordHash: await bcrypt.hash(password, 10),
  };
  users.set(email, user);
  res.json({ token: issueToken(user), user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = users.get(parsed.data.email);
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  res.json({ token: issueToken(user), user: publicUser(user) });
});

router.get("/me", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "No token" });
  try {
    const payload = jwt.verify(auth.slice(7), SECRET) as { sub: string; email: string };
    const user = users.get(payload.email);
    if (!user) return res.status(401).json({ error: "User not found" });
    res.json({ user: publicUser(user) });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
