import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** "SR" monogram favicon. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#05070D",
          borderRadius: 14,
          border: "3px solid #22D3EE",
          color: "#E6EDF7",
          fontSize: 30,
          fontWeight: 800,
          fontFamily: "monospace",
          letterSpacing: -1,
        }}
      >
        {site.identity.monogram}
      </div>
    ),
    size,
  );
}
