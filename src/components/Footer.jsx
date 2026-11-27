import { Download, Github, Linkedin, Mail } from "lucide-react";
import { useFileAvailable } from "../hooks/useFileAvailable.js";

const sectionLinks = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#education", label: "Education" },
  { href: "#achievements", label: "Achievements" },
  { href: "#contact", label: "Contact" },
];

function FooterHeading({ children }) {
  return <h3 className="text-sm font-semibold text-muted">{children}</h3>;
}

export default function Footer({ profile }) {
  const hasResume = useFileAvailable(profile.resumeUrl, "application/pdf");

  return (
    <footer className="border-t border-rule bg-surface">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)_minmax(0,1.5fr)_minmax(0,0.9fr)]">
        <div>
          <p className="font-display text-2xl font-bold text-ink">{profile.name}</p>
          <p className="mt-3 text-muted">{profile.headlineFirst}</p>
          <p className="text-muted">{profile.headlineSecond}</p>
          {profile.location && <p className="mt-4 text-sm text-muted">{profile.location}</p>}
        </div>

        <nav aria-label="Footer navigation">
          <FooterHeading>On this page</FooterHeading>
          <ul className="mt-4 space-y-2.5 text-ink">
            {sectionLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="hover:text-accent">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <FooterHeading>Contact</FooterHeading>
          <ul className="mt-4 space-y-2.5 text-ink">
            {profile.email && (
              <li>
                <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 break-words hover:text-accent">
                  <Mail size={16} aria-hidden="true" />
                  {profile.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <FooterHeading>Elsewhere</FooterHeading>
          <ul className="mt-4 space-y-2.5 text-ink">
            {profile.github && (
              <li>
                <a href={profile.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-accent">
                  <Github size={16} aria-hidden="true" />
                  GitHub
                </a>
              </li>
            )}
            {profile.linkedin && (
              <li>
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-accent">
                  <Linkedin size={16} aria-hidden="true" />
                  LinkedIn
                </a>
              </li>
            )}
            {hasResume && (
              <li>
                <a href={profile.resumeUrl} download className="inline-flex items-center gap-2 hover:text-accent">
                  <Download size={16} aria-hidden="true" />
                  Resume (PDF)
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {profile.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#top" className="hover:text-ink">
              Back to top
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
