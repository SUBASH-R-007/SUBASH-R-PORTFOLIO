"use client";

import type Lenis from "lenis";

let lenis: Lenis | null = null;

export const setLenis = (instance: Lenis | null) => {
  lenis = instance;
};
export const getLenis = () => lenis;

const navOffset = () => -(parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 64) - 8;

/**
 * Smooth-scroll to a section id (or "top"), using Lenis when it's running.
 * Returns false when the section isn't on this page.
 */
export function scrollToId(id: string): boolean {
  if (id === "top") {
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  }
  const el = document.getElementById(id);
  if (!el) return false;
  if (lenis) lenis.scrollTo(el, { offset: navOffset() });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
  return true;
}

export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.style.overflow = locked ? "hidden" : "";
}
