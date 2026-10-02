"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useMediaQuery, useMounted, useReducedMotion } from "@/lib/hooks";
import { useUI } from "@/lib/store";
import { GradientMesh } from "./GradientMesh";

const NeuralField = dynamic(() => import("./NeuralField"), { ssr: false });

let webgl: boolean | null = null;
function supportsWebGL() {
  if (webgl !== null) return webgl;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }
  return webgl;
}

function lowPower() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2 || nav.connection?.saveData === true;
}

/**
 * Chooses between the R3F field and the CSS gradient mesh. The 3D bundle is
 * only requested after the boot sequence and an idle frame, so it never
 * competes with first paint.
 */
export function NeuralFieldLoader({ shape }: { shape: number }) {
  const mounted = useMounted();
  const reduced = useReducedMotion();
  const small = useMediaQuery("(max-width: 767px)");
  const booted = useUI((s) => s.booted);
  const theme = useUI((s) => s.theme);
  const overdrive = useUI((s) => s.overdrive);
  const [idle, setIdle] = useState(false);
  const [ready, setReady] = useState(false);

  const capable = mounted && !reduced && supportsWebGL() && !lowPower();

  useEffect(() => {
    if (!capable || !booted) return;
    const hasIdle = "requestIdleCallback" in window;
    const id = hasIdle
      ? window.requestIdleCallback(() => setIdle(true), { timeout: 1500 })
      : window.setTimeout(() => setIdle(true), 300);
    return () => (hasIdle ? window.cancelIdleCallback(id) : window.clearTimeout(id));
  }, [capable, booted]);

  return (
    <div className="absolute inset-0">
      <GradientMesh className={`transition-opacity duration-1000 ${ready ? "opacity-0" : "opacity-100"}`} />
      {capable && idle && (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
          <NeuralField shape={shape} theme={theme} overdrive={overdrive} lite={small} onReady={() => setReady(true)} />
        </div>
      )}
    </div>
  );
}
