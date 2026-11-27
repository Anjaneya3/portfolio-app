import { useState } from "react";
import { Pencil } from "lucide-react";
import Section from "../components/Section.jsx";
import EditDialog from "../components/EditDialog.jsx";
import { ActionButton } from "../components/EditControls.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useProfileSave } from "../hooks/useProfileSave.js";
import { aboutFields } from "../lib/schemas.js";

// The owner's photo sits behind the About text at low opacity, so the text stays easy to read.
export default function About({ profile }) {
  const { canEdit } = useAuth();
  const save = useProfileSave(profile);
  const [editing, setEditing] = useState(false);

  return (
    <Section
      id="about"
      title="About"
      actions={canEdit && <ActionButton label="Edit about" icon={Pencil} onClick={() => setEditing(true)} />}
      backdrop={
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <img src={profile.photoUrl} alt="" className="h-full w-full object-cover object-[50%_18%] opacity-[0.14]" />
        </div>
      }
    >
      <div className="max-w-3xl space-y-6">
        {profile.about.map((paragraph, index) => (
          <p key={index} className="text-lg leading-relaxed text-muted">
            {paragraph}
          </p>
        ))}
      </div>

      {canEdit && (
        <EditDialog
          open={editing}
          title="Edit about"
          fields={aboutFields}
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
