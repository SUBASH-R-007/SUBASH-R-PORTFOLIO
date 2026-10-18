"use client";

import { motion } from "motion/react";
import { site, ui } from "@/content/site";
import { Counter } from "@/components/ui/Counter";
import { EASE } from "@/lib/motion";
import { mulberry32 } from "./shapes";

/** Decorative sparkline, deterministic per stat so server and client agree. */
function Sparkline({ seed }: { seed: string }) {
  const rand = mulberry32([...seed].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7));
  const pts = Array.from({ length: 14 }, (_, i) => {
    const y = 14 - (i / 13) * 8 - rand() * 6;
    return `${(i / 13) * 60},${y.toFixed(1)}`;
  });
  return (
    <svg viewBox="0 0 60 18" className="h-4 w-14 overflow-visible" aria-hidden>
      <motion.polyline
        points={pts.join(" ")}
        fill="none"
        stroke="var(--accent-1)"
        strokeWidth="1"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: EASE, delay: 0.4 }}
      />
      <circle cx="60" cy={pts[13].split(",")[1]} r="1.6" fill="var(--accent-3)" className="flicker" />
    </svg>
  );
}

export function Telemetry({ ready }: { ready: boolean }) {
  return (
    <div className="glass brackets mt-10 overflow-hidden lg:mt-14">
      <div className="flex items-center justify-between border-b border-line px-4 py-2 sm:px-5">
        <span className="hud-label flex items-center gap-2">
          <span className="size-1.5 animate-pulse rounded-full bg-accent-3" />
          {ui.hero.telemetry}
        </span>
        <span className="hud-label hidden sm:inline">{site.stats.length} CH</span>
      </div>
      <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {site.stats.map((s, i) => (
          <div
            key={s.id}
            className={`flex flex-col gap-2 border-line px-4 py-4 sm:px-5 ${i < site.stats.length - 1 ? "border-r" : ""} ${
              i === site.stats.length - 1 ? "col-span-2 sm:col-span-1" : ""
            } border-b lg:border-b-0`}
          >
            <dt className="hud-label text-[10px]">{s.label}</dt>
            <dd className="flex items-end justify-between gap-2">
              <Counter
                value={s.value}
                decimals={s.decimals}
                prefix={s.prefix}
                suffix={s.suffix}
                grouped={s.grouped}
                ready={ready}
                className="font-display text-2xl font-semibold tabular-nums text-fg sm:text-3xl"
              />
              <Sparkline seed={s.id} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
