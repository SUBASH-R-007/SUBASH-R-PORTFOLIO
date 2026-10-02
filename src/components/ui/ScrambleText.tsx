"use client";

import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
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
 * Decrypt/scramble reveal. The real text is server-rendered and never replaced
 * (good for SEO, screen readers and LCP); the scramble plays in an aria-hidden
 * overlay while the real text is visually hidden.
 */
export function ScrambleText({ text, as = "span", className, duration = 900, delay = 0, ready = true, replay = false }: Props) {
  const host = useRef<HTMLSpanElement>(null);
  const overlay = useRef<HTMLSpanElement>(null);
  const inView = useInView(host, { once: true, margin: "0px 0px -8% 0px" });
  const reduced = useReducedMotion();
  const played = useRef<string | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (reduced || !inView || !ready) return;
    if (played.current === text || (!replay && played.current !== null)) return;
    played.current = text;

    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) {
        start = now + delay;
        setActive(true);
      }
      const t = Math.max(0, now - start) / duration;
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const reveal = i / text.length;
        if (ch === " " || t >= reveal + 0.25) out += ch;
        else if (t >= reveal * 0.6) out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        else out += " ";
      }
      if (overlay.current) overlay.current.textContent = out;
      if (t < 1.25) raf = requestAnimationFrame(tick);
      else setActive(false);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      setActive(false);
    };
  }, [text, inView, ready, reduced, duration, delay, replay]);

  // The tag only changes the element name; typing it as span keeps the ref simple.
  const Tag = as as "span";
  return (
    <Tag ref={host} className={className} style={{ position: "relative" }}>
      <span style={{ opacity: active ? 0 : 1 }}>{text}</span>
      <span
        ref={overlay}
        aria-hidden
        className="pointer-events-none absolute inset-0 whitespace-nowrap [text-shadow:none]"
        style={{ opacity: active ? 1 : 0 }}
      />
    </Tag>
  );
}
