import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = site.seo.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** HUD-style Open Graph card, generated at build time. */
export default function OpengraphImage() {
  const { identity, stats } = site;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "radial-gradient(circle at 80% 20%, rgba(139,92,246,0.35), transparent 50%), radial-gradient(circle at 15% 90%, rgba(34,211,238,0.25), transparent 50%), #05070D",
          color: "#E6EDF7",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 6, color: "#8A97B0" }}>
          <span style={{ color: "#22D3EE" }}>SR // NEURAL INTERFACE</span>
          <span>STATUS: ONLINE</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 132, fontWeight: 800, letterSpacing: -4, lineHeight: 1, fontFamily: "sans-serif", color: "#E6EDF7" }}>
            {identity.name.toUpperCase()}
          </div>
          <div style={{ marginTop: 24, fontSize: 34, color: "#22D3EE" }}>{"> " + identity.roles.join(" · ")}</div>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {stats.slice(0, 4).map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "16px 24px",
                border: "1px solid rgba(34,211,238,0.4)",
                borderRadius: 14,
                background: "rgba(15,23,42,0.6)",
              }}
            >
              <span style={{ fontSize: 16, letterSpacing: 4, color: "#8A97B0" }}>{s.label.toUpperCase()}</span>
              <span style={{ fontSize: 40, color: "#A3E635", marginTop: 6 }}>
                {(s.prefix ?? "") + s.value.toFixed(s.decimals ?? 0) + (s.suffix ?? "")}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
