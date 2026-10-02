"use client";

import { SmoothScroll } from "./SmoothScroll";

/** Client-only global behaviours mounted once in the root layout. */
export function ClientShell() {
  return (
    <>
      <SmoothScroll />
    </>
  );
}
