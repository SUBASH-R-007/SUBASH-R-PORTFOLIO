import { site } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function Home() {
  return (
    <>
      <section id="top" className="container-hud flex min-h-dvh items-center pt-24">
        <h1 className="font-display text-6xl font-semibold">{site.identity.name}</h1>
      </section>
      {site.sections.slice(1).map((s) => (
        <section key={s.id} id={s.id} className="container-hud min-h-[80vh] py-24">
          <SectionHeader id={s.id} />
        </section>
      ))}
    </>
  );
}
