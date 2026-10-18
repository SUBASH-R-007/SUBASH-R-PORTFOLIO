"use client";

import type { gsap as GSAP } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

export type GsapModule = { gsap: typeof GSAP; ScrollTrigger: typeof ScrollTriggerType };

let loading: Promise<GsapModule> | null = null;

/**
 * GSAP + ScrollTrigger, loaded on demand after hydration so they stay out of
 * the initial bundle. Every caller shares one registered instance.
 */
export function loadGsap(): Promise<GsapModule> {
  loading ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, st]) => {
    g.gsap.registerPlugin(st.ScrollTrigger);
    g.gsap.defaults({ ease: "expo.out" });
    return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger };
  });
  return loading;
}

/** Run a GSAP setup once loaded; returns a cleanup that also covers "unmounted before load". */
export function withGsap(setup: (m: GsapModule) => (() => void) | void): () => void {
  let cancelled = false;
  let cleanup: (() => void) | void;
  void loadGsap().then((m) => {
    if (!cancelled) cleanup = setup(m);
  });
  return () => {
    cancelled = true;
    cleanup?.();
  };
}
