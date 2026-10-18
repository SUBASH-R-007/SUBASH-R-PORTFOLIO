import { site } from "@/content/site";

/** "SR" monogram inside a bracketed hex frame. Original mark, no third-party art. */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <span className="relative inline-grid place-items-center" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 40 40" className="absolute inset-0 size-full" fill="none">
        <defs>
          <linearGradient id="lm-g" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0" stopColor="var(--accent-1)" />
            <stop offset="1" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
        <path d="M20 2.5 35.2 11.25v17.5L20 37.5 4.8 28.75v-17.5Z" stroke="url(#lm-g)" strokeWidth="1.5" />
        <path d="M20 7 31 13.3v13.4L20 33 9 26.7V13.3Z" fill="color-mix(in srgb, var(--accent-1) 10%, transparent)" />
      </svg>
      <span className="relative font-mono text-[11px] font-bold tracking-tight text-fg">{site.identity.monogram}</span>
    </span>
  );
}
