import { ExternalLink, Github } from "lucide-react";

const SMALL_WORDS = new Set(["and", "of", "the", "for", "with", "in", "on", "a"]);

// Letters shown when a project has no screenshot, such as "PT" for "Personal Task".
function initialsOf(title) {
  return title
    .split(/[\s-]+/)
    .filter((word) => word && !SMALL_WORDS.has(word.toLowerCase()))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

export default function ProjectCard({ project, controls = null }) {
  const { title, description, technologies = [], image, githubUrl, liveUrl, status, featured, published } = project;

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-3xl border bg-surface transition ${
        published ? "border-rule hover:border-accent/60 hover:shadow-glow" : "border-dashed border-muted/60 opacity-75"
      }`}
    >
      <div className="relative aspect-video border-b border-rule bg-page">
        {image ? (
          <img src={image} alt={`Screenshot of ${title}`} className="h-full w-full object-cover" />
        ) : (
          <div
            aria-hidden="true"
            className="grid h-full place-items-center bg-gradient-to-br from-accent/20 to-violet/20 font-display text-5xl font-extrabold text-ink/80"
          >
            {initialsOf(title)}
          </div>
        )}
        <div className="absolute left-4 top-4 flex gap-2">
          {featured && <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">Featured</span>}
          {!published && <span className="rounded-full bg-page px-3 py-1 text-xs font-semibold text-muted">Hidden</span>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
          {controls}
        </div>

        {description && <p className="mt-3 leading-relaxed text-muted">{description}</p>}

        {technologies.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <li key={tech} className="rounded-full border border-accent/30 px-3 py-1 text-xs font-semibold text-accent">
                {tech}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6 text-sm">
          {status && <span className="text-muted">{status}</span>}
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-ink hover:text-accent">
              <Github size={16} aria-hidden="true" />
              Source code
              <span className="sr-only"> for {title} (opens in a new tab)</span>
            </a>
          )}
          {liveUrl && (
            <a href={liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-ink hover:text-accent">
              <ExternalLink size={16} aria-hidden="true" />
              Live demo
              <span className="sr-only"> for {title} (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
