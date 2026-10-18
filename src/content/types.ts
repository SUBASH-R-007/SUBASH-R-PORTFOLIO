/**
 * Content model for the portfolio. Every piece of copy on the site comes from
 * `site.ts`, which is typed against these interfaces.
 *
 * Image fields hold public paths (e.g. "/images/projects/localink/cover.jpg").
 * Whether a file actually exists is decided at build time by
 * `scripts/check-assets.ts`, so missing files render a designed placeholder.
 */

export type SkillCategoryId = "languages" | "frameworks" | "data-ml" | "databases" | "cloud-tools";

export type ProjectDomain = "ai-ml" | "full-stack" | "data" | "mobile" | "cloud";

export interface SiteConfig {
  /** Canonical URL, used for SEO, sitemap and Open Graph. Update after deploying. */
  url: string;
  /** Show the phone number anywhere on the site. Off by default for privacy. */
  showPhone: boolean;
  /** Path of the résumé PDF inside /public. */
  resumePath: string;
  /** Starting colour theme. */
  defaultTheme: "dark" | "light";
  /** Play the terminal boot sequence on the first visit of a session. */
  bootSequence: boolean;
}

export interface Identity {
  name: string;
  /** Short form shown in the logo mark. */
  monogram: string;
  roles: string[];
  location: string;
  timezoneLabel: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  /** Editable availability line shown in About and the hero. */
  status: string;
  portrait: string;
  portraitAlt: string;
  portraitSecondary: string;
}

export interface Stat {
  id: string;
  label: string;
  /** Numeric value used for the count-up animation. */
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Use thousands separators when rendering. */
  grouped?: boolean;
}

export interface Education {
  id: string;
  degree: string;
  field: string;
  institution: string;
  shortName: string;
  location?: string;
  period: string;
  /** e.g. "CGPA 9.12" or "Diploma level completed". */
  result: string;
  logo?: string;
}

export interface SkillCategory {
  id: SkillCategoryId;
  label: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategoryId;
}

export interface Experience {
  id: string;
  role: string;
  organisation: string;
  organisationShort: string;
  location: string;
  period: string;
  current: boolean;
  bullets: string[];
  /** Skill ids. */
  tags: string[];
  logo?: string;
  /** Renders the CLASSIFIED / NDA badge. */
  nda?: boolean;
  /** Slug of a related project. */
  projectSlug?: string;
}

export interface Metric {
  /** Numeric part, animated on scroll. */
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

export interface Project {
  slug: string;
  title: string;
  context: string;
  period: string;
  oneLiner: string;
  bullets: string[];
  /** Skill ids. */
  tags: string[];
  domains: ProjectDomain[];
  featured: boolean;
  metrics: Metric[];
  repo?: string;
  cover: string;
  /** Optional muted looping demo clip, e.g. "/images/projects/kuttykoncepts/demo.mp4". */
  video?: string;
  /** Expected gallery files; any that don't exist are skipped. */
  gallery: string[];
  /** Id of the experience entry this project comes from. */
  experienceId?: string;
  /** Optional long-form write-up in Markdown. Rendered on the case-study page when present. */
  caseStudy?: string;
}

export interface Achievement {
  id: string;
  title: string;
  date: string;
  context: string;
  image: string;
  /** Wider highlight card. */
  highlight?: boolean;
  projectSlug?: string;
}

export interface Leadership {
  id: string;
  role: string;
  organisation: string;
  period: string;
  bullets: string[];
  stats: { value: number; suffix?: string; label: string }[];
  photos: string[];
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date?: string;
  /** Image version of the certificate. */
  image: string;
  /** PDF version of the certificate. Either or both may exist. */
  pdf: string;
  verifyUrl?: string;
}

export interface SectionMeta {
  id: string;
  /** Short label for navigation. */
  nav: string;
  index: string;
  code: string;
  title: string;
  kicker: string;
}

export interface SiteContent {
  config: SiteConfig;
  identity: Identity;
  summary: string;
  stats: Stat[];
  education: Education[];
  skillCategories: SkillCategory[];
  skills: Skill[];
  experience: Experience[];
  projects: Project[];
  achievements: Achievement[];
  leadership: Leadership[];
  certifications: Certification[];
  sections: SectionMeta[];
  boot: string[];
  seo: { title: string; description: string; keywords: string[] };
}
