"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/content/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { getAsset } from "@/lib/assets";
import { useReducedMotion } from "@/lib/hooks";

/**
 * Project cover: the image (or placeholder), upgraded to a muted looping demo
 * clip when `video` exists. The clip plays only while in view.
 */
export function CoverMedia({ project, sizes, preload = false }: { project: Project; sizes: string; preload?: boolean }) {
  const video = getAsset(project.video);
  const cover = getAsset(project.cover);
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) void el.play().catch(() => {});
      else el.pause();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <>
      <SmartImage src={project.cover} alt={`${project.title} cover`} kind="screenshot" sizes={sizes} preload={preload} />
      {video && (
        <video
          ref={ref}
          className="absolute inset-0 size-full object-cover"
          src={video.src}
          poster={cover?.src}
          muted
          loop
          playsInline
          preload="none"
          aria-label={`${project.title} demo`}
        />
      )}
    </>
  );
}
