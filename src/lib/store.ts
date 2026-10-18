"use client";

import { useSyncExternalStore } from "react";
import { safeStorage } from "./hooks";

/** Minimal global UI store (theme, sound, overdrive, palette, boot, toasts). */
export interface UIState {
  theme: "dark" | "light";
  sound: boolean;
  overdrive: boolean;
  paletteOpen: boolean;
  /** Boot sequence finished (or skipped). Hero choreography waits for this. */
  booted: boolean;
  /** Projects grid skill filter, set from the Neural Map. */
  skillFilter: string | null;
  toasts: { id: number; message: string; tone: "info" | "success" | "accent" }[];
}

const SERVER: UIState = {
  theme: "dark",
  sound: false,
  overdrive: false,
  paletteOpen: false,
  booted: false,
  skillFilter: null,
  toasts: [],
};

let state: UIState | null = null;
const listeners = new Set<() => void>();

function init(): UIState {
  const html = document.documentElement;
  return {
    ...SERVER,
    theme: html.dataset.theme === "light" ? "light" : "dark",
    booted: html.dataset.boot !== "pending",
  };
}

export function getUI(): UIState {
  if (!state) state = init();
  return state;
}

export function setUI(patch: Partial<UIState>) {
  state = { ...getUI(), ...patch };
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useUI<T>(selector: (s: UIState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getUI()),
    () => selector(SERVER),
  );
}

/* ───────── actions ───────── */

export function setTheme(theme: "dark" | "light") {
  document.documentElement.dataset.theme = theme;
  safeStorage("local").set("sr-theme", theme);
  setUI({ theme });
}
export const toggleTheme = () => setTheme(getUI().theme === "dark" ? "light" : "dark");
export const toggleSound = () => setUI({ sound: !getUI().sound });

let toastId = 0;
export function toast(message: string, tone: UIState["toasts"][number]["tone"] = "info", ms = 2800) {
  const id = ++toastId;
  setUI({ toasts: [...getUI().toasts, { id, message, tone }] });
  window.setTimeout(() => setUI({ toasts: getUI().toasts.filter((t) => t.id !== id) }), ms);
}

let overdriveTimer = 0;
export function triggerOverdrive(message: string) {
  window.clearTimeout(overdriveTimer);
  document.documentElement.dataset.overdrive = "true";
  setUI({ overdrive: true });
  toast(message, "accent", 3000);
  overdriveTimer = window.setTimeout(() => {
    delete document.documentElement.dataset.overdrive;
    setUI({ overdrive: false });
  }, 3000);
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
