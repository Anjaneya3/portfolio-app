import { useState } from "react";
import { Menu, X } from "lucide-react";
import toast from "react-hot-toast";
import ThemeToggle from "./ThemeToggle.jsx";
import { buttonClasses } from "./Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#education", label: "Education" },
  { href: "#achievements", label: "Achievements" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar({ name }) {
  const { canEdit, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    try {
      await logout();
      setMenuOpen(false);
      toast.success("Signed out");
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-page/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <a href="#top" className="font-display text-lg font-bold text-ink hover:text-accent">
          {name}
        </a>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex gap-7 text-sm font-semibold text-muted">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="hover:text-ink">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          {canEdit && (
            <span className="hidden rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent md:inline">
              Editing
            </span>
          )}
          {canEdit && (
            <button type="button" onClick={handleSignOut} className={`${buttonClasses("secondary")} hidden py-2 md:inline-flex`}>
              Sign out
            </button>
          )}
          <ThemeToggle />
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-rule text-ink lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-rule px-6 py-5 lg:hidden">
          <ul className="flex flex-col gap-4 text-base font-semibold text-ink">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setMenuOpen(false)} className="block hover:text-accent">
                  {link.label}
                </a>
              </li>
            ))}
            {canEdit && (
              <li>
                <button type="button" onClick={handleSignOut} className="font-semibold text-danger">
                  Sign out
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
