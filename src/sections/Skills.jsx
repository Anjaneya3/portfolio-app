import Section from "../components/Section.jsx";
import { ActionButton, ItemControls } from "../components/EditControls.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCollectionEditor } from "../hooks/useCollectionEditor.jsx";
import { skillFields } from "../lib/schemas.js";

export default function Skills({ groups }) {
  const { canEdit } = useAuth();
  const editor = useCollectionEditor({ collection: "skillGroups", label: "skill group", fields: skillFields });

  return (
    <Section
      id="skills"
      title="Skills"
      actions={canEdit && <ActionButton label="Add skill group" onClick={editor.openCreate} />}
    >
      {groups.length === 0 ? (
        <p className="text-muted">Nothing here yet.{canEdit && " Use the button above to add a skill group."}</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {groups.map((group, index) => (
            <div
              key={group.id}
              className="rounded-3xl border border-rule bg-surface p-6 transition hover:border-accent/60 hover:shadow-glow"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-xl font-bold text-ink">{group.title}</h3>
                {canEdit && (
                  <ItemControls
                    label="skill group"
                    isFirst={index === 0}
                    isLast={index === groups.length - 1}
                    onEdit={() => editor.openEdit(group)}
                    onDelete={() => editor.remove(group)}
                    onMoveUp={() => editor.move(groups, index, -1)}
                    onMoveDown={() => editor.move(groups, index, 1)}
                  />
                )}
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item, itemIndex) => (
                  <li key={`${item}-${itemIndex}`} className="rounded-full border border-accent/30 bg-page px-3 py-1 text-sm text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {canEdit && editor.dialog}
    </Section>
  );
}
