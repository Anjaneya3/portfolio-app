import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createContentStore } from "./content.js";
import { openDatabase } from "./db.js";
import { createRouter } from "./routes.js";
import { createAuth, ensureAdmin, getJwtSecret } from "./security.js";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(serverDir, "..");
const dataDir = path.resolve(process.env.DATA_DIR || path.join(projectDir, "data"));
const uploadsDir = path.join(dataDir, "uploads");
const distDir = path.join(projectDir, "dist");
const isProduction = process.env.NODE_ENV === "production";

const db = openDatabase(dataDir);
const store = createContentStore(db, path.join(serverDir, "seed", "content.json"), uploadsDir);
store.seedIfEmpty();
ensureAdmin(db, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
const auth = createAuth(getJwtSecret(isProduction), isProduction);
fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
        "img-src": ["'self'", "data:", "blob:", "https:"],
        "connect-src": ["'self'"],
        "object-src": ["'none'"],
        "frame-ancestors": ["'none'"],
        "upgrade-insecure-requests": null,
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));

app.use("/api", createRouter({ db, store, auth, uploadsDir }));
app.use("/api", (req, res) => res.status(404).json({ error: "Not found." }));

app.use("/uploads", express.static(uploadsDir, { dotfiles: "deny", index: false, maxAge: "1h" }));
app.use("/uploads", (req, res) => res.status(404).end());

// In production the built frontend is served by this same server.
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.use((req, res) => res.status(404).json({ error: "Not found." }));

app.use((error, req, res, _next) => {
  if (res.headersSent) return;
  const status = error.status || error.statusCode || 500;
  let message = error.message;
  if (error.type === "entity.too.large") message = "That file is too large. The limit is 6 MB.";
  if (error.type === "entity.parse.failed") message = "The request couldn't be read. Try again.";
  if (status >= 500) {
    console.error(error);
    message = "Something went wrong on the server.";
  }
  res.status(status).json({ error: message });
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`Portfolio server running on http://localhost:${port}`);
});
