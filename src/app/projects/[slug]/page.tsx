import { ArrowLeft, ArrowRight, FolderGit2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { site, ui } from "@/content/site";
import { CoverMedia } from "@/components/projects/CoverMedia";
import { Gallery } from "@/components/projects/Gallery";
import { SkillChip } from "@/components/ui/Chip";
import { Counter } from "@/components/ui/Counter";
import { getProject, getSkill } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";

export const dynamicParams = false;

export function generateStaticParams() {
  return site.projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.oneLiner,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: { title: `${p.title} | ${site.identity.name}`, description: p.oneLiner, url: `/projects/${p.slug}` },
  };
}

function Block({ label, index, children }: { label: string; index: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-line py-10 md:grid-cols-[12rem_1fr] md:gap-10">
      <h2 className="hud-label pt-1">
        <span style={{ color: "var(--accent-1)" }}>{index}</span> {"// "}
        {label}
      </h2>
      <div>{children}</div>
    </section>
  );
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const idx = site.projects.findIndex((x) => x.slug === p.slug);
  const next = site.projects[(idx + 1) % site.projects.length];
  const xp = p.experienceId ? site.experience.find((e) => e.id === p.experienceId) : undefined;
  const stackByCategory = site.skillCategories
    .map((c) => ({ ...c, ids: p.tags.filter((t) => getSkill(t)?.category === c.id) }))
    .filter((c) => c.ids.length);

  let n = 0;
  const num = () => String(++n).padStart(2, "0");

  return (
    <article className="container-hud pt-28 pb-10 sm:pt-32">
      <Link href="/#projects" className="hud-label inline-flex items-center gap-2 transition-colors hover:text-accent-1">
        <ArrowLeft className="size-3.5" aria-hidden />
        {ui.caseStudy.back}
      </Link>

      <header className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-end">
        <div>
          <p className="hud-label">
            {p.context} <span className="text-fg-muted/50">·</span> {p.period}
          </p>
          <ViewTransition name={`title-${p.slug}`} share="morph" default="none">
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.02] tracking-tight text-fg sm:text-5xl lg:text-6xl">{p.title}</h1>
          </ViewTransition>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-fg-muted">{p.oneLiner}</p>
          {p.repo && (
            <a href={p.repo} target="_blank" rel="noreferrer" className="btn btn-ghost mt-7">
              <FolderGit2 className="size-4" aria-hidden />
              {ui.projects.github}
            </a>
          )}
        </div>
        <ViewTransition name={`cover-${p.slug}`} share="morph" default="none">
          <div className="glass brackets relative aspect-[16/10] overflow-hidden">
            <CoverMedia project={p} sizes="(min-width: 1024px) 55vw, 100vw" preload />
          </div>
        </ViewTransition>
      </header>

      <div className="mt-16">
        <Block index={num()} label={ui.caseStudy.overview}>
          <dl className="grid max-w-3xl gap-4 sm:grid-cols-3">
            {[
              [ui.caseStudy.context, p.context],
              [ui.caseStudy.period, p.period],
              [ui.caseStudy.domain, p.domains.map((d) => ui.projects.domains[d]).join(" · ")],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="hud-label text-[10px]">{k}</dt>
                <dd className="mt-1.5 text-fg">{v}</dd>
              </div>
            ))}
          </dl>
          {xp && (
            <p className="mt-4 text-sm text-fg-muted">
              {ui.caseStudy.related}:{" "}
              <Link href="/#experience" className="text-accent-1 underline-offset-4 hover:underline">
                {xp.role}, {xp.organisationShort}
              </Link>
            </p>
          )}
        </Block>

        <Block index={num()} label={ui.caseStudy.built}>
          <ul className="max-w-3xl space-y-4">
            {p.bullets.map((b, i) => (
              <li key={i} className="flex gap-3 leading-relaxed text-fg/90">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rotate-45 bg-accent-1" />
                {b}
              </li>
            ))}
          </ul>
        </Block>

        <Block index={num()} label={ui.caseStudy.stack}>
          <dl className="grid gap-5 sm:grid-cols-2">
            {stackByCategory.map((c) => (
              <div key={c.id}>
                <dt className="hud-label mb-2 text-[10px]">{c.label}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {c.ids.map((id) => (
                    <SkillChip key={id} id={id} />
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Block>

        {p.metrics.length > 0 && (
          <Block index={num()} label={ui.caseStudy.metrics}>
            <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {p.metrics.map((m) => (
                <div key={m.label} className="glass brackets p-5">
                  <dd className="font-display text-4xl font-semibold text-glow" style={{ color: "var(--accent-3)" }}>
                    <Counter value={m.value} decimals={m.decimals} prefix={m.prefix} suffix={m.suffix} grouped={m.value >= 10000} />
                  </dd>
                  <dt className="mt-2 text-sm text-fg-muted">{m.label}</dt>
                </div>
              ))}
            </dl>
          </Block>
        )}

        {p.caseStudy && (
          <Block index={num()} label={ui.caseStudy.writeup}>
            <div className="max-w-3xl space-y-4 leading-relaxed text-fg/90">{renderMarkdown(p.caseStudy)}</div>
          </Block>
        )}

        {p.gallery.length > 0 && (
          <Block index={num()} label={ui.caseStudy.gallery}>
            <Gallery project={p} />
          </Block>
        )}
      </div>

      <Link
        href={`/projects/${next.slug}`}
        className="glass brackets group mt-10 flex items-center justify-between gap-6 p-6 sm:p-8"
        data-cursor="view"
      >
        <div>
          <p className="hud-label">{ui.caseStudy.next}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-fg sm:text-3xl">{next.title}</p>
        </div>
        <ArrowRight className="size-6 shrink-0 text-accent-1 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
      </Link>
    </article>
  );
}
