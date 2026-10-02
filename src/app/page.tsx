import { site } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Hero } from "@/components/hero/Hero";

export default function Home() {
  return (
    <>
      <Hero />
      {site.sections.slice(1).map((s) => (
        <section key={s.id} id={s.id} className="container-hud min-h-[80vh] py-24">
          <SectionHeader id={s.id} />
        </section>
      ))}
    </>
  );
}
