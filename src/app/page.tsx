import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { site } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";

const DONE = ["top", "about", "experience", "projects"];

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Projects />
      {site.sections
        .filter((s) => !DONE.includes(s.id))
        .map((s) => (
          <section key={s.id} id={s.id} className="container-hud min-h-[60vh] py-24">
            <SectionHeader id={s.id} />
          </section>
        ))}
    </>
  );
}
