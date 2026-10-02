"use client";

import { useInView } from "motion/react";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&<>/\\=+*";

interface Props {
  text: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  className?: string;
  /** ms for the full decrypt. */
  duration?: number;
  delay?: number;
  /** Start only when true (e.g. after boot). */
  ready?: boolean;
  /** Re-run every time `text` changes (used by the rotating roles). */
  replay?: boolean;
}

/**
 * Decrypt/scramble reveal. The final text is server-rendered and exposed to
 * assistive tech via aria-label; the scramble only touches the visual layer.
 */
export function ScrambleText({
  text,
  as = "span",
  className,
  duration = 900,
  delay = 0,
  ready = true,
  replay = false,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const reduced = useReducedMotion();
  const played = useRef<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !inView || !ready) return;
    if (played.current === text || (!replay && played.current !== null)) return;
    played.current = text;

    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now + delay;
      const t = Math.max(0, now - start) / duration;
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const reveal = i / text.length;
        if (ch === " " || t >= reveal + 0.25) out += ch;
        else if (t >= reveal * 0.6) out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        else out += " ";
      }
      el.textContent = out;
      if (t < 1.25) raf = requestAnimationFrame(tick);
      else el.textContent = text;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.textContent = text;
    };
  }, [text, inView, ready, reduced, duration, delay, replay]);

  // The tag only changes the element name; typing it as span keeps the ref simple.
  const Tag = as as "span";
  return (
    <Tag ref={ref} className={className} aria-label={text} suppressHydrationWarning>
      {text}
    </Tag>
  );
}
