import { site, ui } from "@/content/site";
import { SmartImage } from "@/components/ui/SmartImage";
import { r2 } from "@/lib/motion";

/** Portrait inside a holographic HUD ring: rotating arcs, tick ring, scanline sweep, brackets. */
export function PortraitFrame() {
  return (
    <div className="brackets relative aspect-square w-full p-[9%]" style={{ ["--l" as string]: "22px" }}>
      {/* Outer rotating rings */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full animate-[spin-slow_40s_linear_infinite]" aria-hidden>
        <circle cx="100" cy="100" r="97" fill="none" stroke="var(--accent-1)" strokeOpacity="0.55" strokeWidth="0.6" strokeDasharray="40 14 4 14" />
        <circle cx="100" cy="3" r="1.6" fill="var(--accent-1)" />
      </svg>
      <svg viewBox="0 0 200 200" className="absolute inset-[4%] size-[92%] animate-[spin-rev_60s_linear_infinite]" aria-hidden>
        {Array.from({ length: 72 }, (_, i) => {
          const a = (i / 72) * Math.PI * 2;
          const long = i % 6 === 0;
          const r1 = long ? 88 : 92;
          return (
            <line
              key={i}
              x1={r2(100 + Math.cos(a) * r1)}
              y1={r2(100 + Math.sin(a) * r1)}
              x2={r2(100 + Math.cos(a) * 96)}
              y2={r2(100 + Math.sin(a) * 96)}
              stroke={long ? "var(--accent-2)" : "var(--line-strong)"}
              strokeWidth={long ? 0.9 : 0.5}
            />
          );
        })}
      </svg>
      <svg viewBox="0 0 200 200" className="absolute inset-[7%] size-[86%] animate-[spin-slow_18s_linear_infinite]" aria-hidden>
        <circle cx="100" cy="100" r="96" fill="none" stroke="var(--accent-2)" strokeOpacity="0.7" strokeWidth="1" strokeDasharray="70 532" strokeLinecap="round" />
        <circle cx="100" cy="100" r="96" fill="none" stroke="var(--accent-1)" strokeOpacity="0.9" strokeWidth="1" strokeDasharray="30 572" strokeDashoffset="-300" strokeLinecap="round" />
      </svg>

      {/* Portrait */}
      <div
        className="relative size-full overflow-hidden rounded-full"
        style={{ boxShadow: "0 0 0 1px var(--line-strong), 0 0 60px -10px var(--glow), inset 0 0 40px -10px var(--glow)" }}
      >
        <SmartImage
          src={site.identity.portrait}
          alt={site.identity.portraitAlt}
          kind="portrait"
          sizes="(min-width: 1024px) 340px, 260px"
          preload
          imgClassName="object-[50%_20%]"
        />
        <div aria-hidden className="scanlines pointer-events-none absolute inset-0 opacity-60" />
        <div aria-hidden className="sweep" />
      </div>

      <span className="hud-label absolute left-0 top-0 -translate-y-6 text-[10px]" style={{ color: "var(--accent-1)" }}>
        {ui.hero.portraitTag}
      </span>
      <span className="hud-label absolute bottom-0 right-0 flex translate-y-6 items-center gap-1.5 text-[10px]">
        <span className="size-1.5 rounded-full bg-accent-3 shadow-[0_0_8px_var(--accent-3)]" />
        {site.identity.monogram} · {site.identity.location}
      </span>
    </div>
  );
}
