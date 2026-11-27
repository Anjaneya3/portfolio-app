// Converts saved values into text for the edit form, and form text back into values for saving.
export function toFormValues(fields, item) {
  const values = {};
  for (const field of fields) {
    const raw = item?.[field.key];
    if (field.type === "bool") {
      values[field.key] = raw ?? field.default ?? false;
    } else if (field.type === "list") {
      values[field.key] = Array.isArray(raw) ? raw.join(", ") : "";
    } else if (field.type === "paragraphs") {
      values[field.key] = Array.isArray(raw) ? raw.join("\n\n") : "";
    } else {
      values[field.key] = raw ?? "";
    }
  }
  return values;
}

export function toPayload(fields, values) {
  const payload = {};
  for (const field of fields) {
    const value = values[field.key];
    if (field.type === "bool") {
      payload[field.key] = Boolean(value);
    } else if (field.type === "list") {
      payload[field.key] = String(value ?? "")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
    } else if (field.type === "paragraphs") {
      payload[field.key] = String(value ?? "")
        .split(/\n\s*\n/)
        .map((part) => part.trim())
        .filter(Boolean);
    } else {
      payload[field.key] = String(value ?? "").trim();
    }
  }
  return payload;
}
