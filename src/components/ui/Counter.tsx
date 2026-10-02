"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";
import { formatNumber } from "@/lib/content";
import { useReducedMotion } from "@/lib/hooks";

interface Props {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  grouped?: boolean;
  duration?: number;
  /** Delay start until this becomes true (e.g. after the boot sequence). */
  ready?: boolean;
  className?: string;
}

/** Counts up from zero when scrolled into view. Server-renders the final value. */
export function Counter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  grouped = false,
  duration = 1.6,
  ready = true,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion();
  const done = useRef(false);
  const final = `${prefix}${formatNumber(value, decimals, grouped)}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || done.current || reduced) return;
    if (!inView || !ready) {
      el.textContent = `${prefix}${formatNumber(0, decimals, grouped)}${suffix}`;
      return;
    }
    done.current = true;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = `${prefix}${formatNumber(v, decimals, grouped)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, ready, reduced, value, decimals, prefix, suffix, grouped, duration]);

  return (
    <span ref={ref} className={className} aria-label={final} suppressHydrationWarning>
      {final}
    </span>
  );
}
