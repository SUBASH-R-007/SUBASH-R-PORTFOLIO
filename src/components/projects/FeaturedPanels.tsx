"use client";

import { ArrowUpRight, FolderGit2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, ViewTransition } from "react";
import { ui } from "@/content/site";
import type { Project } from "@/content/types";
import { ChipList } from "@/components/ui/Chip";
import { Counter } from "@/components/ui/Counter";
import { Magnetic } from "@/components/ui/Magnetic";
import { featuredProjects } from "@/lib/content";
import { withGsap } from "@/lib/gsap";
import { CoverMedia } from "./CoverMedia";

function Panel({ p, i, total }: { p: Project; i: number; total: number }) {
  return (
    <article className="glass brackets panel-inner grid overflow-hidden md:grid-cols-[1.15fr_1fr]" data-cursor="view">
      <Link
        href={`/projects/${p.slug}`}
        className="group relative block aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[26rem]"
        aria-hidden
        tabIndex={-1}
      >
        <ViewTransition name={`cover-${p.slug}`} share="morph" default="none">
          <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]">
            <CoverMedia project={p} sizes="(min-width: 768px) 55vw, 100vw" />
          </div>
        </ViewTransition>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-bg/40"
        />
        <span className="hud-label absolute left-4 top-4 rounded-full bg-bg/70 px-2.5 py-1 backdrop-blur">
          SYS {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </Link>

      <div className="flex flex-col p-6 sm:p-8">
        <p className="hud-label">
          {p.context} <span className="text-fg-muted">·</span> {p.period}
        </p>
        <ViewTransition name={`title-${p.slug}`} share="morph" default="none">
          <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-fg sm:text-3xl">{p.title}</h3>
        </ViewTransition>
        <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">{p.oneLiner}</p>

        {p.metrics.length > 0 && (
          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5">
            {p.metrics.map((m) => (
              <div key={m.label} className="border-l border-accent-1/40 pl-3">
                <dd className="font-display text-3xl font-semibold leading-none text-glow sm:text-4xl" style={{ color: "var(--accent-3)" }}>
                  <Counter value={m.value} decimals={m.decimals} prefix={m.prefix} suffix={m.suffix} grouped={m.value >= 10000} />
                </dd>
                <dt className="mt-2 text-xs leading-snug text-fg-muted">{m.label}</dt>
              </div>
            ))}
          </dl>
        )}

        <ChipList ids={p.tags} className="mt-6" />

        <div className="mt-auto flex flex-wrap gap-3 pt-7">
          <Magnetic>
            <Link href={`/projects/${p.slug}`} className="btn btn-primary">
              {ui.projects.caseStudy}
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </Magnetic>
          {p.repo && (
            <Magnetic>
              <a href={p.repo} target="_blank" rel="noreferrer" className="btn btn-ghost">
                <FolderGit2 className="size-4" aria-hidden />
                {ui.projects.github}
              </a>
            </Magnetic>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * Featured trio as stacked sticky panels. On desktop, GSAP scrubs each panel
 * back (scale + dim) as the next one slides over it.
 */
export function FeaturedPanels() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    return withGsap(({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const panels = gsap.utils.toArray<HTMLElement>(el.querySelectorAll("[data-panel]"));
        panels.forEach((panel, i) => {
          const next = panels[i + 1];
          if (!next) return;
          gsap.to(panel.querySelector(".panel-inner"), {
            scale: 0.92,
            opacity: 0.35,
            ease: "none",
            scrollTrigger: { trigger: next, start: "top bottom-=10%", end: "top top+=120", scrub: true },
          });
        });
      });
      return () => mm.revert();
    });
  }, []);

  return (
    <div ref={root} className="space-y-6 md:space-y-[12vh]">
      {featuredProjects.map((p, i) => (
        <div key={p.slug} data-panel className="md:sticky" style={{ top: `calc(var(--nav-h) + 24px + ${i * 14}px)` }}>
          <Panel p={p} i={i} total={featuredProjects.length} />
        </div>
      ))}
    </div>
  );
}
