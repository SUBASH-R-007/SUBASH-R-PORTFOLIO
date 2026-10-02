"use client";

import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck, ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ui } from "@/content/site";
import { useMounted } from "@/lib/hooks";
import { EASE } from "@/lib/motion";
import { lockScroll } from "@/lib/scroll";
import { Placeholder, type SlotKind } from "./Placeholder";

export type LightboxItem = {
  title: string;
  caption?: string;
  verifyUrl?: string;
} & (
  | { kind: "image"; src: string; alt: string; blurDataURL?: string }
  | { kind: "pdf"; src: string }
  | { kind: "pending"; slot: SlotKind; path?: string }
);

interface Props {
  items: LightboxItem[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}

/** Keyboard-navigable, swipeable lightbox for images, PDFs and pending slots. */
export function Lightbox({ items, index, onClose, onIndex }: Props) {
  const mounted = useMounted();
  const open = index !== null;
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);
  const [dir, setDir] = useState(0);
  const touch = useRef<number | null>(null);

  const go = useCallback(
    (d: number) => {
      if (index === null || items.length < 2) return;
      setDir(d);
      onIndex((index + d + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    lockScroll(true);
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab") {
        // Keep focus inside the dialog.
        const dialog = closeBtn.current?.closest("[role=dialog]");
        const focusable = dialog?.querySelectorAll<HTMLElement>("button, a[href], iframe");
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lockScroll(false);
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose, go]);

  if (!mounted) return null;
  const item = index !== null ? items[index] : null;

  return createPortal(
    <AnimatePresence>
      {item && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          className="fixed inset-0 z-[95] flex flex-col bg-bg/90 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          data-lenis-prevent
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <div className="flex items-center justify-between gap-4 p-4 sm:px-6">
            <p className="hud-label truncate">
              {index! + 1} / {items.length} <span className="text-fg-muted">{"//"}</span> {item.title}
            </p>
            <button ref={closeBtn} type="button" onClick={onClose} className="icon-btn shrink-0" aria-label={ui.certifications.close}>
              <X className="size-4" aria-hidden />
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touch.current === null) return;
              const dx = e.changedTouches[0].clientX - touch.current;
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
              touch.current = null;
            }}
          >
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={index}
                custom={dir}
                initial={{ opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="glass brackets relative h-full max-h-[78vh] w-full max-w-5xl overflow-hidden"
              >
                {item.kind === "image" && (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1024px) 1024px, 100vw"
                    className="object-contain"
                    placeholder={item.blurDataURL ? "blur" : "empty"}
                    blurDataURL={item.blurDataURL}
                  />
                )}
                {item.kind === "pdf" && <iframe src={`${item.src}#view=FitH`} title={item.title} className="size-full bg-white" />}
                {item.kind === "pending" && <Placeholder kind={item.slot} path={item.path} />}
              </motion.div>
            </AnimatePresence>

            {items.length > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} className="icon-btn absolute left-2 top-1/2 hidden -translate-y-1/2 bg-bg/60 sm:grid" aria-label={ui.certifications.prev}>
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <button type="button" onClick={() => go(1)} className="icon-btn absolute right-2 top-1/2 hidden -translate-y-1/2 bg-bg/60 sm:grid" aria-label={ui.certifications.next}>
                  <ChevronRight className="size-5" aria-hidden />
                </button>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 p-4">
            {item.caption && <p className="w-full text-center text-sm text-fg-muted">{item.caption}</p>}
            {item.kind === "pdf" && (
              <a href={item.src} target="_blank" rel="noreferrer" className="btn btn-ghost min-h-0 py-2">
                <ExternalLink className="size-4" aria-hidden />
                {ui.certifications.openPdf}
              </a>
            )}
            {item.verifyUrl && (
              <a href={item.verifyUrl} target="_blank" rel="noreferrer" className="btn btn-primary min-h-0 py-2">
                <BadgeCheck className="size-4" aria-hidden />
                {ui.certifications.verify}
              </a>
            )}
            {items.length > 1 && (
              <div className="flex gap-2 sm:hidden">
                <button type="button" onClick={() => go(-1)} className="icon-btn" aria-label={ui.certifications.prev}>
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <button type="button" onClick={() => go(1)} className="icon-btn" aria-label={ui.certifications.next}>
                  <ChevronRight className="size-5" aria-hidden />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
