"use client";

import { useRef, type ReactNode } from "react";
import { useIsTouch, useReducedMotion } from "@/lib/hooks";

interface Props {
  children: ReactNode;
  className?: string;
  max?: number;
}

/**
 * 3D perspective tilt toward the pointer, with a glare highlight and a border
 * glow that tracks the pointer. Driven by CSS variables (no re-renders).
 */
export function TiltCard({ children, className = "", max = 8 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();
  const reduced = useReducedMotion();
  const disabled = isTouch || reduced;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || disabled) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - py) * max}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * max}deg`);
    el.style.setProperty("--px", `${px * 100}%`);
    el.style.setProperty("--py", `${py * 100}%`);
    el.style.setProperty("--glare", "1");
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--glare", "0");
  };

  return (
    <div className="[perspective:1000px]">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={`group/tilt relative h-full transition-transform duration-300 ease-out [transform-style:preserve-3d] ${className}`}
        style={{ transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))" }}
      >
        {children}
        {/* pointer-following border glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: "var(--glare, 0)",
            padding: 1,
            background:
              "radial-gradient(240px circle at var(--px, 50%) var(--py, 50%), var(--accent-1), transparent 60%)",
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
        {/* glare */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay transition-opacity duration-300"
          style={{
            opacity: "calc(var(--glare, 0) * 0.6)",
            background: "radial-gradient(400px circle at var(--px, 50%) var(--py, 50%), rgba(255,255,255,0.35), transparent 50%)",
          }}
        />
      </div>
    </div>
  );
}
