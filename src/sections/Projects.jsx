import Section from "../components/Section.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import { ActionButton, ItemControls } from "../components/EditControls.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCollectionEditor } from "../hooks/useCollectionEditor.jsx";
import { projectFields } from "../lib/schemas.js";

export default function Projects({ projects }) {
  const { canEdit } = useAuth();
  const editor = useCollectionEditor({ collection: "projects", label: "project", fields: projectFields });

  return (
    <Section id="projects" title="Projects" actions={canEdit && <ActionButton label="Add project" onClick={editor.openCreate} />}>
      {projects.length === 0 ? (
        <p className="text-muted">No projects are published yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              controls={
                canEdit && (
                  <ItemControls
                    label="project"
                    isFirst={index === 0}
                    isLast={index === projects.length - 1}
                    onEdit={() => editor.openEdit(project)}
                    onDelete={() => editor.remove(project)}
                    onMoveUp={() => editor.move(projects, index, -1)}
                    onMoveDown={() => editor.move(projects, index, 1)}
                  />
                )
              }
            />
          ))}
        </div>
      )}
      {canEdit && editor.dialog}
    </Section>
  );
}
