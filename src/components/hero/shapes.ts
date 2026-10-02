/** Point-cloud targets for the hero neural field. All shapes have the same point count. */

/** Deterministic PRNG so shapes are identical on every load. */
export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type ShapeName = "sphere" | "brain" | "helix" | "torus";
export const SHAPES: ShapeName[] = ["sphere", "brain", "helix", "torus"];

export function buildShape(name: ShapeName, n: number, seed = 7): Float32Array {
  const rand = mulberry32(seed + name.length * 101);
  const out = new Float32Array(n * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < n; i++) {
    let x = 0,
      y = 0,
      z = 0;
    if (name === "sphere") {
      // Fibonacci sphere with a slightly thick shell.
      const yy = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - yy * yy);
      const th = golden * i;
      const R = 2.1 + (rand() - 0.5) * 0.18;
      x = Math.cos(th) * r * R;
      y = yy * R;
      z = Math.sin(th) * r * R;
    } else if (name === "brain") {
      // Two folded hemispheres plus a small cerebellum.
      const cere = rand() < 0.1;
      const u = rand() * Math.PI * 2;
      const v = Math.acos(2 * rand() - 1);
      const folds = 1 + 0.09 * Math.sin(9 * u) * Math.sin(7 * v) + 0.05 * Math.sin(17 * v + u * 3);
      if (cere) {
        const R = 0.62 * folds;
        x = Math.sin(v) * Math.cos(u) * R * 1.3;
        y = Math.cos(v) * R * 0.7 - 1.05;
        z = Math.sin(v) * Math.sin(u) * R - 1.0;
      } else {
        const side = i % 2 === 0 ? 1 : -1;
        const sx = Math.abs(Math.sin(v) * Math.cos(u));
        x = side * (0.1 + sx * 1.05 * folds);
        y = Math.cos(v) * 1.25 * folds + 0.15;
        z = Math.sin(v) * Math.sin(u) * 1.75 * folds;
      }
      const s = 1.12 + (rand() - 0.5) * 0.04;
      x *= s;
      y *= s;
      z *= s;
    } else if (name === "helix") {
      const t = rand();
      const yPos = (t - 0.5) * 5.4;
      const ang = t * Math.PI * 6;
      const R = 1.05;
      if (rand() < 0.72) {
        const strand = i % 2 === 0 ? 0 : Math.PI;
        x = Math.cos(ang + strand) * R + (rand() - 0.5) * 0.14;
        z = Math.sin(ang + strand) * R + (rand() - 0.5) * 0.14;
        y = yPos + (rand() - 0.5) * 0.08;
      } else {
        // Base-pair rungs at discrete steps.
        const step = Math.round(t * 36) / 36;
        const a = step * Math.PI * 6;
        const k = rand() * 2 - 1;
        x = Math.cos(a) * R * k;
        z = Math.sin(a) * R * k;
        y = (step - 0.5) * 5.4 + (rand() - 0.5) * 0.04;
      }
      // Tilt the helix slightly for depth.
      const tilt = 0.35;
      const ny = y * Math.cos(tilt) - x * Math.sin(tilt);
      const nx = y * Math.sin(tilt) + x * Math.cos(tilt);
      x = nx;
      y = ny;
    } else {
      // Torus ring with a faint scatter halo (cloud).
      const u = rand() * Math.PI * 2;
      const v = rand() * Math.PI * 2;
      const halo = rand() < 0.15;
      const R = 1.85;
      const r = halo ? 0.45 + rand() * 0.9 : 0.42 + (rand() - 0.5) * 0.08;
      x = (R + r * Math.cos(v)) * Math.cos(u);
      z = (R + r * Math.cos(v)) * Math.sin(u);
      y = r * Math.sin(v) * (halo ? 0.6 : 1);
      // Tip the ring toward the camera.
      const tip = 1.05;
      const ny = y * Math.cos(tip) - z * Math.sin(tip);
      const nz = y * Math.sin(tip) + z * Math.cos(tip);
      y = ny;
      z = nz;
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

/** Nearest-neighbour pairs among the first `nodes` points: the visible "synapses". */
export function buildLinks(pos: Float32Array, nodes: number, maxDist: number, perNode = 2): Uint16Array {
  const pairs: number[] = [];
  const md2 = maxDist * maxDist;
  for (let i = 0; i < nodes; i++) {
    const best: [number, number][] = [];
    for (let j = 0; j < nodes; j++) {
      if (i === j) continue;
      const dx = pos[i * 3] - pos[j * 3];
      const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
      const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > md2) continue;
      if (best.length < perNode) best.push([d2, j]);
      else {
        let worst = 0;
        for (let k = 1; k < best.length; k++) if (best[k][0] > best[worst][0]) worst = k;
        if (d2 < best[worst][0]) best[worst] = [d2, j];
      }
    }
    for (const [, j] of best) if (i < j) pairs.push(i, j);
  }
  return Uint16Array.from(pairs);
}
