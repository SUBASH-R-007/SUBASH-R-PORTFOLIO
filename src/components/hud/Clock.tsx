"use client";

import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  const id = window.setInterval(cb, 1000);
  return () => window.clearInterval(id);
}
const now = () => Math.floor(Date.now() / 1000);

const fmt = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "Asia/Kolkata",
});

/** Live IST clock. Renders a stable placeholder on the server. */
export function Clock({ seconds = true, className }: { seconds?: boolean; className?: string }) {
  const t = useSyncExternalStore(subscribe, now, () => null);
  const text = t === null ? "--:--" + (seconds ? ":--" : "") : fmt.format(t * 1000).slice(0, seconds ? 8 : 5);
  return (
    <time className={`tabular-nums ${className ?? ""}`} suppressHydrationWarning>
      {text}
    </time>
  );
}
