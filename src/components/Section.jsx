// A page section: a title with optional owner actions, then the content.
// With a `backdrop`, the section becomes a full-width band, and the backdrop fills it behind the content.
export default function Section({ id, title, actions = null, backdrop = null, children }) {
  const heading = (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id={`${id}-title`} className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
          {title}
        </h2>
        {actions}
      </div>
      <div className="mt-10">{children}</div>
    </>
  );

  if (!backdrop) {
    return (
      <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 border-t border-rule py-20">
        {heading}
      </section>
    );
  }

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="relative isolate left-1/2 w-screen -translate-x-1/2 overflow-hidden border-t border-rule py-20 scroll-mt-28"
    >
      {backdrop}
      <div className="relative mx-auto max-w-6xl px-6">{heading}</div>
    </section>
  );
}
