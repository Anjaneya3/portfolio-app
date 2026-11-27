import Section from "../components/Section.jsx";
import { ActionButton, ItemControls } from "../components/EditControls.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCollectionEditor } from "../hooks/useCollectionEditor.jsx";
import { educationFields } from "../lib/schemas.js";

export default function Education({ items }) {
  const { canEdit } = useAuth();
  const editor = useCollectionEditor({ collection: "education", label: "education entry", fields: educationFields });

  return (
    <Section id="education" title="Education" actions={canEdit && <ActionButton label="Add education" onClick={editor.openCreate} />}>
      {items.length === 0 ? (
        <p className="text-muted">Nothing here yet.</p>
      ) : (
        <ol className="ml-2 border-l border-accent/40">
          {items.map((item, index) => (
            <li key={item.id} className="relative pb-10 pl-8 last:pb-0">
              <span aria-hidden="true" className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full bg-accent shadow-glow" />
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  {item.period && <p className="text-sm font-semibold text-accent">{item.period}</p>}
                  <h3 className="mt-1 font-display text-xl font-bold text-ink">{item.degree}</h3>
                  {item.institution && <p className="mt-1 text-ink/80">{item.institution}</p>}
                  {item.details && <p className="mt-3 max-w-2xl text-muted">{item.details}</p>}
                </div>
                {canEdit && (
                  <ItemControls
                    label="education entry"
                    isFirst={index === 0}
                    isLast={index === items.length - 1}
                    onEdit={() => editor.openEdit(item)}
                    onDelete={() => editor.remove(item)}
                    onMoveUp={() => editor.move(items, index, -1)}
                    onMoveDown={() => editor.move(items, index, 1)}
                  />
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
      {canEdit && editor.dialog}
    </Section>
  );
}
