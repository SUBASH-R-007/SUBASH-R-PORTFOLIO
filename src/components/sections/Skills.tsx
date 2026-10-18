"use client";

import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, type SimulationNodeDatum } from "d3-force";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Filter } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { site, ui } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getSkill, usageOf } from "@/lib/content";
import { useIsDesktop } from "@/lib/hooks";
import { EASE } from "@/lib/motion";
import { scrollToId } from "@/lib/scroll";
import { setUI } from "@/lib/store";

const W = 1000;
const H = 720;
const CAT_COLORS: Record<string, string> = {
  languages: "var(--accent-1)",
  frameworks: "var(--accent-2)",
  "data-ml": "var(--accent-3)",
  databases: "#f472b6",
  "cloud-tools": "#fbbf24",
};

type Node = SimulationNodeDatum & { id: string; label: string; hub: boolean; cat: string; r: number };
type Edge = { source: string; target: string; kind: "hub" | "co" };

/** Skills that appear together in a project or role are linked as "synapses". */
function coLinks(): Edge[] {
  const seen = new Set<string>();
  const out: Edge[] = [];
  for (const tags of [...site.projects.map((p) => p.tags), ...site.experience.map((e) => e.tags)]) {
    for (let i = 0; i < tags.length; i++)
      for (let j = i + 1; j < tags.length; j++) {
        const k = [tags[i], tags[j]].sort().join("|");
        if (seen.has(k)) continue;
        seen.add(k);
        out.push({ source: tags[i], target: tags[j], kind: "co" });
      }
  }
  return out;
}

function layout() {
  const hubs: Node[] = site.skillCategories.map((c, i) => {
    const a = (i / site.skillCategories.length) * Math.PI * 2 - Math.PI / 2;
    return { id: `hub:${c.id}`, label: c.label, hub: true, cat: c.id, r: 9, fx: W / 2 + Math.cos(a) * 330, fy: H / 2 + 10 + Math.sin(a) * 250 };
  });
  const skills: Node[] = site.skills.map((s, i) => {
    const hub = hubs.find((h) => h.cat === s.category)!;
    const a = i * 2.39996;
    return { id: s.id, label: s.name, hub: false, cat: s.category, r: 4.5, x: hub.fx! + Math.cos(a) * 40, y: hub.fy! + Math.sin(a) * 40 };
  });
  const nodes = [...hubs, ...skills];
  const hubEdges: Edge[] = skills.map((s) => ({ source: `hub:${s.cat}`, target: s.id, kind: "hub" }));
  const co = coLinks();
  const sim = forceSimulation(nodes)
    .force("link", forceLink<Node, Edge & SimulationNodeDatum>(hubEdges.map((e) => ({ ...e })) as never).id((d) => d.id).distance(105).strength(0.7))
    .force("charge", forceManyBody().strength(-90))
    .force("collide", forceCollide<Node>().radius((d) => (d.hub ? 58 : 8 + d.label.length * 3.4)).iterations(3))
    .force("x", forceX(W / 2).strength(0.02))
    .force("y", forceY(H / 2).strength(0.03))
    .stop();
  sim.tick(320);
  for (const n of nodes) {
    n.x = Math.max(60, Math.min(W - 60, n.x ?? 0));
    n.y = Math.max(30, Math.min(H - 30, n.y ?? 0));
  }
  return { nodes, edges: [...hubEdges, ...co] };
}

/** Glow every matching tech chip elsewhere on the page. */
function useChipGlow(id: string | null) {
  useEffect(() => {
    const chips = document.querySelectorAll<HTMLElement>(".chip[data-skill]");
    chips.forEach((c) => {
      if (id && c.dataset.skill === id) c.dataset.glow = "true";
      else delete c.dataset.glow;
    });
  }, [id]);
}

function UsagePanel({ id }: { id: string | null }) {
  const skill = id ? getSkill(id) : undefined;
  const used = id ? usageOf(id) : [];
  return (
    <div className="glass brackets min-h-[15rem] p-5" aria-live="polite">
      <AnimatePresence mode="wait">
        {!skill ? (
          <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm leading-relaxed text-fg-muted">
            <span className="hud-label mb-3 block" style={{ color: "var(--accent-1)" }}>
              {"// "}
              {ui.skills.inspector}
            </span>
            {ui.skills.hint}
          </motion.p>
        ) : (
          <motion.div key={skill.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
            <p className="hud-label" style={{ color: CAT_COLORS[skill.category] }}>
              {site.skillCategories.find((c) => c.id === skill.category)?.label}
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-fg">{skill.name}</h3>
            <p className="hud-label mt-5 text-[10px]">{ui.skills.usedIn}</p>
            {used.length ? (
              <ul className="mt-2 space-y-1.5">
                {used.map((u) => (
                  <li key={u.kind + u.id}>
                    <Link href={u.href} className="group flex items-start gap-2 text-sm text-fg hover:text-accent-1" onClick={(e) => u.href.startsWith("#") && (e.preventDefault(), scrollToId(u.href.slice(1)))}>
                      <span className="mt-1.5 size-1.5 shrink-0 rotate-45" style={{ background: u.kind === "project" ? "var(--accent-1)" : "var(--accent-2)" }} />
                      <span className="flex-1">{u.label}</span>
                      <ArrowUpRight className="mt-0.5 size-3.5 opacity-50 group-hover:opacity-100" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-fg-muted">{ui.skills.unused}</p>
            )}
            {used.some((u) => u.kind === "project") && (
              <button
                type="button"
                className="btn btn-ghost mt-5 min-h-0 py-2"
                onClick={() => {
                  setUI({ skillFilter: skill.id });
                  scrollToId("projects-grid");
                }}
              >
                <Filter className="size-3.5" aria-hidden />
                {ui.skills.filter}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Graph({ active, setActive }: { active: string | null; setActive: (id: string | null) => void }) {
  const { nodes, edges } = useMemo(() => layout(), []);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const linked = useMemo(() => {
    if (!active) return null;
    const set = new Set([active]);
    for (const e of edges) {
      if (e.source === active) set.add(e.target);
      if (e.target === active) set.add(e.source);
    }
    return set;
  }, [active, edges]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="group" aria-label={ui.skills.graphLabel}>
      <g aria-hidden>
        {edges.map((e, i) => {
          const a = byId.get(e.source)!;
          const b = byId.get(e.target)!;
          const on = !!active && (e.source === active || e.target === active);
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={e.kind === "co" ? "var(--accent-2)" : CAT_COLORS[a.cat]}
              strokeOpacity={on ? 0.9 : linked ? 0.05 : e.kind === "co" ? 0.12 : 0.22}
              strokeWidth={on ? 1.6 : 0.8}
              strokeDasharray={e.kind === "co" ? "3 4" : undefined}
              style={{ transition: "stroke-opacity .35s, stroke-width .35s" }}
            />
          );
        })}
      </g>
      {nodes.map((n) => {
        const on = active === n.id;
        const dim = !!linked && !linked.has(n.id);
        const color = CAT_COLORS[n.cat];
        const hubLabel = n.hub ? n.label.toUpperCase() : n.label;
        return (
          <g
            key={n.id}
            transform={`translate(${n.x} ${n.y})`}
            style={{ opacity: dim ? 0.25 : 1, transition: "opacity .35s" }}
            {...(!n.hub && {
              role: "button",
              tabIndex: 0,
              "aria-label": `${n.label}: ${usageOf(n.id).length} ${ui.skills.uses}`,
              "aria-pressed": on,
              onPointerEnter: () => setActive(n.id),
              onFocus: () => setActive(n.id),
              onClick: () => setActive(n.id),
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (usageOf(n.id).some((u) => u.kind === "project")) {
                    setUI({ skillFilter: n.id });
                    scrollToId("projects-grid");
                  }
                }
              },
              className: "cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-[var(--accent-1)]",
            })}
          >
            {n.hub ? (
              <>
                <circle r={22} fill="var(--bg-elev)" stroke={color} strokeOpacity={0.6} />
                <circle r={30} fill="none" stroke={color} strokeOpacity={0.25} strokeDasharray="2 5" />
                <circle r={4} fill={color} />
                <text y={44} textAnchor="middle" className="fill-fg-muted font-mono text-[11px] tracking-[0.18em]" stroke="var(--bg-elev)" strokeWidth={4} paintOrder="stroke">
                  {hubLabel}
                </text>
              </>
            ) : (
              <>
                <circle r={14} fill="transparent" stroke="transparent" strokeWidth={2} />
                {on && <circle r={12} fill={color} opacity={0.18} />}
                <circle r={on ? 6.5 : n.r} fill={on ? color : "var(--bg)"} stroke={color} strokeWidth={1.4} style={{ transition: "r .3s", filter: on ? `drop-shadow(0 0 8px ${color})` : undefined }} />
                <text y={20} textAnchor="middle" stroke="var(--bg-elev)" strokeWidth={4} paintOrder="stroke" className={`font-mono text-[12px] ${on ? "fill-fg" : "fill-fg-muted"}`}>
                  {hubLabel}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function ChipClouds({ active, setActive }: { active: string | null; setActive: (id: string | null) => void }) {
  return (
    <div className="space-y-6">
      {site.skillCategories.map((c) => (
        <div key={c.id}>
          <h3 className="hud-label mb-3 flex items-center gap-2">
            <span className="size-1.5 rotate-45" style={{ background: CAT_COLORS[c.id] }} />
            {c.label}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {site.skills
              .filter((s) => s.category === c.id)
              .map((s) => (
                <li key={s.id}>
                  <button type="button" className="chip text-xs" data-active={active === s.id} aria-pressed={active === s.id} onClick={() => setActive(active === s.id ? null : s.id)}>
                    {s.name}
                  </button>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function Skills() {
  const desktop = useIsDesktop();
  const [active, setActive] = useState<string | null>(null);
  useChipGlow(active);

  return (
    <section id="skills" className="cv-auto container-hud scroll-mt-20 py-24 md:py-32">
      <SectionHeader id="skills" aside={<p className="hud-label">{site.skills.length} {ui.skills.nodes} · {site.skillCategories.length} {ui.skills.hubs}</p>} />
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className={desktop ? "glass relative overflow-hidden p-2" : ""}>
          {desktop ? <Graph active={active} setActive={setActive} /> : <ChipClouds active={active} setActive={setActive} />}
        </div>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <UsagePanel id={active} />
        </div>
      </div>
    </section>
  );
}
