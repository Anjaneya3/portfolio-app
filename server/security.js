import crypto from "node:crypto";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "session";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

// Passwords are stored as scrypt hashes with a random salt. The plain password is never saved.
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  const [scheme, salt, expected] = String(stored).split("$");
  if (scheme !== "scrypt" || !salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, "hex");
  return expectedBuffer.length === actual.length && crypto.timingSafeEqual(expectedBuffer, actual);
}

// The secret signs the login tokens. Production must set it; development gets a temporary one.
export function getJwtSecret(isProduction) {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (isProduction) {
    throw new Error("JWT_SECRET must be set to at least 32 characters in production.");
  }
  console.warn("JWT_SECRET is not set. A temporary secret is used, so sign-ins end when the server restarts.");
  return crypto.randomBytes(32).toString("hex");
}

// Creates the owner account from ADMIN_EMAIL and ADMIN_PASSWORD, but only when no account exists yet.
export function ensureAdmin(db, email, password) {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM users").get();
  if (count > 0) return;

  if (!email || !password) {
    console.warn("No owner account yet. Set ADMIN_EMAIL and ADMIN_PASSWORD, then restart the server.");
    return;
  }
  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(
    email.trim().toLowerCase(),
    hashPassword(password)
  );
  console.log(`Owner account created for ${email.trim()}.`);
}

export function createAuth(secret, isProduction) {
  const cookieOptions = { httpOnly: true, sameSite: "strict", secure: isProduction, path: "/" };

  function readUser(req) {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return null;
    try {
      const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
      return { id: payload.sub, email: payload.email };
    } catch {
      return null;
    }
  }

  return {
    setSession(res, user) {
      const token = jwt.sign({ sub: String(user.id), email: user.email }, secret, {
        algorithm: "HS256",
        expiresIn: "7d",
      });
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: SESSION_MS });
    },

    clearSession(res) {
      res.clearCookie(COOKIE_NAME, cookieOptions);
    },

    // Attaches req.user when the visitor is the owner. Visitors continue as read-only.
    optionalAuth(req, _res, next) {
      req.user = readUser(req);
      next();
    },

    // Blocks the request unless the owner is signed in.
    requireAuth(req, res, next) {
      const user = readUser(req);
      if (!user) {
        res.status(401).json({ error: "Sign in to continue." });
        return;
      }
      req.user = user;
      next();
    },
  };
}
