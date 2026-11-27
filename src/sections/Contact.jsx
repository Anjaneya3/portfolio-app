import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Github, Linkedin, Mail, Pencil, Trash2 } from "lucide-react";
import Section from "../components/Section.jsx";
import EditDialog from "../components/EditDialog.jsx";
import Button from "../components/Button.jsx";
import { ActionButton } from "../components/EditControls.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useProfileSave } from "../hooks/useProfileSave.js";
import { validateContact } from "../lib/contact.js";
import { contactFields } from "../lib/schemas.js";
import { deleteMessage, fetchMessages, sendMessage } from "../services/api.js";

const emptyForm = { name: "", email: "", message: "" };

function Field({ id, label, error, multiline = false, ...props }) {
  const Control = multiline ? "textarea" : "input";
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      <Control
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        rows={multiline ? 5 : undefined}
        className={`mt-2 w-full rounded-xl border bg-page px-4 py-2.5 text-ink outline-none placeholder:text-muted focus:border-accent ${
          error ? "border-danger" : "border-rule"
        }`}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export default function Contact({ profile }) {
  const { canEdit } = useAuth();
  const save = useProfileSave(profile);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);

  // The owner sees the inbox. Visitors never load it.
  useEffect(() => {
    if (!canEdit) return;
    fetchMessages()
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [canEdit]);

  function handleChange(event) {
    const { name, value } = event.target;
    const next = { ...form, [name]: value };
    setForm(next);
    if (Object.keys(errors).length > 0) setErrors(validateContact(next));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const found = validateContact(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSending(true);
    try {
      await sendMessage(form);
      setForm(emptyForm);
      setErrors({});
      toast.success("Message sent. Thank you for reaching out.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  }

  async function removeMessage(id) {
    try {
      await deleteMessage(id);
      setMessages((current) => current.filter((message) => message.id !== id));
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <Section
      id="contact"
      title="Contact"
      actions={canEdit && <ActionButton label="Edit contact details" icon={Pencil} onClick={() => setEditing(true)} />}
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div>
          <p className="text-lg leading-relaxed text-muted">
            Send a message and it arrives straight in the inbox. You can also reach me directly.
          </p>
          <ul className="mt-8 space-y-4 text-ink">
            {profile.email && (
              <li>
                <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-3 hover:text-accent">
                  <Mail size={18} aria-hidden="true" />
                  {profile.email}
                </a>
              </li>
            )}
            {profile.linkedin && (
              <li>
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 hover:text-accent">
                  <Linkedin size={18} aria-hidden="true" />
                  LinkedIn
                </a>
              </li>
            )}
            {profile.github && (
              <li>
                <a href={profile.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 hover:text-accent">
                  <Github size={18} aria-hidden="true" />
                  GitHub
                </a>
              </li>
            )}
          </ul>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-rule bg-surface p-6 sm:p-8">
          <Field id="contact-name" name="name" label="Name" autoComplete="name" placeholder="Your name" value={form.name} onChange={handleChange} error={errors.name} />
          <Field id="contact-email" name="email" type="email" label="Email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} error={errors.email} />
          <Field id="contact-message" name="message" label="Message" multiline placeholder="What would you like to talk about?" value={form.message} onChange={handleChange} error={errors.message} />
          <Button type="submit" variant="primary" disabled={sending}>
            {sending ? "Sending…" : "Send message"}
          </Button>
        </form>
      </div>

      {canEdit && (
        <div className="mt-16">
          <h3 className="font-display text-xl font-bold text-ink">Inbox ({messages.length})</h3>
          {messages.length === 0 ? (
            <p className="mt-4 text-muted">No messages yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-rule rounded-3xl border border-rule bg-surface">
              {messages.map((message) => (
                <li key={message.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">
                      {message.name} <span className="font-normal text-muted">({message.email})</span>
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {new Date(message.receivedAt.replace(" ", "T") + "Z").toLocaleString()}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-muted">{message.message}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Delete message from ${message.name}`}
                    onClick={() => removeMessage(message.id)}
                    className="shrink-0 rounded-full border border-rule p-2 text-muted hover:border-danger hover:text-danger"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {canEdit && (
        <EditDialog
          open={editing}
          title="Edit contact details"
          fields={contactFields}
          item={profile}
          onClose={() => setEditing(false)}
          onSubmit={async (payload) => {
            await save(payload);
            setEditing(false);
          }}
        />
      )}
    </Section>
  );
}
