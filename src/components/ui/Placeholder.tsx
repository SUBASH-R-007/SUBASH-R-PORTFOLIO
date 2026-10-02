import { Award, FileText, Image as ImageIcon, ScanFace, Shapes } from "lucide-react";
import { ui } from "@/content/site";

export type SlotKind = "portrait" | "logo" | "screenshot" | "certificate" | "photo";

const ICONS = {
  portrait: ScanFace,
  logo: Shapes,
  screenshot: ImageIcon,
  certificate: FileText,
  photo: Award,
} as const;

interface Props {
  kind: SlotKind;
  /** Expected public path, printed in development only. */
  path?: string;
  compact?: boolean;
  className?: string;
}

/** On-theme stand-in for an image that hasn't been added to /public yet. */
export function Placeholder({ kind, path, compact = false, className = "" }: Props) {
  const Icon = ICONS[kind];
  const showPath = process.env.NODE_ENV !== "production" && path;
  return (
    <div
      role="img"
      aria-label={`${kind} image pending`}
      className={`absolute inset-0 overflow-hidden bg-bg-elev ${className}`}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 20% 0%, color-mix(in srgb, var(--accent-2) 22%, transparent), transparent 60%), radial-gradient(90% 80% at 100% 100%, color-mix(in srgb, var(--accent-1) 18%, transparent), transparent 60%)",
        }}
      />
      <div aria-hidden className="noise-anim absolute inset-0 opacity-[0.07]" />
      <div aria-hidden className="scanlines absolute inset-0" />
      <div aria-hidden className="sweep" />
      <div className="relative flex h-full flex-col items-center justify-center gap-2 p-3 text-center">
        <Icon aria-hidden className={compact ? "size-5 text-accent-1/80" : "size-8 text-accent-1/80"} strokeWidth={1.25} />
        {!compact && (
          <span className="hud-label flicker" style={{ color: "var(--accent-1)" }}>
            {ui.placeholder}
          </span>
        )}
        {showPath && !compact && (
          <span className="max-w-full break-all font-mono text-[10px] leading-snug text-fg-muted/80">{path}</span>
        )}
      </div>
    </div>
  );
}
