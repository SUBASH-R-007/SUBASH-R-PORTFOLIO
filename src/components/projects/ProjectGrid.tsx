"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ArrowUpRight, X } from "lucide-react";
import Link from "next/link";
import { useState, ViewTransition } from "react";
import { site, ui } from "@/content/site";
import type { Project, ProjectDomain } from "@/content/types";
import { ChipList } from "@/components/ui/Chip";
import { TiltCard } from "@/components/ui/TiltCard";
import { activeDomains, skillName } from "@/lib/content";
import { EASE } from "@/lib/motion";
import { setUI, useUI } from "@/lib/store";
import { CoverMedia } from "./CoverMedia";

type Filter = "all" | ProjectDomain;

function GridCard({ p, wide }: { p: Project; wide: boolean }) {
  // Featured projects already carry the shared-element names in their panels.
  const cover = (
    <div className="absolute inset-0">
      <CoverMedia project={p} sizes={wide ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 30vw, 100vw"} />
    </div>
  );
  const title = <h3 className="font-display text-xl font-semibold leading-snug text-fg">{p.title}</h3>;
  return (
    <TiltCard className="rounded-[14px]">
      <Link
        href={`/projects/${p.slug}`}
        className="glass group flex h-full flex-col overflow-hidden"
        data-cursor="view"
      >
        <div className="relative h-52 overflow-hidden sm:h-60">
          {p.featured ? cover : <ViewTransition name={`cover-${p.slug}`} share="morph" default="none">{cover}</ViewTransition>}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg/80 via-bg/10 to-transparent" />
          <span className="hud-label absolute bottom-3 left-4 text-[10px]">{p.period}</span>
          {p.featured && (
            <span className="hud-label absolute right-3 top-3 rounded-full bg-bg/70 px-2 py-0.5 text-[10px]" style={{ color: "var(--accent-3)" }}>
              {ui.projects.featured}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="hud-label text-[10px]">{p.context}</p>
          <div className="mt-2 flex items-start justify-between gap-3">
            {p.featured ? title : <ViewTransition name={`title-${p.slug}`} share="morph" default="none">{title}</ViewTransition>}
            <ArrowUpRight className="mt-1 size-4 shrink-0 text-fg-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-1" aria-hidden />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">{p.oneLiner}</p>
          <ChipList ids={p.tags.slice(0, 5)} className="mt-auto pt-4" />
        </div>
      </Link>
    </TiltCard>
  );
}

export function ProjectGrid() {
  const [filter, setFilter] = useState<Filter>("all");
  const skill = useUI((s) => s.skillFilter);
  const domains = activeDomains();

  const filtering = filter !== "all" || !!skill;
  const list = site.projects.filter((p) => {
    if (!filtering) return !p.featured;
    if (filter !== "all" && !p.domains.includes(filter)) return false;
    if (skill && !p.tags.includes(skill)) return false;
    return true;
  });

  const options: { id: Filter; label: string }[] = [
    { id: "all", label: ui.projects.all },
    ...domains.map((d) => ({ id: d as Filter, label: ui.projects.domains[d] })),
  ];

  return (
    <div id="projects-grid" className="scroll-mt-28">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h3 className="hud-label">
          <span style={{ color: "var(--accent-1)" }}>{"// "}</span>
          {filtering ? `${list.length} / ${site.projects.length} SYSTEMS` : ui.projects.others}
        </h3>
        <div role="group" aria-label={ui.projects.filterLabel} className="-mx-1 flex flex-wrap gap-1.5 px-1">
          <LayoutGroup id="filters">
            {options.map((o) => (
              <button
                key={o.id}
                type="button"
                aria-pressed={filter === o.id}
                onClick={() => setFilter(o.id)}
                className="relative rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted ring-1 ring-line transition-colors hover:text-fg aria-pressed:text-bg"
              >
                {filter === o.id && (
                  <motion.span layoutId="filter-pill" className="absolute inset-0 -z-0 rounded-full bg-accent-1" transition={{ duration: 0.4, ease: EASE }} />
                )}
                <span className="relative">{o.label}</span>
              </button>
            ))}
          </LayoutGroup>
          {skill && (
            <button
              type="button"
              onClick={() => setUI({ skillFilter: null })}
              className="chip"
              data-active="true"
              aria-label={`${ui.projects.clear}: ${skillName(skill)}`}
            >
              {ui.projects.skillFilter}: {skillName(skill)}
              <X className="size-3" aria-hidden />
            </button>
          )}
        </div>
      </div>

      <motion.ul layout className="grid gap-5 md:grid-cols-2 lg:grid-cols-6">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((p, i) => {
            const wide = list.length > 1 && (i % 4 === 0 || i % 4 === 3);
            return (
              <motion.li
                key={p.slug}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.5, ease: EASE }}
                className={wide ? "lg:col-span-4" : "lg:col-span-2"}
              >
                <GridCard p={p} wide={wide} />
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
      {list.length === 0 && <p className="mt-6 text-center font-mono text-sm text-fg-muted">{ui.projects.empty}</p>}
    </div>
  );
}
