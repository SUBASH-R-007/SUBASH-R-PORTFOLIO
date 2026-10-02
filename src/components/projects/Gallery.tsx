"use client";

import { Expand } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ui } from "@/content/site";
import type { Project } from "@/content/types";
import { Lightbox, type LightboxItem } from "@/components/ui/Lightbox";
import { Placeholder } from "@/components/ui/Placeholder";
import { getSeries } from "@/lib/assets";

/** Case-study gallery: real images when present, otherwise the expected slots as placeholders. */
export function Gallery({ project }: { project: Project }) {
  const [open, setOpen] = useState<number | null>(null);
  const real = getSeries(project.gallery);
  const items: LightboxItem[] = real.length
    ? real.map((a, i) => ({ kind: "image", src: a.src, alt: `${project.title}, image ${i + 1}`, title: `${project.title} ${i + 1}`, blurDataURL: a.blurDataURL }))
    : project.gallery.map((path, i) => ({ kind: "pending", slot: "screenshot", path, title: `${project.title} ${i + 1}` }));

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <li key={i} className={i === 0 && items.length > 2 ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : ""}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="glass group relative block aspect-[16/10] size-full overflow-hidden"
              aria-label={`${ui.caseStudy.open} ${item.title}`}
              data-cursor="view"
            >
              {item.kind === "image" ? (
                <Image src={item.src} alt={item.alt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" placeholder={item.blurDataURL ? "blur" : "empty"} blurDataURL={item.blurDataURL} />
              ) : item.kind === "pending" ? (
                <Placeholder kind="screenshot" path={item.path} />
              ) : null}
              <span className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-bg/70 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Expand className="size-4 text-fg" aria-hidden />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Lightbox items={items} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </>
  );
}
