"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Sparkles, Zap } from "lucide-react";
import { useUI } from "@/lib/store";
import { EASE } from "@/lib/motion";

const ICON = { info: Sparkles, success: Check, accent: Zap } as const;

export function Toaster() {
  const toasts = useUI((s) => s.toasts);
  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-5 z-[90] flex flex-col items-center gap-2 px-4"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = ICON[t.tone];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="glass brackets flex items-center gap-3 px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-fg"
              style={{ boxShadow: "0 10px 40px -10px var(--glow)" }}
            >
              <Icon aria-hidden className="size-4" style={{ color: t.tone === "accent" ? "var(--accent-3)" : "var(--accent-1)" }} />
              {t.message}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
