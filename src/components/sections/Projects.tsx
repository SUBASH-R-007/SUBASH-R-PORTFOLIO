import { ui } from "@/content/site";
import { FeaturedPanels } from "@/components/projects/FeaturedPanels";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function Projects() {
  return (
    <section id="projects" className="container-hud scroll-mt-20 py-24 md:py-32">
      <SectionHeader id="projects" aside={<p className="hud-label">{ui.projects.featured}</p>} />
      <FeaturedPanels />
      <div className="mt-24 md:mt-32">
        <ProjectGrid />
      </div>
    </section>
  );
}
