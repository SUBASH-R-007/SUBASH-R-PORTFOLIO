import { r2 } from "@/lib/motion";

/** Static/CSS fallback for the 3D field: drifting gradient mesh with orbit rings. */
export function GradientMesh({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="absolute left-1/2 top-1/2 size-[min(90vw,620px)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--accent-1) 45%, transparent), transparent 55%), radial-gradient(circle at 70% 65%, color-mix(in srgb, var(--accent-2) 50%, transparent), transparent 55%)",
          animation: "mesh-shift 12s ease-in-out infinite",
        }}
      />
      <svg viewBox="0 0 400 400" className="absolute left-1/2 top-1/2 size-[min(85vw,560px)] -translate-x-1/2 -translate-y-1/2 opacity-60">
        <defs>
          <radialGradient id="gm-dot">
            <stop offset="0" stopColor="var(--accent-1)" />
            <stop offset="1" stopColor="var(--accent-1)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {[150, 120, 90].map((r, i) => (
          <ellipse
            key={r}
            cx="200"
            cy="200"
            rx={r}
            ry={r * 0.42}
            fill="none"
            stroke={i === 1 ? "var(--accent-2)" : "var(--accent-1)"}
            strokeOpacity="0.35"
            strokeDasharray={i === 0 ? "2 6" : "1 4"}
            transform={`rotate(${-20 + i * 35} 200 200)`}
          />
        ))}
        {Array.from({ length: 28 }, (_, i) => {
          const a = (i / 28) * Math.PI * 2;
          const r = 60 + ((i * 37) % 90);
          return <circle key={i} cx={r2(200 + Math.cos(a) * r)} cy={r2(200 + Math.sin(a) * r * 0.8)} r={1.2 + (i % 3) * 0.6} fill="url(#gm-dot)" />;
        })}
      </svg>
    </div>
  );
}
