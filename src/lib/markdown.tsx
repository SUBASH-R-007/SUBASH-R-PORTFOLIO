import type { ReactNode } from "react";

/**
 * Tiny Markdown renderer for optional case-study write-ups in site.ts.
 * Supports #/##/### headings, paragraphs, "- " lists, **bold**, `code` and [links](url).
 */
function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    const k = `${key}-${i++}`;
    if (t.startsWith("**")) out.push(<strong key={k} className="text-fg">{t.slice(2, -2)}</strong>);
    else if (t.startsWith("`")) out.push(<code key={k} className="rounded bg-bg-elev px-1 font-mono text-[0.9em] text-accent-1">{t.slice(1, -1)}</code>);
    else {
      const [, label, href] = t.match(/\[([^\]]+)\]\(([^)]+)\)/)!;
      out.push(<a key={k} href={href} className="text-accent-1 underline underline-offset-4" target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{label}</a>);
    }
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function renderMarkdown(md: string): ReactNode {
  const blocks = md.trim().split(/\n\s*\n/);
  return blocks.map((block, b) => {
    const lines = block.split("\n");
    const key = `md-${b}`;
    if (lines.every((l) => /^\s*[-*] /.test(l))) {
      return (
        <ul key={key} className="list-disc space-y-1.5 pl-5 marker:text-accent-1">
          {lines.map((l, i) => <li key={i}>{inline(l.replace(/^\s*[-*] /, ""), `${key}-${i}`)}</li>)}
        </ul>
      );
    }
    const h = block.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const cls = "font-display font-semibold text-fg " + (h[1].length === 1 ? "text-2xl" : h[1].length === 2 ? "text-xl" : "text-lg");
      return h[1].length === 1 ? <h3 key={key} className={cls}>{inline(h[2], key)}</h3> : <h4 key={key} className={cls}>{inline(h[2], key)}</h4>;
    }
    return <p key={key}>{inline(lines.join(" "), key)}</p>;
  });
}
