"use client";

import { useEffect } from "react";
import { loadGsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import { setLenis } from "@/lib/scroll";

/** Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    // Loaded after hydration so neither library is in the initial bundle.
    void Promise.all([import("lenis"), loadGsap()]).then(([{ default: Lenis }, { gsap, ScrollTrigger }]) => {
      if (cancelled) return;
      const lenis = new Lenis({
        lerp: 0.1,
        autoRaf: false,
        anchors: { offset: -72 },
        stopInertiaOnNavigate: true,
        allowNestedScroll: true,
      });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      // Keep pins/scrubs accurate when page height changes (images loading, lazy sections rendering).
      let timer = 0;
      let lastHeight = document.body.scrollHeight;
      const ro = new ResizeObserver(() => {
        const h = document.body.scrollHeight;
        if (Math.abs(h - lastHeight) < 2) return;
        lastHeight = h;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
      });
      ro.observe(document.body);
      cleanup = () => {
        ro.disconnect();
        window.clearTimeout(timer);
        gsap.ticker.remove(raf);
        lenis.destroy();
        setLenis(null);
      };
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [reduced]);

  return null;
}
