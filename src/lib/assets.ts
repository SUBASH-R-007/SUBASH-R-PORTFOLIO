import manifest from "@/content/asset-manifest.json";

export interface AssetInfo {
  src: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
}

const files = manifest.files as Record<string, AssetInfo>;
const series = manifest.series as Record<string, string[]>;

/** Resolved file for a referenced public path, or null when it hasn't been added yet. */
export function getAsset(path: string | undefined): AssetInfo | null {
  if (!path) return null;
  return files[path] ?? null;
}

export const hasAsset = (path: string | undefined) => getAsset(path) !== null;

/**
 * Numbered image series (gallery-01.jpg, inovx-01.jpg …). Returns every file on
 * disk for the series, including extras beyond those listed in site.ts.
 */
export function getSeries(expected: string[]): AssetInfo[] {
  if (!expected.length) return [];
  const first = expected[0];
  const dir = first.slice(0, first.lastIndexOf("/"));
  const name = first.slice(first.lastIndexOf("/") + 1).replace(/-\d+\.[a-z0-9]+$/i, "");
  const paths = series[`${dir}/${name}`] ?? [];
  return paths.map((p) => files[p]).filter(Boolean);
}
