"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Lock } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { site, ui } from "@/content/site";
import type { Experience as Exp } from "@/content/types";
import { ChipList } from "@/components/ui/Chip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SmartImage } from "@/components/ui/SmartImage";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import { EASE } from "@/lib/motion";
import { useActiveSection } from "@/lib/useActiveSection";

const CARD_IDS = site.experience.map((e) => `xp-${e.id}`);

/** Decorative redaction line on the NDA card. The real bullet stays readable. */
function Redaction() {
  const bars = ["w-24", "w-16", "w-28"];
  return (
    <div aria-hidden className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[11px] text-fg-muted">
      <span>FILE</span>
      {bars.map((w, i) => (
        <motion.span
          key={i}
          className={`inline-block h-3 ${w} origin-left rounded-[2px] bg-fg/80`}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 + i * 0.18 }}
        />
      ))}
      <span>CLEARANCE: NDA</span>
    </div>
  );
}

function Card({ xp, active }: { xp: Exp; active: boolean }) {
  return (
    <motion.article
      id={`xp-${xp.id}`}
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: 0.8, ease: EASE }}
      className="glass brackets relative p-5 sm:p-7"
      style={{ ["--c" as string]: active ? "var(--accent-1)" : "var(--line-strong)" }}
    >
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-bg-elev ring-1 ring-line">
          <SmartImage src={xp.logo} alt={`${xp.organisationShort} logo`} kind="logo" sizes="48px" fit="contain" compactPlaceholder imgClassName="p-1.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-xs text-accent-1">{xp.period}</p>
            {xp.current && (
              <span className="chip py-0.5 text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--accent-3)" }}>
                <span className="size-1.5 animate-pulse rounded-full bg-accent-3" />
                {ui.experience.active}
              </span>
            )}
            {xp.nda && (
              <span
                className="chip py-0.5 text-[10px] uppercase tracking-[0.16em]"
                style={{ color: "#fda4af", boxShadow: "inset 0 0 0 1px rgba(253,164,175,0.45)" }}
              >
                <Lock className="size-3" aria-hidden />
                {ui.experience.classified}
              </span>
            )}
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-fg sm:text-2xl">{xp.role}</h3>
          <p className="mt-1 text-sm text-fg-muted">
            {xp.organisation} <span className="text-fg-muted/50">·</span> {xp.location}
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {xp.bullets.map((b, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-fg/90">
            <span aria-hidden className="mt-2.5 size-1 shrink-0 rotate-45 bg-accent-1" />
            {b}
          </li>
        ))}
      </ul>
      {xp.nda && <Redaction />}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <ChipList ids={xp.tags} />
        {xp.projectSlug && (
          <Link href={`/projects/${xp.projectSlug}`} className="group inline-flex items-center gap-1 font-mono text-xs uppercase tracking-[0.16em] text-accent-1">
            {ui.experience.viewProject}
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        )}
      </div>
    </motion.article>
  );
}

export function Experience() {
  const list = useRef<HTMLOListElement>(null);
  const spine = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const active = useActiveSection(CARD_IDS);

  useEffect(() => {
    const line = spine.current;
    if (!line || !list.current) return;
    if (reduced) {
      line.style.transform = "scaleY(1)";
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: list.current, start: "top 70%", end: "bottom 60%", scrub: 0.6 },
        },
      );
    });
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="experience" className="container-hud scroll-mt-20 py-24 md:py-32">
      <SectionHeader id="experience" />
      <ol ref={list} className="relative space-y-8 pl-8 sm:pl-14">
        {/* Spine: a faint track plus a glowing line scrubbed by scroll. */}
        <div aria-hidden className="absolute bottom-4 left-[7px] top-2 w-0.5 bg-line sm:left-[19px]">
          <div
            ref={spine}
            className="absolute inset-0 origin-top"
            style={{
              transform: "scaleY(0)",
              background: "linear-gradient(var(--accent-2), var(--accent-1))",
              boxShadow: "0 0 10px var(--glow)",
            }}
          />
        </div>
        {site.experience.map((xp) => {
          const on = active === `xp-${xp.id}`;
          return (
            <li key={xp.id} className="relative">
              {/* Node */}
              <span aria-hidden className="absolute -left-8 top-7 grid size-4 place-items-center sm:-left-14 sm:top-8 sm:ml-3">
                {on && <span className="absolute inset-0 rounded-full bg-accent-1/50 animate-[pulse-ring_1.6s_cubic-bezier(0.16,1,0.3,1)_infinite]" />}
                <span
                  className="size-2.5 rotate-45 transition-all duration-500"
                  style={{
                    background: on ? "var(--accent-1)" : "var(--bg)",
                    boxShadow: `0 0 0 1.5px ${on ? "var(--accent-1)" : "var(--line-strong)"}${on ? ", 0 0 14px var(--glow)" : ""}`,
                  }}
                />
              </span>
              <Card xp={xp} active={on} />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
