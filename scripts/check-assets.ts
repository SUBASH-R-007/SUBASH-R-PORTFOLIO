/**
 * Asset check — run with `npm run assets:check` (also runs before dev and build).
 *
 * Walks every public path referenced in src/content/site.ts, checks which
 * files exist in /public, and writes src/content/asset-manifest.json. Components
 * read that manifest to decide between the real image and a placeholder.
 *
 * - Never fails the build: missing files are only reported.
 * - Image paths also match the same name with another extension
 *   (cover.jpg → cover.png / .webp / .jpeg / .avif).
 * - Numbered series (gallery-01.jpg, inovx-01.jpg …) pick up any extra files
 *   you add beyond the ones listed in site.ts.
 */
import { existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { site } from "../src/content/site";

const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const OUT = path.join(ROOT, "src", "content", "asset-manifest.json");

const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".avif"];
const ASSET_PREFIXES = ["/images/", "/certificates/", "/resume/"];

type FileEntry = { src: string; width?: number; height?: number; blurDataURL?: string };
type Manifest = { files: Record<string, FileEntry>; series: Record<string, string[]>; missing: string[] };

function collectPaths(value: unknown, out: Set<string>) {
  if (typeof value === "string") {
    if (ASSET_PREFIXES.some((p) => value.startsWith(p))) out.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectPaths(v, out));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((v) => collectPaths(v, out));
  }
}

const toDisk = (publicPath: string) => path.join(PUBLIC, ...publicPath.split("/").filter(Boolean));
const isImage = (p: string) => IMAGE_EXT.includes(path.extname(p).toLowerCase());

/** Find the file on disk, allowing another image extension for image paths. */
function resolveExisting(publicPath: string): string | null {
  if (existsSync(toDisk(publicPath)) && statSync(toDisk(publicPath)).isFile()) return publicPath;
  if (!isImage(publicPath)) return null;
  const base = publicPath.slice(0, -path.extname(publicPath).length);
  for (const ext of IMAGE_EXT) {
    for (const candidate of [base + ext, base + ext.toUpperCase()]) {
      if (existsSync(toDisk(candidate))) return candidate;
    }
  }
  return null;
}

/** "/images/x/gallery-01.jpg" → { dir: "/images/x", prefix: "gallery" } */
function seriesOf(publicPath: string) {
  const name = path.posix.basename(publicPath);
  const match = name.match(/^(.*)-\d+\.[a-z0-9]+$/i);
  if (!match) return null;
  return { dir: path.posix.dirname(publicPath), prefix: match[1] };
}

type Sharp = (input: string) => {
  metadata(): Promise<{ width?: number; height?: number }>;
  resize(w: number): { webp(o: { quality: number }): { toBuffer(): Promise<Buffer> } };
};

async function loadSharp(): Promise<Sharp | null> {
  try {
    const mod = (await import("sharp")) as unknown as { default: Sharp };
    return mod.default;
  } catch {
    return null;
  }
}

async function describe(src: string, sharp: Sharp | null): Promise<FileEntry> {
  const entry: FileEntry = { src };
  if (!sharp || !isImage(src)) return entry;
  try {
    const file = toDisk(src);
    const meta = await sharp(file).metadata();
    entry.width = meta.width;
    entry.height = meta.height;
    const tiny = await sharp(file).resize(16).webp({ quality: 40 }).toBuffer();
    entry.blurDataURL = `data:image/webp;base64,${tiny.toString("base64")}`;
  } catch {
    // Unreadable image: keep the path, skip metadata.
  }
  return entry;
}

async function main() {
  const referenced = new Set<string>();
  collectPaths(site, referenced);

  const sharp = await loadSharp();
  const manifest: Manifest = { files: {}, series: {}, missing: [] };

  for (const ref of [...referenced].sort()) {
    const found = resolveExisting(ref);
    if (found) manifest.files[ref] = await describe(found, sharp);
  }

  // Numbered series: include every matching file on disk, not just listed ones.
  const seriesKeys = new Set<string>();
  for (const ref of referenced) {
    const s = seriesOf(ref);
    if (s) seriesKeys.add(`${s.dir}|${s.prefix}`);
  }
  for (const key of [...seriesKeys].sort()) {
    const [dir, prefix] = key.split("|");
    const diskDir = toDisk(dir);
    const files = existsSync(diskDir)
      ? readdirSync(diskDir)
          .filter((f) => f.toLowerCase().startsWith(`${prefix.toLowerCase()}-`) && isImage(f))
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      : [];
    const paths = files.map((f) => `${dir}/${f}`);
    manifest.series[`${dir}/${prefix}`] = paths;
    for (const p of paths) if (!manifest.files[p]) manifest.files[p] = await describe(p, sharp);
  }

  // A listed series file that is missing is fine as long as the series has other files.
  for (const ref of [...referenced].sort()) {
    if (manifest.files[ref]) continue;
    const s = seriesOf(ref);
    if (s && (manifest.series[`${s.dir}/${s.prefix}`]?.length ?? 0) > 0) continue;
    manifest.missing.push(ref);
  }

  // Certificates: one of image/pdf is enough.
  const certMissing = new Set<string>();
  for (const c of site.certifications) {
    if (!manifest.files[c.image] && !manifest.files[c.pdf]) certMissing.add(c.id);
  }
  manifest.missing = manifest.missing.filter((m) => {
    const cert = site.certifications.find((c) => c.image === m || c.pdf === m);
    if (!cert) return true;
    if (!certMissing.has(cert.id)) return false;
    return m === cert.image; // report once per certificate
  });

  // Optional slots are not reported as missing.
  const optional = new Set<string>([
    site.identity.portraitSecondary,
    ...site.projects.flatMap((p) => (p.video ? [p.video] : [])),
  ]);
  manifest.missing = manifest.missing.filter((m) => !optional.has(m));

  writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n");

  const found = Object.keys(manifest.files).length;
  console.log(`\n◢ ASSET CHECK — ${found} found, ${manifest.missing.length} missing${sharp ? "" : " (sharp unavailable: no blur placeholders)"}`);
  if (manifest.missing.length) {
    const labels = manifest.missing.map((m) =>
      site.certifications.some((c) => c.image === m) ? m.replace(/\.jpg$/, ".(jpg|pdf)") : m,
    );
    const width = Math.max(...labels.map((l) => l.length), 12);
    console.log(`  ┌${"─".repeat(width + 2)}┐`);
    for (const label of labels) console.log(`  │ ${label.padEnd(width)} │`);
    console.log(`  └${"─".repeat(width + 2)}┘`);
    console.log("  Missing files render a placeholder. See public/README.md.\n");
  }
}

main().catch((err) => {
  // Never block a build on asset reporting.
  console.warn("asset check skipped:", err);
});
