"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { useMediaQuery, useReducedMotion } from "@/lib/hooks";

type Mode = "default" | "link" | "view" | "drag" | "text";

/** Dot + trailing ring. Fine pointers only; off for touch and reduced motion. */
export function Cursor() {
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 420, damping: 34, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 420, damping: 34, mass: 0.6 });
  const [mode, setMode] = useState<Mode>("default");
  const [visible, setVisible] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.dataset.cursor = "on";
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const over = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const tagged = t?.closest<HTMLElement>("[data-cursor]");
      if (tagged?.dataset.cursor === "view" || tagged?.dataset.cursor === "drag") setMode(tagged.dataset.cursor);
      else if (t?.closest("input, textarea, [contenteditable=true]")) setMode("text");
      else if (t?.closest("a, button, [role=button], [role=tab], label")) setMode("link");
      else setMode("default");
    };
    const leave = () => setVisible(false);
    const press = () => setDown(true);
    const release = () => setDown(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    return () => {
      delete document.documentElement.dataset.cursor;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;
  const labelled = mode === "view" || mode === "drag";
  const size = labelled ? 76 : mode === "link" ? 44 : mode === "text" ? 4 : 30;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[150]" style={{ opacity: visible ? 1 : 0, transition: "opacity .2s" }}>
      <motion.div className="absolute left-0 top-0" style={{ x: rx, y: ry }}>
        <div
          className="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.2em] transition-[width,height,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: size,
            height: size,
            transform: `translate(-50%, -50%) scale(${down ? 0.85 : 1})`,
            background: labelled ? "var(--accent-1)" : "transparent",
            color: "var(--bg)",
            boxShadow: labelled ? "0 0 30px -4px var(--glow)" : "inset 0 0 0 1px color-mix(in srgb, var(--accent-1) 70%, transparent)",
          }}
        >
          {labelled ? mode : null}
        </div>
      </motion.div>
      <motion.div className="absolute left-0 top-0" style={{ x, y }}>
        <div
          className="size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-1 transition-opacity"
          style={{ opacity: labelled ? 0 : 1, boxShadow: "0 0 8px var(--glow)" }}
        />
      </motion.div>
    </div>
  );
}
