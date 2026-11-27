import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { HttpError } from "./errors.js";

// The sections the owner can edit. Each field has a type that controls how the value is cleaned.
export const COLLECTIONS = {
  skillGroups: {
    label: "skill group",
    required: ["title"],
    fields: { title: "string", items: "list" },
  },
  projects: {
    label: "project",
    required: ["title"],
    fields: {
      title: "string",
      description: "text",
      technologies: "list",
      image: "url",
      githubUrl: "url",
      liveUrl: "url",
      status: "string",
      featured: "bool",
      published: "bool",
    },
  },
  education: {
    label: "education entry",
    required: ["degree"],
    fields: { degree: "string", institution: "string", period: "string", details: "text" },
  },
  certifications: {
    label: "certification",
    required: ["title"],
    fields: { title: "string", issuer: "string" },
  },
  achievements: {
    label: "achievement",
    required: ["title"],
    fields: { title: "string", description: "text" },
  },
};

const PROFILE_FIELDS = {
  name: "string",
  tagline: "string",
  motto: "string",
  headlineFirst: "string",
  headlineSecond: "string",
  intro: "text",
  about: "paragraphs",
  location: "string",
  email: "string",
  linkedin: "url",
  github: "url",
  resumeUrl: "url",
  photoUrl: "url",
  heroIcons: "list",
};

const MESSAGE_FIELDS = { name: "string", email: "string", message: "text" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LENGTH = { string: 200, text: 2000, url: 300 };
const REQUIRED_LABELS = { name: "Name", title: "Title", degree: "Degree", email: "Email", message: "Message" };

const isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

function cleanValue(type, value, key) {
  if (type === "bool") return value === undefined ? undefined : Boolean(value);

  if (type === "list") {
    const parts = Array.isArray(value) ? value : String(value ?? "").split(",");
    return parts
      .map((part) => String(part).trim().slice(0, 80))
      .filter(Boolean)
      .slice(0, 40);
  }

  if (type === "paragraphs") {
    const parts = Array.isArray(value) ? value : String(value ?? "").split(/\n\s*\n/);
    return parts
      .map((part) => String(part).trim().slice(0, MAX_LENGTH.text))
      .filter(Boolean)
      .slice(0, 20);
  }

  const text = String(value ?? "").trim();
  if (type === "url" && text && (text.startsWith("//") || !/^(https?:\/\/|\/)/.test(text))) {
    throw new HttpError(400, `Links must start with https:// (problem in ${key}).`);
  }
  return text.slice(0, MAX_LENGTH[type] ?? 200);
}

// Keeps only the fields the schema knows about, cleans their values, and checks required fields.
export function sanitize(fields, input, required = []) {
  const source = isPlainObject(input) ? input : {};
  const output = {};

  for (const [key, type] of Object.entries(fields)) {
    const value = cleanValue(type, source[key], key);
    if (value !== undefined) output[key] = value;
  }

  for (const key of required) {
    if (!output[key]) {
      throw new HttpError(400, `${REQUIRED_LABELS[key] ?? key} is required.`);
    }
  }
  return output;
}

// Deletes an uploaded file. Only names inside the uploads folder are accepted, so paths cannot escape it.
function removeUploadedFile(uploadsDir, url) {
  if (typeof url !== "string" || !url.startsWith("/uploads/")) return;
  try {
    fs.unlinkSync(path.join(uploadsDir, path.basename(url)));
  } catch {
    // The file is already gone, which is fine.
  }
}

export function createContentStore(db, seedPath, uploadsDir) {
  const getSetting = db.prepare("SELECT value FROM settings WHERE key = ?");
  const putSetting = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  );
  const countRows = db.prepare("SELECT COUNT(*) AS count FROM items WHERE collection = ?");
  const insertRow = db.prepare("INSERT INTO items (collection, id, position, published, data) VALUES (?, ?, ?, ?, ?)");
  const getRow = db.prepare("SELECT * FROM items WHERE collection = ? AND id = ?");
  const updateRow = db.prepare("UPDATE items SET published = ?, data = ? WHERE collection = ? AND id = ?");
  const deleteRow = db.prepare("DELETE FROM items WHERE collection = ? AND id = ?");
  const nextPosition = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS next FROM items WHERE collection = ?");
  const setPosition = db.prepare("UPDATE items SET position = ? WHERE collection = ? AND id = ?");
  const listVisible = db.prepare("SELECT * FROM items WHERE collection = ? AND published = 1 ORDER BY position ASC, rowid ASC");
  const listAll = db.prepare("SELECT * FROM items WHERE collection = ? ORDER BY position ASC, rowid ASC");
  const listMessageRows = db.prepare("SELECT * FROM items WHERE collection = 'messages' ORDER BY rowid DESC");
  const deleteMessageRow = db.prepare("DELETE FROM items WHERE collection = 'messages' AND id = ?");

  function schemaFor(collection) {
    const schema = COLLECTIONS[collection];
    if (!schema) throw new HttpError(404, "Unknown section.");
    return schema;
  }

  function toItem(row) {
    return { id: row.id, published: row.published === 1, ...JSON.parse(row.data) };
  }

  function readProfile() {
    return JSON.parse(getSetting.get("profile").value);
  }

  // On the very first start, fills the database from the seed file. After that the database is the source.
  function seedIfEmpty() {
    if (!getSetting.get("profile")) {
      const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
      putSetting.run("profile", JSON.stringify(sanitize(PROFILE_FIELDS, seed.profile, ["name"])));

      for (const collection of Object.keys(COLLECTIONS)) {
        if (countRows.get(collection).count > 0) continue;
        (seed[collection] ?? []).forEach((entry, index) => {
          const { id, published, ...rest } = entry;
          const data = sanitize(COLLECTIONS[collection].fields, rest);
          insertRow.run(collection, id ?? crypto.randomUUID(), index, published === false ? 0 : 1, JSON.stringify(data));
        });
      }
    }
  }

  // Visitors get published items only. The signed-in owner also gets hidden items.
  function getContent({ includeHidden = false } = {}) {
    const read = (collection) => (includeHidden ? listAll : listVisible).all(collection).map(toItem);
    return {
      profile: readProfile(),
      skillGroups: read("skillGroups"),
      projects: read("projects"),
      education: read("education"),
      certifications: read("certifications"),
      achievements: read("achievements"),
    };
  }

  function updateProfile(input) {
    const previous = readProfile();
    const profile = sanitize(PROFILE_FIELDS, { ...previous, ...(isPlainObject(input) ? input : {}) }, ["name"]);
    if (profile.email && !EMAIL_PATTERN.test(profile.email)) {
      throw new HttpError(400, "Enter a valid email address.");
    }
    putSetting.run("profile", JSON.stringify(profile));

    // When the resume or photo is replaced or deleted, the old uploaded file is removed after the save.
    for (const key of ["resumeUrl", "photoUrl"]) {
      if (previous[key] !== profile[key]) removeUploadedFile(uploadsDir, previous[key]);
    }
    return profile;
  }

  function createItem(collection, input) {
    const schema = schemaFor(collection);
    const data = sanitize(schema.fields, input, schema.required);
    const published = data.published === false ? 0 : 1;
    const { published: _ignored, ...rest } = data;
    const id = crypto.randomUUID();
    insertRow.run(collection, id, nextPosition.get(collection).next, published, JSON.stringify(rest));
    return toItem(getRow.get(collection, id));
  }

  function updateItem(collection, id, input) {
    const schema = schemaFor(collection);
    const row = getRow.get(collection, id);
    if (!row) throw new HttpError(404, "That item no longer exists.");

    const merged = { ...toItem(row), ...(isPlainObject(input) ? input : {}) };
    const data = sanitize(schema.fields, merged, schema.required);
    const published = merged.published === false ? 0 : 1;
    const { published: _ignored, ...rest } = data;
    updateRow.run(published, JSON.stringify(rest), collection, id);
    return toItem(getRow.get(collection, id));
  }

  function deleteItem(collection, id) {
    schemaFor(collection);
    if (deleteRow.run(collection, id).changes === 0) {
      throw new HttpError(404, "That item no longer exists.");
    }
  }

  // Saves the new order of a list. The ids must be given in the order they should appear.
  function reorder(collection, ids) {
    schemaFor(collection);
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
      throw new HttpError(400, "The new order isn't valid.");
    }
    db.exec("BEGIN");
    try {
      ids.forEach((id, index) => setPosition.run(index, collection, id));
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  function createMessage(input) {
    const data = sanitize(MESSAGE_FIELDS, input, ["name", "email", "message"]);
    if (!EMAIL_PATTERN.test(data.email)) throw new HttpError(400, "Enter a valid email address.");
    if (data.message.length < 10) throw new HttpError(400, "Your message needs at least 10 characters.");
    insertRow.run("messages", crypto.randomUUID(), 0, 1, JSON.stringify(data));
  }

  function listMessages() {
    return listMessageRows.all().map((row) => ({
      id: row.id,
      ...JSON.parse(row.data),
      receivedAt: row.created_at,
    }));
  }

  function deleteMessage(id) {
    if (deleteMessageRow.run(id).changes === 0) {
      throw new HttpError(404, "That message no longer exists.");
    }
  }

  return {
    seedIfEmpty,
    getContent,
    updateProfile,
    createItem,
    updateItem,
    deleteItem,
    reorder,
    createMessage,
    listMessages,
    deleteMessage,
  };
}
