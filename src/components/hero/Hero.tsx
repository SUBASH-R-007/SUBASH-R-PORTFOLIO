"use client";

import { motion } from "motion/react";
import { ArrowDownRight, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { site, ui } from "@/content/site";
import { SectionLink } from "@/components/hud/NavLink";
import { Magnetic } from "@/components/ui/Magnetic";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { useReducedMotion } from "@/lib/hooks";
import { EASE } from "@/lib/motion";
import { useUI } from "@/lib/store";
import { NeuralFieldLoader } from "./NeuralFieldLoader";
import { PortraitFrame } from "./PortraitFrame";
import { Telemetry } from "./Telemetry";

const ROLE_MS = 3200;

export function Hero() {
  const booted = useUI((s) => s.booted);
  const reduced = useReducedMotion();
  const [role, setRole] = useState(0);

  useEffect(() => {
    if (!booted || reduced) return;
    const id = window.setInterval(() => setRole((r) => (r + 1) % site.identity.roles.length), ROLE_MS);
    return () => window.clearInterval(id);
  }, [booted, reduced]);

  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 18, filter: "blur(6px)" },
    animate: booted ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
    transition: { duration: 0.8, ease: EASE, delay },
  });

  return (
    <section id="top" aria-labelledby="hero-name" className="relative flex min-h-[100svh] flex-col overflow-x-clip pt-24 pb-10 sm:pt-28">
      <div className="container-hud grid flex-1 items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6">
        {/* Visual: 3D field + portrait ring */}
        <div className="relative order-first mx-auto w-[min(72vw,300px)] sm:w-[340px] lg:order-last lg:w-full lg:max-w-[460px]">
          <div className="pointer-events-none absolute -inset-[45%] lg:-inset-[38%]">
            <NeuralFieldLoader shape={role} />
          </div>
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={booted ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
          >
            <PortraitFrame />
          </motion.div>
        </div>

        {/* Copy */}
        <div className="relative z-10 text-center lg:text-left">
          <motion.p className="hud-label flex items-center justify-center gap-2 lg:justify-start" {...enter(0.05)}>
            <span className="hidden text-accent-1 sm:inline">{site.sections[0].index}</span>
            <span aria-hidden className="hidden h-px w-8 bg-accent-1/60 sm:inline-block" />
            {ui.hero.kicker}
          </motion.p>

          <h1
            id="hero-name"
            className="mt-5 font-display text-[clamp(3.25rem,12vw,8.5rem)] font-bold uppercase leading-[0.86] tracking-[-0.03em]"
          >
            <ScrambleText text={site.identity.name} ready={booted} duration={1100} className="gradient-text text-glow" />
          </h1>

          <motion.p className="mt-6 font-mono text-base text-fg sm:text-lg" {...enter(0.25)}>
            <span className="text-accent-1">&gt;</span>{" "}
            <span className="sr-only">{site.identity.roles.join(", ")}</span>
            <span aria-hidden>
              <ScrambleText key="role" text={site.identity.roles[role]} replay ready={booted} duration={600} />
              <span className="caret" />
            </span>
          </motion.p>

          <motion.p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-fg-muted sm:text-base lg:mx-0" {...enter(0.35)}>
            {site.identity.location} <span className="text-fg-muted/50">·</span>{" "}
            <span className="text-fg">{site.identity.status}</span>
          </motion.p>

          <motion.div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start" {...enter(0.45)}>
            <Magnetic>
              <SectionLink id="projects" className="btn btn-primary" data-cursor="link">
                {ui.hero.ctaProjects}
                <ArrowDownRight className="size-4" aria-hidden />
              </SectionLink>
            </Magnetic>
            <Magnetic>
              <a href={site.config.resumePath} download className="btn btn-ghost">
                <Download className="size-4" aria-hidden />
                {ui.hero.ctaResume}
              </a>
            </Magnetic>
          </motion.div>
        </div>
      </div>

      <div className="container-hud">
        <motion.div {...enter(0.6)}>
          <Telemetry ready={booted} />
        </motion.div>
        <motion.div className="mt-8 hidden items-center justify-center gap-3 sm:flex" {...enter(0.8)}>
          <span className="hud-label">{ui.hero.scroll}</span>
          <span aria-hidden className="relative h-px w-24 overflow-hidden bg-line">
            <span className="absolute inset-y-0 left-0 w-8 animate-[scrollcue_2.2s_cubic-bezier(0.16,1,0.3,1)_infinite] bg-accent-1" />
          </span>
        </motion.div>
      </div>
    </section>
  );
}
