import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { HttpError } from "./errors.js";

const UPLOAD_RULES = {
  photo: { types: ["jpg", "png", "webp"], label: "photo" },
  project: { types: ["jpg", "png", "webp"], label: "project image" },
  resume: { types: ["pdf"], label: "resume" },
};

// Works out the real file type from the first bytes of the file, not from the name or browser type.
function detectType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "png";
  }
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return "webp";
  }
  if (buffer.length >= 4 && buffer.toString("ascii", 0, 4) === "%PDF") return "pdf";
  return null;
}

export function saveUpload({ uploadsDir, kind, body }) {
  const rule = UPLOAD_RULES[kind];
  if (!rule) throw new HttpError(404, "Unknown upload.");
  if (!Buffer.isBuffer(body) || body.length === 0) throw new HttpError(400, "Choose a file to upload.");

  const type = detectType(body);
  if (!type || !rule.types.includes(type)) {
    throw new HttpError(415, `That file isn't a valid ${rule.label}. Use ${rule.types.join(", ").toUpperCase()}.`);
  }

  fs.mkdirSync(uploadsDir, { recursive: true });
  const name = `${kind}-${Date.now()}-${crypto.randomBytes(3).toString("hex")}.${type}`;
  fs.writeFileSync(path.join(uploadsDir, name), body);
  return `/uploads/${name}`;
}
