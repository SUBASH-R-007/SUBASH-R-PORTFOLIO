"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { site, ui } from "@/content/site";
import type { Leadership as Lead } from "@/content/types";
import { Counter } from "@/components/ui/Counter";
import { Placeholder } from "@/components/ui/Placeholder";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getSeries } from "@/lib/assets";
import { EASE } from "@/lib/motion";

function Carousel({ lead }: { lead: Lead }) {
  const photos = getSeries(lead.photos);
  const count = photos.length || lead.photos.length;
  const [i, setI] = useState(0);
  const go = (d: number) => setI((x) => (x + d + count) % count);
  const current = photos[i];

  return (
    <div className="relative">
      <div className="glass brackets relative aspect-[4/3] overflow-hidden" aria-roledescription="carousel" aria-label={ui.leadership.photos}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={i}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            aria-label={`${i + 1} / ${count}`}
            role="group"
          >
            {current ? (
              <Image src={current.src} alt={`${lead.organisation}, ${ui.leadership.photos} ${i + 1}`} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" placeholder={current.blurDataURL ? "blur" : "empty"} blurDataURL={current.blurDataURL} />
            ) : (
              <Placeholder kind="photo" path={lead.photos[i]} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {count > 1 && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1.5">
            {Array.from({ length: count }, (_, n) => (
              <button
                key={n}
                type="button"
                onClick={() => setI(n)}
                aria-label={`${n + 1} / ${count}`}
                aria-current={n === i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: n === i ? 24 : 8, background: n === i ? "var(--accent-1)" : "var(--line-strong)" }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" className="icon-btn" onClick={() => go(-1)} aria-label={ui.certifications.prev}>
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button type="button" className="icon-btn" onClick={() => go(1)} aria-label={ui.certifications.next}>
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Leadership() {
  return (
    <section id="leadership" className="container-hud scroll-mt-20 py-24 md:py-32">
      <SectionHeader id="leadership" />
      {site.leadership.map((lead) => (
        <div key={lead.id} className="grid items-start gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
          <motion.div
            className="glass brackets p-6 sm:p-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl ring-1 ring-line-strong" style={{ background: "color-mix(in srgb, var(--accent-2) 14%, transparent)" }}>
                <Shield className="size-5 text-accent-2" aria-hidden />
              </span>
              <div>
                <p className="font-mono text-xs text-accent-1">{lead.period}</p>
                <p className="hud-label mt-0.5">{lead.organisation}</p>
              </div>
            </div>
            <h3 className="mt-5 font-display text-3xl font-semibold text-fg sm:text-4xl">{lead.role}</h3>
            <ul className="mt-5 space-y-3">
              {lead.bullets.map((b, i) => (
                <li key={i} className="flex gap-3 leading-relaxed text-fg/90">
                  <span aria-hidden className="mt-2.5 size-1 shrink-0 rotate-45 bg-accent-1" />
                  {b}
                </li>
              ))}
            </ul>
            <dl className="mt-7 grid grid-cols-2 gap-3">
              {lead.stats.map((s) => (
                <div key={s.label} className="rounded-xl p-4 ring-1 ring-line" style={{ background: "color-mix(in srgb, var(--bg-elev) 60%, transparent)" }}>
                  <dd className="font-display text-3xl font-semibold text-glow" style={{ color: "var(--accent-3)" }}>
                    <Counter value={s.value} suffix={s.suffix} />
                  </dd>
                  <dt className="mt-1 text-xs text-fg-muted">{s.label}</dt>
                </div>
              ))}
            </dl>
          </motion.div>
          <Carousel lead={lead} />
        </div>
      ))}
    </section>
  );
}
