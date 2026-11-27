import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Hero from "../sections/Hero.jsx";
import About from "../sections/About.jsx";
import Skills from "../sections/Skills.jsx";
import Projects from "../sections/Projects.jsx";
import Education from "../sections/Education.jsx";
import Achievements from "../sections/Achievements.jsx";
import Contact from "../sections/Contact.jsx";
import { useContent } from "../context/ContentContext.jsx";

export default function HomePage() {
  const { content, status } = useContent();

  if (!content) {
    return status === "error" ? (
      <div className="grid min-h-screen place-items-center px-6">
        <p className="text-danger">Couldn't load the portfolio. Refresh the page to try again.</p>
      </div>
    ) : (
      <div className="min-h-screen" aria-busy="true" />
    );
  }

  const { profile } = content;

  return (
    <div className="min-h-screen">
      <Navbar name={profile.name} />
      <Hero profile={profile} />

      <main className="mx-auto max-w-6xl px-6">
        <About profile={profile} />
        <Skills groups={content.skillGroups} />
        <Projects projects={content.projects} />
        <Education items={content.education} />
        <Achievements certifications={content.certifications} achievements={content.achievements} />
        <Contact profile={profile} />
      </main>

      <Footer profile={profile} />
    </div>
  );
}
