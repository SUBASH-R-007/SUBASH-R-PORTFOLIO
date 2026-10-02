"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { site, ui } from "@/content/site";
import { safeStorage } from "@/lib/hooks";
import { EASE } from "@/lib/motion";
import { setUI, useUI } from "@/lib/store";

const TYPE_MS = 1500;
const HOLD_MS = 350;
const POWER_MS = 700;

/**
 * First-visit terminal boot. Present in the server HTML (so nothing flashes
 * before it), but only shown when the inline head script marks the document
 * `data-boot="pending"` (first visit this session, motion allowed).
 */
export function BootSequence() {
  const booted = useUI((s) => s.booted);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"typing" | "power">("typing");
  const finishing = useRef(false);

  const finish = useCallback(() => {
    if (finishing.current) return;
    finishing.current = true;
    setPhase("power");
    window.setTimeout(() => {
      document.documentElement.dataset.boot = "seen";
      safeStorage("session").set("sr-boot", "1");
      setUI({ booted: true });
    }, POWER_MS);
  }, []);

  useEffect(() => {
    if (booted) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / TYPE_MS);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else window.setTimeout(finish, HOLD_MS);
    };
    raf = requestAnimationFrame(tick);
    const skip = () => finish();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [booted, finish]);

  if (booted) return null;

  const total = site.boot.reduce((n, l) => n + l.length, 0);
  const typed = Math.floor(progress * total);
  const offsets = site.boot.map((_, i) => site.boot.slice(0, i).reduce((n, l) => n + l.length, 0));
  const lines = site.boot.map((line, i) => line.slice(0, Math.max(0, typed - offsets[i])));

  return (
    <div className="boot-overlay fixed inset-0 z-[100] items-center justify-center" aria-hidden={phase === "power"}>
      {/* Two shutters that part from the centre line (CRT power-on). */}
      <motion.div
        className="absolute inset-x-0 top-0 h-1/2 bg-bg"
        animate={phase === "power" ? { y: "-100%" } : { y: 0 }}
        transition={{ duration: POWER_MS / 1000, ease: EASE, delay: 0.18 }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-bg"
        animate={phase === "power" ? { y: "100%" } : { y: 0 }}
        transition={{ duration: POWER_MS / 1000, ease: EASE, delay: 0.18 }}
      />
      <motion.div
        className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
        style={{ background: "var(--accent-1)", boxShadow: "0 0 24px 4px var(--glow)" }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={phase === "power" ? { scaleX: [0, 1, 1], opacity: [1, 1, 0] } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.6, ease: EASE, times: [0, 0.35, 1] }}
      />

      <AnimatePresence>
        {phase === "typing" && (
          <motion.div
            key="term"
            exit={{ opacity: 0, scaleY: 0.02, filter: "brightness(2)" }}
            transition={{ duration: 0.2 }}
            className="relative w-[min(36rem,calc(100vw-2rem))] font-mono text-[13px] leading-relaxed text-fg sm:text-sm"
          >
            <div className="scanlines pointer-events-none absolute -inset-6 opacity-60" />
            <p className="hud-label mb-4" style={{ color: "var(--accent-1)" }}>
              SR // NEURAL INTERFACE
            </p>
            <div className="min-h-[9.5em]">
              {lines.map((l, i) =>
                l ? (
                  <p key={i} className={i === site.boot.length - 1 ? "text-accent-1" : "text-fg/85"}>
                    {l}
                    {l.length < site.boot[i].length && <span className="caret" />}
                  </p>
                ) : null,
              )}
            </div>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress * 100}%`,
                    background: "linear-gradient(90deg, var(--accent-2), var(--accent-1))",
                    boxShadow: "0 0 12px var(--glow)",
                  }}
                />
              </div>
              <span className="w-12 text-right text-xs tabular-nums text-fg-muted">{Math.round(progress * 100)}%</span>
            </div>
            <p className="hud-label mt-3 h-4">{progress >= 1 ? ui.boot.ready : ui.boot.hint}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "typing" && (
        <button
          type="button"
          onClick={finish}
          className="btn btn-ghost absolute bottom-6 right-6 min-h-0 px-4 py-2"
        >
          {ui.boot.skip}
        </button>
      )}
    </div>
  );
}
