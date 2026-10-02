"use client";

import { AnimatePresence, motion } from "motion/react";
import { Command, Menu, Moon, Sun, Volume2, VolumeX, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site, ui } from "@/content/site";
import { sectionById } from "@/lib/content";
import { EASE } from "@/lib/motion";
import { lockScroll } from "@/lib/scroll";
import { setUI, toggleSound, toggleTheme, useUI } from "@/lib/store";
import { useActiveSection } from "@/lib/useActiveSection";
import { Clock } from "./Clock";
import { LogoMark } from "./LogoMark";
import { SectionLink } from "./NavLink";

const LINKS = ui.nav.links.map((id) => sectionById(id));

export function Nav() {
  const [condensed, setCondensed] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const active = useActiveSection(pathname === "/" ? site.sections.map((s) => s.id) : []);
  const theme = useUI((s) => s.theme);
  const sound = useUI((s) => s.sound);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setCondensed(window.scrollY > 120));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3">
      <nav
        aria-label="Primary"
        data-condensed={condensed}
        className="pointer-events-auto flex h-14 w-full items-center gap-3 rounded-full px-3 transition-[max-width,background-color,box-shadow,backdrop-filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-4"
        style={{
          maxWidth: condensed ? "60rem" : "80rem",
          background: condensed || open ? "var(--glass-strong)" : "transparent",
          backdropFilter: condensed ? "blur(16px) saturate(140%)" : "none",
          boxShadow: condensed ? "inset 0 0 0 1px var(--line-strong), 0 12px 40px -18px var(--glow)" : "none",
        }}
      >
        <SectionLink id="top" className="flex shrink-0 items-center gap-3 rounded-full" aria-label={`${site.identity.name}, ${ui.nav.home}`}>
          <LogoMark />
          <span
            className={`hud-label hidden transition-opacity duration-300 xl:flex xl:items-center xl:gap-2 ${condensed ? "xl:hidden" : ""}`}
          >
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-3 opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-accent-3" />
            </span>
            {ui.nav.status}
            <span className="text-fg-muted/60">·</span>
            <Clock seconds={false} /> {site.identity.timezoneLabel}
          </span>
        </SectionLink>

        <ul className="mx-auto hidden items-center gap-1 md:flex">
          {LINKS.map((s) => (
            <li key={s.id}>
              <SectionLink
                id={s.id}
                className="relative block rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted transition-colors hover:text-fg aria-[current=true]:text-fg"
                aria-current={active === s.id ? "true" : undefined}
              >
                {active === s.id && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-full"
                    style={{ boxShadow: "inset 0 0 0 1px var(--line-strong)", background: "color-mix(in srgb, var(--accent-1) 10%, transparent)" }}
                    transition={{ duration: 0.5, ease: EASE }}
                  />
                )}
                {s.nav}
              </SectionLink>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <button
            type="button"
            className="icon-btn !flex w-auto gap-2 px-3"
            onClick={() => setUI({ paletteOpen: true })}
            aria-label={ui.nav.palette}
            aria-keyshortcuts="Control+K Meta+K"
          >
            <Command className="size-4" aria-hidden />
            <span className="kbd hidden lg:inline">{ui.palette.hint}</span>
          </button>
          <button type="button" className="icon-btn" onClick={toggleSound} aria-pressed={sound} aria-label={ui.nav.sound}>
            {sound ? <Volume2 className="size-4" aria-hidden /> : <VolumeX className="size-4" aria-hidden />}
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-pressed={theme === "light"}
            aria-label={ui.nav.theme}
          >
            {theme === "light" ? <Moon className="size-4" aria-hidden /> : <Sun className="size-4" aria-hidden />}
          </button>
          <button
            type="button"
            className="icon-btn md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? ui.nav.close : ui.nav.menu}
          >
            {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="pointer-events-auto fixed inset-x-3 top-[4.5rem] bottom-3 overflow-auto rounded-3xl p-6 md:hidden"
            style={{ background: "var(--glass-strong)", backdropFilter: "blur(18px)", boxShadow: "inset 0 0 0 1px var(--line-strong)" }}
            initial={{ opacity: 0, y: -12, clipPath: "inset(0 0 100% 0 round 24px)" }}
            animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0 round 24px)" }}
            exit={{ opacity: 0, y: -8, clipPath: "inset(0 0 100% 0 round 24px)" }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <ul className="flex flex-col gap-1">
              {site.sections.slice(1).map((s, i) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04, duration: 0.4, ease: EASE }}
                >
                  <SectionLink
                    id={s.id}
                    onNavigate={() => setOpen(false)}
                    className="flex items-baseline gap-4 border-b border-line py-3"
                  >
                    <span className="font-mono text-xs text-accent-1">{s.index}</span>
                    <span className="font-display text-2xl text-fg">{s.title}</span>
                    <span className="hud-label ml-auto">{s.code}</span>
                  </SectionLink>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
