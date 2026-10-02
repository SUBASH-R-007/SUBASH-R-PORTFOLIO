"use client";

import { motion } from "motion/react";
import { BadgeCheck, FileText, Maximize2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { site, ui } from "@/content/site";
import type { Certification } from "@/content/types";
import { Lightbox, type LightboxItem } from "@/components/ui/Lightbox";
import { Placeholder } from "@/components/ui/Placeholder";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getAsset } from "@/lib/assets";
import { EASE, VIEWPORT } from "@/lib/motion";

function toItem(c: Certification): LightboxItem {
  const img = getAsset(c.image);
  const pdf = getAsset(c.pdf);
  const base = { title: c.title, caption: `${c.issuer}${c.date ? ` · ${c.date}` : ""}`, verifyUrl: c.verifyUrl };
  if (img) return { ...base, kind: "image", src: img.src, alt: `${c.title} certificate`, blurDataURL: img.blurDataURL };
  if (pdf) return { ...base, kind: "pdf", src: pdf.src };
  return { ...base, kind: "pending", slot: "certificate", path: `${c.image.replace(/\.jpg$/, "")}.(jpg|pdf)` };
}

/** Generated "document" thumbnail for PDF-only certificates. */
function PdfThumb({ c }: { c: Certification }) {
  return (
    <div aria-hidden className="absolute inset-0 grid place-items-center bg-bg-elev">
      <div className="relative h-[78%] w-[58%] rounded-md bg-fg/[0.04] p-3 ring-1 ring-line-strong">
        <FileText className="size-5 text-accent-1" strokeWidth={1.5} />
        <div className="mt-3 space-y-1.5">
          {[90, 70, 80, 55, 65].map((w, i) => (
            <div key={i} className="h-1 rounded-full bg-fg/15" style={{ width: `${w}%` }} />
          ))}
        </div>
        <span className="absolute bottom-2 right-2 rounded bg-accent-1 px-1.5 py-0.5 font-mono text-[9px] font-bold text-bg">PDF</span>
        <span className="absolute bottom-2 left-3 max-w-[60%] truncate font-mono text-[9px] text-fg-muted">{c.issuer}</span>
      </div>
    </div>
  );
}

export function Certifications() {
  const [open, setOpen] = useState<number | null>(null);
  const items = site.certifications.map(toItem);

  return (
    <section id="certifications" className="container-hud scroll-mt-20 py-24 md:py-32">
      <SectionHeader id="certifications" />
      <motion.ul
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        {site.certifications.map((c, i) => {
          const img = getAsset(c.image);
          const pdf = getAsset(c.pdf);
          return (
            <motion.li key={c.id} variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="glass group flex h-full w-full flex-col overflow-hidden text-left transition-shadow hover:shadow-[0_0_40px_-12px_var(--glow)]"
                aria-label={`${ui.certifications.view}: ${c.title}, ${c.issuer}`}
                data-cursor="view"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {img ? (
                    <Image src={img.src} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" placeholder={img.blurDataURL ? "blur" : "empty"} blurDataURL={img.blurDataURL} />
                  ) : pdf ? (
                    <PdfThumb c={c} />
                  ) : (
                    <Placeholder kind="certificate" path={`${c.image.replace(/\.jpg$/, "")}.(jpg|pdf)`} />
                  )}
                  <span className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-bg/70 opacity-0 transition-opacity group-hover:opacity-100">
                    <Maximize2 className="size-3.5 text-fg" aria-hidden />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="hud-label text-[10px]" style={{ color: "var(--accent-1)" }}>
                    {c.issuer}
                  </p>
                  <h3 className="mt-2 font-display text-base font-semibold leading-snug text-fg">{c.title}</h3>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="font-mono text-xs text-fg-muted">{c.date ?? ""}</span>
                    {c.verifyUrl && (
                      <span className="chip text-[10px]">
                        <BadgeCheck className="size-3" aria-hidden />
                        {ui.certifications.verify}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </motion.li>
          );
        })}
      </motion.ul>
      <Lightbox items={items} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </section>
  );
}
