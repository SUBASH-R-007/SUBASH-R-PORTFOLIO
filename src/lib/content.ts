import { site } from "@/content/site";
import type { ProjectDomain, Skill } from "@/content/types";

const skillMap = new Map(site.skills.map((s) => [s.id, s]));

export const getSkill = (id: string): Skill | undefined => skillMap.get(id);
export const skillName = (id: string) => skillMap.get(id)?.name ?? id;

export const getProject = (slug: string) => site.projects.find((p) => p.slug === slug);
export const featuredProjects = site.projects.filter((p) => p.featured);
export const otherProjects = site.projects.filter((p) => !p.featured);

export const sectionById = (id: string) => site.sections.find((s) => s.id === id)!;

/** Domains that have at least one project, in the order defined by the UI copy. */
export function activeDomains(): ProjectDomain[] {
  const order: ProjectDomain[] = ["ai-ml", "full-stack", "data", "mobile", "cloud"];
  return order.filter((d) => site.projects.some((p) => p.domains.includes(d)));
}

export interface SkillUsage {
  kind: "project" | "experience";
  id: string;
  label: string;
  href: string;
}

/** Everything that references a skill id, computed from tags in content. */
export function usageOf(skillId: string): SkillUsage[] {
  const out: SkillUsage[] = [];
  for (const p of site.projects)
    if (p.tags.includes(skillId)) out.push({ kind: "project", id: p.slug, label: p.title, href: `/projects/${p.slug}` });
  for (const e of site.experience)
    if (e.tags.includes(skillId))
      out.push({ kind: "experience", id: e.id, label: `${e.role} · ${e.organisationShort}`, href: "#experience" });
  return out;
}


export const formatNumber = (value: number, decimals = 0, grouped = false) =>
  grouped
    ? value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : value.toFixed(decimals);
