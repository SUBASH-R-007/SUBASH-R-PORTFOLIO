import type { Transition, Variants } from "motion/react";

/** Fast in, soft out. */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const transition = (duration = 0.6, delay = 0): Transition => ({ duration, delay, ease: EASE });

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: transition(0.7) },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: transition(0.5) },
};

export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

/** Shared viewport settings for whileInView reveals. */
export const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;
