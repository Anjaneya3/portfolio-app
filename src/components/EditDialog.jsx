import { useEffect, useId, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Trash2, X } from "lucide-react";
import Button from "./Button.jsx";
import { toFormValues, toPayload } from "../lib/forms.js";

// One dialog used for every add and edit form. Its inputs are described by the `fields` list.
export default function EditDialog({ open, title, fields, item, submitLabel = "Save", onSubmit, onClose }) {
  const dialogRef = useRef(null);
  const idPrefix = useId();
  const onCloseRef = useRef(onClose);
  const [values, setValues] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // The browser fires "close" when the dialog is dismissed with Escape, so the parent can update.
  useEffect(() => {
    const dialog = dialogRef.current;
    const handleClose = () => onCloseRef.current?.();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  // Open or close only when `open` changes. Running this on every render would wipe what the user has typed.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      setValues(toFormValues(fields, item));
      setError("");
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function updateValue(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const missing = fields.find((field) => field.required && !String(values[field.key] ?? "").trim());
    if (missing) {
      setError(`${missing.label} is required.`);
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSubmit(toPayload(fields, values));
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="edit-dialog-title"
      className="m-auto w-[min(92vw,38rem)] rounded-3xl border border-accent/40 bg-surface p-0 text-ink shadow-glow backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={handleSubmit} className="flex max-h-[85vh] flex-col">
        <div className="flex items-center justify-between border-b border-rule px-6 py-4">
          <h3 id="edit-dialog-title" className="font-display text-xl font-bold">
            {title}
          </h3>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="rounded-full p-2 text-muted hover:text-ink"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-6">
          {fields.map((field) => (
            <FieldInput
              key={field.key}
              idPrefix={idPrefix}
              field={field}
              value={values[field.key]}
              onChange={(next) => updateValue(field.key, next)}
            />
          ))}
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-rule px-6 py-4">
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving…" : submitLabel}
          </Button>
        </div>
      </form>
    </dialog>
  );
}

function FieldInput({ field, value, onChange, idPrefix }) {
  const id = `${idPrefix}-${field.key}`;
  const hintId = `${id}-hint`;

  if (field.type === "bool") {
    return (
      <label htmlFor={id} className="flex items-center gap-3 text-sm font-semibold text-ink">
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        {field.label}
      </label>
    );
  }

  if (field.type === "file") {
    return <FileInput field={field} value={value ?? ""} onChange={onChange} idPrefix={idPrefix} />;
  }

  const isTextarea = field.type === "textarea" || field.type === "paragraphs";
  const Control = isTextarea ? "textarea" : "input";

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {field.label}
        {field.required && <span className="text-danger"> *</span>}
      </label>
      <Control
        id={id}
        value={value ?? ""}
        rows={isTextarea ? field.rows ?? 4 : undefined}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={field.hint ? hintId : undefined}
        className="mt-2 w-full rounded-xl border border-rule bg-page px-4 py-2.5 text-ink outline-none placeholder:text-muted focus:border-accent"
      />
      {field.hint && (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {field.hint}
        </p>
      )}
    </div>
  );
}

// Uploads a file as soon as it is chosen. The saved path is stored in the form when the upload succeeds.
// The delete button clears the path. The file is removed from the server when the form is saved.
function FileInput({ field, value, onChange, idPrefix }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const id = `${idPrefix}-${field.key}`;

  async function handleChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    setError("");
    try {
      onChange(await field.upload(file));
      toast.success(`${field.label} uploaded. Save to publish it.`);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setBusy(false);
    }
  }

  function handleDelete() {
    onChange("");
    setError("");
    toast(`${field.label} will be removed when you save.`);
  }

  return (
    <div>
      <p className="text-sm font-semibold text-ink">{field.label}</p>
      <p className="mt-1 break-all text-xs text-muted">{value ? `Current file: ${value}` : "No file yet."}</p>
      {field.hint && <p className="mt-1 text-xs text-muted">{field.hint}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label
          htmlFor={id}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-accent/50 px-4 py-2 text-sm font-semibold text-ink hover:bg-accent/10 focus-within:ring-2 focus-within:ring-accent"
        >
          {busy ? "Uploading…" : field.buttonLabel ?? "Choose file"}
          <input id={id} type="file" accept={field.accept} onChange={handleChange} disabled={busy} className="sr-only" />
        </label>
        {value && field.deleteLabel && (
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-full border border-danger/50 px-4 py-2 text-sm font-semibold text-danger hover:bg-danger/10"
          >
            <Trash2 size={15} aria-hidden="true" />
            {field.deleteLabel}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
