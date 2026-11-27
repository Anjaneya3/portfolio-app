import Section from "../components/Section.jsx";
import { ActionButton, ItemControls } from "../components/EditControls.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCollectionEditor } from "../hooks/useCollectionEditor.jsx";
import { achievementFields, certificationFields } from "../lib/schemas.js";

function Column({ heading, action, children }) {
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-xl font-bold text-ink">{heading}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function Achievements({ certifications, achievements }) {
  const { canEdit } = useAuth();
  const certEditor = useCollectionEditor({ collection: "certifications", label: "certification", fields: certificationFields });
  const achEditor = useCollectionEditor({ collection: "achievements", label: "achievement", fields: achievementFields });

  return (
    <Section id="achievements" title="Certifications and achievements">
      <div className="grid gap-12 lg:grid-cols-2">
        <Column
          heading="Certifications"
          action={canEdit && <ActionButton label="Add certification" onClick={certEditor.openCreate} />}
        >
          {certifications.length === 0 ? (
            <p className="text-muted">Nothing here yet.</p>
          ) : (
            <ul className="space-y-3">
              {certifications.map((item, index) => (
                <li key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-rule bg-surface px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{item.title}</p>
                    {item.issuer && <p className="text-sm text-muted">{item.issuer}</p>}
                  </div>
                  {canEdit && (
                    <ItemControls
                      label="certification"
                      isFirst={index === 0}
                      isLast={index === certifications.length - 1}
                      onEdit={() => certEditor.openEdit(item)}
                      onDelete={() => certEditor.remove(item)}
                      onMoveUp={() => certEditor.move(certifications, index, -1)}
                      onMoveDown={() => certEditor.move(certifications, index, 1)}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
          {canEdit && certEditor.dialog}
        </Column>

        <Column
          heading="Achievements"
          action={canEdit && <ActionButton label="Add achievement" onClick={achEditor.openCreate} />}
        >
          {achievements.length === 0 ? (
            <p className="text-muted">Nothing here yet.</p>
          ) : (
            <ul className="space-y-3">
              {achievements.map((item, index) => (
                <li key={item.id} className="flex items-start justify-between gap-4 rounded-2xl border border-rule bg-surface px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{item.title}</p>
                    {item.description && <p className="mt-1 text-sm leading-relaxed text-muted">{item.description}</p>}
                  </div>
                  {canEdit && (
                    <ItemControls
                      label="achievement"
                      isFirst={index === 0}
                      isLast={index === achievements.length - 1}
                      onEdit={() => achEditor.openEdit(item)}
                      onDelete={() => achEditor.remove(item)}
                      onMoveUp={() => achEditor.move(achievements, index, -1)}
                      onMoveDown={() => achEditor.move(achievements, index, 1)}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
          {canEdit && achEditor.dialog}
        </Column>
      </div>
    </Section>
  );
}
