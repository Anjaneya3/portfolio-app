import express from "express";
import rateLimit from "express-rate-limit";
import { COLLECTIONS } from "./content.js";
import { HttpError } from "./errors.js";
import { verifyPassword } from "./security.js";
import { saveUpload } from "./uploads.js";

function checkCollection(name) {
  if (!COLLECTIONS[name]) throw new HttpError(404, "Unknown section.");
  return name;
}

export function createRouter({ db, store, auth, uploadsDir }) {
  const router = express.Router();

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many sign-in attempts. Wait 15 minutes and try again." },
  });

  const messageLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "You've sent several messages recently. Try again in a few minutes." },
  });

  // Public reads
  router.get("/content", auth.optionalAuth, (req, res) => {
    res.json(store.getContent({ includeHidden: Boolean(req.user) }));
  });

  router.get("/auth/me", auth.optionalAuth, (req, res) => {
    res.json({ user: req.user ? { email: req.user.email } : null });
  });

  // Sign in and out
  router.post("/auth/login", loginLimiter, (req, res) => {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");
    const user = db.prepare("SELECT id, email, password_hash FROM users WHERE email = ?").get(email);

    if (!user || !verifyPassword(password, user.password_hash)) {
      res.status(401).json({ error: "Email or password is incorrect." });
      return;
    }
    auth.setSession(res, user);
    res.json({ user: { email: user.email } });
  });

  router.post("/auth/logout", (req, res) => {
    auth.clearSession(res);
    res.json({ ok: true });
  });

  // Owner-only writes. These routes come before the generic /:collection routes below.
  router.put("/profile", auth.requireAuth, (req, res) => {
    res.json({ profile: store.updateProfile(req.body) });
  });

  // Messages from visitors. Only the owner can read or delete them.
  router.post("/messages", messageLimiter, (req, res) => {
    store.createMessage(req.body);
    res.status(201).json({ ok: true });
  });

  router.get("/messages", auth.requireAuth, (req, res) => {
    res.json({ messages: store.listMessages() });
  });

  router.delete("/messages/:id", auth.requireAuth, (req, res) => {
    store.deleteMessage(req.params.id);
    res.json({ ok: true });
  });

  // File uploads. The body is the raw file; the server checks its real type before saving.
  router.put(
    "/uploads/:kind",
    auth.requireAuth,
    express.raw({ type: ["image/*", "application/pdf"], limit: "6mb" }),
    (req, res) => {
      res.json({ url: saveUpload({ uploadsDir, kind: req.params.kind, body: req.body }) });
    }
  );

  // Editable lists: skills, projects, education, certifications, achievements
  router.post("/:collection/reorder", auth.requireAuth, (req, res) => {
    store.reorder(checkCollection(req.params.collection), req.body?.ids);
    res.json({ ok: true });
  });

  router.post("/:collection", auth.requireAuth, (req, res) => {
    const item = store.createItem(checkCollection(req.params.collection), req.body);
    res.status(201).json({ item });
  });

  router.put("/:collection/:id", auth.requireAuth, (req, res) => {
    const item = store.updateItem(checkCollection(req.params.collection), req.params.id, req.body);
    res.json({ item });
  });

  router.delete("/:collection/:id", auth.requireAuth, (req, res) => {
    store.deleteItem(checkCollection(req.params.collection), req.params.id);
    res.json({ ok: true });
  });

  return router;
}
