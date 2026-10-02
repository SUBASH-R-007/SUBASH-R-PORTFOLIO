"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import type { ReactNode } from "react";
import { useIsTouch, useReducedMotion } from "@/lib/hooks";

/** Pulls its child toward the pointer on hover (fine pointers only). */
export function Magnetic({ children, strength = 0.3, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  const isTouch = useIsTouch();
  const reduced = useReducedMotion();
  const disabled = isTouch || reduced;

  return (
    <motion.div
      className={`inline-flex ${className}`}
      style={disabled ? undefined : { x: sx, y: sy }}
      onPointerMove={(e) => {
        if (disabled) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
