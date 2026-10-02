"use client";

import { useInView } from "motion/react";
import { RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { site, ui } from "@/content/site";
import type { Achievement } from "@/content/types";
import { Counter } from "@/components/ui/Counter";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SmartImage } from "@/components/ui/SmartImage";
import { withGsap } from "@/lib/gsap";
import { safeStorage, useIsTouch } from "@/lib/hooks";
import { toast } from "@/lib/store";

function AwardCard({ a, i }: { a: Achievement; i: number }) {
  const [flipped, setFlipped] = useState(false);
  const touch = useIsTouch();
  return (
    <li
      className={`relative shrink-0 snap-center [perspective:1400px] ${a.highlight ? "w-[min(86vw,36rem)]" : "w-[min(78vw,21rem)]"}`}
      onPointerEnter={(e) => !touch && e.pointerType === "mouse" && setFlipped(true)}
      onPointerLeave={(e) => !touch && e.pointerType === "mouse" && setFlipped(false)}
    >
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-pressed={flipped}
        className="relative block h-[26rem] w-full text-left transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [transform-style:preserve-3d] motion-reduce:duration-0"
        style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
      >
        {/* Front */}
        <div
          className={`glass brackets absolute inset-0 flex flex-col p-6 [backface-visibility:hidden] ${a.highlight ? "sm:p-8" : ""}`}
          style={
            a.highlight
              ? { background: "linear-gradient(135deg, color-mix(in srgb, var(--accent-2) 22%, var(--glass)), var(--glass))" }
              : undefined
          }
        >
          <div className="flex items-center justify-between">
            <span className="hud-label" style={{ color: "var(--accent-1)" }}>
              #{String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-mono text-xs text-fg-muted">{a.date}</span>
          </div>
          <div className="relative my-auto grid place-items-center py-6">
            <span
              aria-hidden
              className="absolute size-28 rounded-full opacity-60 blur-2xl"
              style={{ background: a.highlight ? "var(--accent-2)" : "var(--accent-1)" }}
            />
            <span
              className="relative grid size-20 place-items-center rounded-full ring-1 ring-line-strong"
              style={{ background: "var(--bg-elev)" }}
            >
              <Trophy className="size-8" strokeWidth={1.25} style={{ color: "var(--accent-3)" }} aria-hidden />
            </span>
          </div>
          <h3 className={`font-display font-semibold leading-snug text-fg ${a.highlight ? "text-2xl sm:text-3xl" : "text-xl"}`}>
            {a.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">{a.context}</p>
          <span className="hud-label mt-4 text-[10px]">{ui.achievements.flip} ↻</span>
        </div>
        {/* Back: proof */}
        <div className="glass absolute inset-0 flex flex-col overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="relative flex-1">
            <SmartImage src={a.image} alt={`${a.title}: proof`} kind="certificate" sizes="(min-width: 768px) 36rem, 86vw" />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line p-4">
            <p className="truncate text-sm text-fg">{a.title}</p>
            <RotateCcw className="size-4 shrink-0 text-fg-muted" aria-hidden />
          </div>
        </div>
      </button>
      {a.projectSlug && (
        <Link href={`/projects/${a.projectSlug}`} className="hud-label mt-3 inline-block text-[10px] hover:text-accent-1">
          → {site.projects.find((p) => p.slug === a.projectSlug)?.title}
        </Link>
      )}
    </li>
  );
}

export function Achievements() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const inView = useInView(section, { once: true, margin: "0px 0px -40% 0px" });
  const count = site.achievements.length;

  useEffect(() => {
    if (!inView) return;
    const store = safeStorage("session");
    if (store.get("sr-vault")) return;
    store.set("sr-vault", "1");
    toast(ui.achievements.toast, "accent");
  }, [inView]);

  useEffect(() => {
    const el = section.current;
    const list = track.current;
    if (!el || !list) return;
    return withGsap(({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const distance = () => Math.max(0, list.scrollWidth - list.clientWidth);
        gsap.to(list, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
      });
      return () => mm.revert();
    });
  }, []);

  // GSAP's pin re-parents the section into a pin-spacer, so React owns an outer wrapper instead.
  return (
    <div>
      <section
        ref={section}
        id="achievements"
        className="scroll-mt-20 overflow-x-clip py-24 md:flex md:min-h-dvh md:flex-col md:justify-center md:py-16"
      >
        <div className="container-hud">
          <SectionHeader
            id="achievements"
            aside={
              <p className="flex items-baseline gap-2 font-mono text-sm uppercase tracking-[0.18em] text-fg-muted">
                <Counter value={count} className="font-display text-4xl font-semibold text-fg text-glow" />
                <span style={{ color: "var(--accent-3)" }}>{ui.achievements.unlocked}</span>
              </p>
            }
          />
        </div>
        <ul
          ref={track}
          data-cursor="drag"
          data-lenis-prevent-touch
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 [scrollbar-width:none] sm:px-6 md:snap-none md:overflow-visible lg:px-10 xl:px-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]"
          aria-label={site.sections.find((s) => s.id === "achievements")?.title}
        >
          {site.achievements.map((a, i) => (
            <AwardCard key={a.id} a={a} i={i} />
          ))}
        </ul>
        <p className="hud-label container-hud mt-2 text-[10px] md:hidden">{ui.achievements.drag} →</p>
      </section>
    </div>
  );
}
