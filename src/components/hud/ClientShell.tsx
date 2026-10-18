"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { ui } from "@/content/site";
import { blip } from "@/lib/sound";
import { getUI, setUI, triggerOverdrive, useUI } from "@/lib/store";
import { Cursor } from "./Cursor";
import { SmoothScroll } from "./SmoothScroll";

const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
const WORD = "neural";

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

/** Keyboard shortcuts: Ctrl/⌘+K palette, plus the "neural" / Konami easter egg. */
function useGlobalKeys() {
  const keys = useRef<string[]>([]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setUI({ paletteOpen: !getUI().paletteOpen });
        return;
      }
      if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      keys.current = [...keys.current, e.key.toLowerCase()].slice(-KONAMI.length);
      const seq = keys.current;
      const typed = seq.slice(-WORD.length).join("");
      const konami = seq.length === KONAMI.length && seq.every((k, i) => k === KONAMI[i]);
      if (typed === WORD || konami) {
        keys.current = [];
        triggerOverdrive(ui.overdrive);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

/** Soft UI blips on hover/click when sound is switched on. */
function useSoundFX() {
  useEffect(() => {
    let last = 0;
    const over = (e: PointerEvent) => {
      if (!getUI().sound || e.pointerType !== "mouse") return;
      const t = (e.target as Element | null)?.closest("a, button");
      const from = (e.relatedTarget as Element | null)?.closest?.("a, button");
      if (!t || t === from) return;
      const now = performance.now();
      if (now - last < 70) return;
      last = now;
      blip(1320, 0.03, 0.012);
    };
    const click = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest("a, button")) blip(520, 0.07, 0.03);
    };
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("click", click);
    return () => {
      window.removeEventListener("pointerover", over);
      window.removeEventListener("click", click);
    };
  }, []);
}

/** Client-only global behaviours mounted once in the root layout. */
export function ClientShell() {
  const paletteOpen = useUI((s) => s.paletteOpen);
  useGlobalKeys();
  useSoundFX();

  return (
    <>
      <SmoothScroll />
      <Cursor />
      {paletteOpen && <CommandPalette />}
    </>
  );
}
