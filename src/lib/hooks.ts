"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

function subscribeMedia(query: string) {
  return (cb: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", cb);
    return () => mql.removeEventListener("change", cb);
  };
}

/** SSR-safe media query. Returns `serverValue` during server render and hydration. */
export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    subscribeMedia(query),
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

/** True on touch-first devices (no hover, coarse pointer). */
export const useIsTouch = () => useMediaQuery("(hover: none), (pointer: coarse)");

export const useIsDesktop = () => useMediaQuery("(min-width: 768px)");

const noopSubscribe = () => () => {};
/** False on the server and during hydration, true afterwards. */
export const useMounted = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

/** Fires once when the element first comes within `rootMargin` of the viewport. */
export function useNearViewport<T extends Element>(rootMargin = "400px") {
  const ref = useRef<T | null>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, rootMargin]);
  return [ref, near] as const;
}

export function safeStorage(kind: "local" | "session") {
  return {
    get(key: string): string | null {
      try {
        return (kind === "local" ? window.localStorage : window.sessionStorage).getItem(key);
      } catch {
        return null;
      }
    },
    set(key: string, value: string) {
      try {
        (kind === "local" ? window.localStorage : window.sessionStorage).setItem(key, value);
      } catch {
        /* storage unavailable (private mode, blocked) */
      }
    },
  };
}
