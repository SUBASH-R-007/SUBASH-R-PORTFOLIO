"use client";

import { motion } from "motion/react";
import { GraduationCap, MapPin, Radio } from "lucide-react";
import { useState } from "react";
import { site, ui } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SmartImage } from "@/components/ui/SmartImage";
import { hasAsset } from "@/lib/assets";
import { useReducedMotion } from "@/lib/hooks";
import { EASE, VIEWPORT } from "@/lib/motion";

/** Split the summary into sentences so it can reveal line by line. */
// Splits after ". X" or ";" so abbreviations like "B.E. at" stay intact.
const LINES = site.summary.split(/(?<=\.)\s+(?=[A-Z])|(?<=;)\s+/);

const ORBITS = [
  { tilt: -24, rx: 168, ry: 62, dur: 16, color: "var(--accent-1)" },
  { tilt: 28, rx: 150, ry: 54, dur: 22, color: "var(--accent-2)" },
];

const ellipsePath = (rx: number, ry: number) => `M ${-rx} 0 a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 ${-rx * 2} 0`;

function DualOrbit() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const edu = site.education[active];

  return (
    <div className="relative">
      <svg viewBox="-200 -150 400 300" className="w-full overflow-visible" role="img" aria-label={site.education.map((e) => `${e.degree} ${e.field}, ${e.institution}`).join("; ")}>
        <defs>
          <radialGradient id="core-g">
            <stop offset="0" stopColor="var(--accent-1)" stopOpacity="0.55" />
            <stop offset="0.6" stopColor="var(--accent-2)" stopOpacity="0.15" />
            <stop offset="1" stopColor="var(--accent-2)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle r="70" fill="url(#core-g)" />
        {ORBITS.map((o, i) => {
          const on = active === i;
          const path = ellipsePath(o.rx, o.ry);
          return (
            <g
              key={i}
              transform={`rotate(${o.tilt})`}
              onPointerEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              className="cursor-pointer"
            >
              <path d={path} fill="none" stroke="transparent" strokeWidth="18" />
              <path
                d={path}
                fill="none"
                stroke={o.color}
                strokeOpacity={on ? 0.9 : 0.35}
                strokeWidth={on ? 1.4 : 0.8}
                strokeDasharray={on ? "none" : "3 5"}
                style={{ transition: "stroke-opacity .4s, stroke-width .4s", filter: on ? `drop-shadow(0 0 6px ${o.color})` : "none" }}
              />
              <g>
                <circle r={on ? 7 : 5} fill={o.color} style={{ filter: `drop-shadow(0 0 8px ${o.color})`, transition: "r .3s" }} />
                <circle r={on ? 14 : 10} fill="none" stroke={o.color} strokeOpacity="0.4" />
                {!reduced && <animateMotion dur={`${o.dur}s`} repeatCount="indefinite" path={path} rotate="0" begin={`${-i * 5}s`} />}
                {reduced && <animateMotion dur="1s" fill="freeze" path={path} keyPoints="0.25;0.25" keyTimes="0;1" calcMode="linear" />}
              </g>
            </g>
          );
        })}
        <circle r="34" fill="var(--bg-elev)" stroke="var(--line-strong)" />
        <circle r="34" fill="none" stroke="var(--accent-1)" strokeOpacity="0.6" strokeDasharray="2 4" className="origin-center animate-[spin-slow_30s_linear_infinite]" />
        <text textAnchor="middle" dy="4" className="fill-fg font-mono text-[11px] font-bold tracking-[0.2em]">
          {ui.about.core}
        </text>
      </svg>

      {/* Orbit selector (keyboard + touch) and details */}
      <div role="tablist" aria-label={ui.about.tracks} className="mt-2 flex justify-center gap-2">
        {site.education.map((e, i) => (
          <button
            key={e.id}
            role="tab"
            type="button"
            aria-selected={active === i}
            aria-controls="orbit-panel"
            onClick={() => setActive(i)}
            onPointerEnter={() => setActive(i)}
            className="chip"
            data-active={active === i}
          >
            <span className="size-1.5 rounded-full" style={{ background: ORBITS[i].color }} />
            {e.shortName}
          </button>
        ))}
      </div>
      <motion.div
        id="orbit-panel"
        role="tabpanel"
        key={edu.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="glass brackets mx-auto mt-4 max-w-md p-5"
      >
        <p className="hud-label" style={{ color: ORBITS[active].color }}>
          ORBIT 0{active + 1} {"// "}
          {edu.shortName}
        </p>
        <h3 className="mt-2 font-display text-lg font-semibold text-fg">
          {edu.degree}, {edu.field}
        </h3>
        <p className="text-sm text-fg-muted">
          {edu.institution}
          {edu.location ? `, ${edu.location}` : ""}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-fg-muted">{edu.period}</span>
          <span className="chip" style={{ color: "var(--accent-3)" }}>
            {edu.result}
          </span>
        </div>
      </motion.div>
      <p className="hud-label mt-3 text-center text-[10px] text-fg-muted/70">{ui.about.orbitHint}</p>
    </div>
  );
}

export function About() {
  const alt = hasAsset(site.identity.portraitSecondary);
  return (
    <section id="about" className="container-hud scroll-mt-20 py-24 md:py-32">
      <SectionHeader id="about" />
      <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <motion.p
            className="text-pretty text-lg leading-relaxed text-fg sm:text-xl md:text-2xl md:leading-relaxed"
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          >
            {LINES.map((line, i) => (
              <motion.span
                key={i}
                className="inline"
                variants={{
                  hidden: { opacity: 0.12, filter: "blur(4px)" },
                  show: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
                }}
              >
                {line}{" "}
              </motion.span>
            ))}
          </motion.p>

          <dl className="mt-10 grid gap-3 sm:grid-cols-2">
            <div className="glass flex items-start gap-3 p-4">
              <MapPin className="mt-0.5 size-4 text-accent-1" aria-hidden />
              <div>
                <dt className="hud-label">{ui.about.location}</dt>
                <dd className="mt-1 text-fg">{site.identity.location}</dd>
              </div>
            </div>
            <div className="glass flex items-start gap-3 p-4">
              <Radio className="mt-0.5 size-4 text-accent-3" aria-hidden />
              <div>
                <dt className="hud-label">{ui.about.status}</dt>
                <dd className="mt-1 text-fg">{site.identity.status}</dd>
              </div>
            </div>
            <div className="glass flex items-start gap-3 p-4 sm:col-span-2">
              <GraduationCap className="mt-0.5 size-4 text-accent-2" aria-hidden />
              <div>
                <dt className="hud-label">{ui.about.tracks}</dt>
                <dd className="mt-1 text-fg">
                  {site.education.map((e) => `${e.degree} ${e.shortName}`).join("  ⟂  ")}
                </dd>
              </div>
            </div>
          </dl>

          {alt && (
            <div className="glass brackets relative mt-6 aspect-[4/3] max-w-sm overflow-hidden">
              <SmartImage src={site.identity.portraitSecondary} alt={site.identity.portraitAlt} kind="portrait" sizes="384px" />
            </div>
          )}
        </div>
        <DualOrbit />
      </div>
    </section>
  );
}
