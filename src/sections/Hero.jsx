import { useState } from "react";
import { Download, Github, Linkedin, Mail, Pencil } from "lucide-react";
import EditDialog from "../components/EditDialog.jsx";
import { buttonClasses } from "../components/Button.jsx";
import { ActionButton } from "../components/EditControls.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useFileAvailable } from "../hooks/useFileAvailable.js";
import { useProfileSave } from "../hooks/useProfileSave.js";
import { heroFields } from "../lib/schemas.js";

// Splits "Anjaneya Kariguli" into "Anjaneya" and "Kariguli" so the last word can take the gradient.
function splitName(name) {
  const parts = name.trim().split(/\s+/);
  const last = parts.pop() ?? "";
  return { first: parts.join(" "), last };
}

function SocialLink({ href, label, children }) {
  const isEmail = href.startsWith("mailto:");
  return (
    <a
      href={href}
      target={isEmail ? undefined : "_blank"}
      rel={isEmail ? undefined : "noreferrer"}
      aria-label={label}
      title={label}
      className="grid h-11 w-11 place-items-center rounded-full border border-accent/50 text-ink transition hover:border-accent hover:bg-accent/10 hover:shadow-glow"
    >
      {children}
    </a>
  );
}

// The hero uses the monochrome developer photo as its background.
// The `dark` class keeps the text light whichever theme the visitor chose.
export default function Hero({ profile }) {
  const { canEdit } = useAuth();
  const save = useProfileSave(profile);
  const [editing, setEditing] = useState(false);
  const hasResume = useFileAvailable(profile.resumeUrl, "application/pdf");
  const { first, last } = splitName(profile.name);

  return (
    <>
      <section id="top" className="dark relative isolate overflow-hidden bg-black">
        <img
          src="/hero-background.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-30 h-full w-full object-cover object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/35" />

        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="min-w-0 max-w-3xl">
            {profile.tagline && (
              <p className="animate-rise text-base tracking-[0.3em] text-muted">{profile.tagline}</p>
            )}
            {profile.motto && <p className="animate-rise mt-3 font-script text-3xl text-accent">{profile.motto}</p>}

            <h1 className="animate-rise mt-5 font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              {first && <span>{first} </span>}
              <span className="bg-gradient-to-r from-accent to-violet bg-clip-text text-transparent">{last}</span>
            </h1>

            <p className="animate-rise mt-6 text-lg font-semibold text-ink md:text-xl">
              {profile.headlineFirst}
              {profile.headlineSecond && (
                <>
                  {" "}
                  <span className="text-accent">| {profile.headlineSecond}</span>
                </>
              )}
            </p>

            {profile.intro && (
              <p className="animate-rise mt-6 max-w-xl border-l-2 border-accent pl-5 text-lg leading-relaxed text-muted">
                {profile.intro}
              </p>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-4">
              {hasResume && (
                <a href={profile.resumeUrl} download className={buttonClasses("primary")}>
                  <Download size={18} aria-hidden="true" />
                  Download resume
                </a>
              )}
              <a href="#projects" className={buttonClasses("secondary")}>
                View projects
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {profile.github && (
                <SocialLink href={profile.github} label="GitHub">
                  <Github size={18} aria-hidden="true" />
                </SocialLink>
              )}
              {profile.linkedin && (
                <SocialLink href={profile.linkedin} label="LinkedIn">
                  <Linkedin size={18} aria-hidden="true" />
                </SocialLink>
              )}
              {profile.email && (
                <SocialLink href={`mailto:${profile.email}`} label="Email">
                  <Mail size={18} aria-hidden="true" />
                </SocialLink>
              )}
            </div>

            {canEdit && (
              <div className="mt-8">
                <ActionButton label="Edit profile" icon={Pencil} onClick={() => setEditing(true)} />
              </div>
            )}
          </div>
        </div>
      </section>

      {canEdit && (
        <EditDialog
          open={editing}
          title="Edit profile"
          fields={heroFields}
          item={profile}
          onClose={() => setEditing(false)}
          onSubmit={async (payload) => {
            await save(payload);
            setEditing(false);
          }}
        />
      )}
    </>
  );
}
