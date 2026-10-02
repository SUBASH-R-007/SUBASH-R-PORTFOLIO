"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { scrollToId } from "@/lib/scroll";
import { useActiveSection } from "@/lib/useActiveSection";

const IDS = site.sections.map((s) => s.id);

/** Fixed side rail: scroll progress with a tick per section. Desktop only. */
export function ScrollRail() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  const active = useActiveSection(IDS);
  const [ticks, setTicks] = useState<{ id: string; at: number }[]>([]);

  useEffect(() => {
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      setTicks(
        IDS.flatMap((id) => {
          const el = document.getElementById(id);
          if (!el) return [];
          const top = el.getBoundingClientRect().top + window.scrollY;
          return [{ id, at: Math.min(1, Math.max(0, top / max)) }];
        }),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  return (
    <nav aria-label="Section progress" className="fixed right-5 top-1/2 z-40 hidden h-[56vh] -translate-y-1/2 lg:block">
      <div className="relative h-full w-px bg-line">
        <motion.div
          className="absolute inset-x-0 top-0 h-full origin-top"
          style={{ scaleY: progress, background: "linear-gradient(var(--accent-2), var(--accent-1))", boxShadow: "0 0 10px var(--glow)" }}
        />
        {ticks.map((t) => {
          const s = site.sections.find((x) => x.id === t.id)!;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => scrollToId(t.id)}
              className="group absolute right-1/2 flex translate-x-1/2 -translate-y-1/2 items-center p-1.5"
              style={{ top: `${t.at * 100}%` }}
              aria-label={`${s.index} ${s.title}`}
              aria-current={isActive ? "true" : undefined}
            >
              <span
                className="block size-1.5 rotate-45 transition-all duration-300"
                style={{
                  background: isActive ? "var(--accent-1)" : "var(--bg)",
                  boxShadow: `0 0 0 1px ${isActive ? "var(--accent-1)" : "var(--line-strong)"}${isActive ? ", 0 0 10px var(--glow)" : ""}`,
                  transform: `rotate(45deg) scale(${isActive ? 1.5 : 1})`,
                }}
              />
              <span className="hud-label pointer-events-none absolute right-6 whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                {s.index} {s.code}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
