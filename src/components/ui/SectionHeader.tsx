"use client";

import { motion } from "motion/react";
import { sectionById } from "@/lib/content";
import { EASE, VIEWPORT } from "@/lib/motion";
import { ScrambleText } from "./ScrambleText";

/** "MODULE 03 // PROJECTS" label, decrypting title, and a scanline wipe on enter. */
export function SectionHeader({ id, aside }: { id: string; aside?: React.ReactNode }) {
  const s = sectionById(id);
  return (
    <header className="relative mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
      <div className="relative">
        <motion.div
          aria-hidden
          className="absolute -inset-x-4 top-0 h-px origin-left"
          style={{ background: "linear-gradient(90deg, var(--accent-1), transparent)" }}
          initial={{ scaleX: 0, opacity: 1 }}
          whileInView={{ scaleX: 1, opacity: 0.6 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.9, ease: EASE }}
        />
        <p className="hud-label pt-4">
          <span style={{ color: "var(--accent-1)" }}>MODULE {s.index}</span> {"// "}
          {s.code}
          <span className="ml-3 hidden text-fg-muted sm:inline">[{s.kicker}]</span>
        </p>
        <ScrambleText
          as="h2"
          text={s.title}
          className="mt-3 block font-display text-4xl font-semibold tracking-tight text-fg sm:text-5xl lg:text-6xl"
        />
      </div>
      {aside}
    </header>
  );
}
