import { ArrowUp } from "lucide-react";
import { site, ui } from "@/content/site";
import { Clock } from "@/components/hud/Clock";
import { LogoMark } from "@/components/hud/LogoMark";
import { SectionLink } from "@/components/hud/NavLink";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 border-t border-line">
      <div className="container-hud flex flex-col items-center gap-6 py-10 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <LogoMark size={32} />
          <p className="font-mono text-xs text-fg-muted">
            {ui.footer.credit} <span className="text-fg-muted/60">·</span> © {year}
          </p>
        </div>
        <p className="hud-label flex items-center gap-2">
          <span style={{ color: "var(--accent-1)" }}>{ui.footer.time}</span>
          <Clock className="text-fg" /> {site.identity.timezoneLabel}
          <span className="text-fg-muted/60">·</span> {site.identity.location}
        </p>
        <SectionLink
          id="top"
          aria-label={ui.footer.backToTop}
          className="group relative grid size-14 place-items-center rounded-full text-fg-muted transition-colors hover:text-accent-1"
        >
          <svg viewBox="0 0 56 56" className="absolute inset-0 size-full animate-[spin-slow_14s_linear_infinite]" aria-hidden>
            <circle cx="28" cy="28" r="26" fill="none" stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="3 5" />
            <circle cx="28" cy="2" r="2" fill="var(--accent-1)" />
          </svg>
          <ArrowUp className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden />
        </SectionLink>
      </div>
    </footer>
  );
}
