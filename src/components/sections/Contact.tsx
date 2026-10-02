"use client";

import { Briefcase, Check, Copy, Download, FolderGit2, Mail, Phone, TerminalSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { site, ui } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Magnetic } from "@/components/ui/Magnetic";
import { blip } from "@/lib/sound";
import { copyText, toast } from "@/lib/store";

type Line = { kind: "in" | "out" | "sys" | "err" | "link"; text: string; href?: string };

const { identity, config } = site;

const COMMANDS: Record<string, string> = {
  ...ui.contact.commands,
  ...(config.showPhone ? { phone: ui.contact.phoneCommand } : {}),
};

function run(raw: string): Line[] | "clear" {
  const cmd = raw.trim().toLowerCase().replace(/\s+/g, " ");
  const out = (text: string): Line => ({ kind: "out", text });
  const link = (text: string, href: string): Line => ({ kind: "link", text, href });
  switch (cmd) {
    case "":
      return [];
    case "help": {
      const width = Math.max(...Object.keys(COMMANDS).map((k) => k.length));
      return Object.entries(COMMANDS).map(([k, v]) => out(`  ${k.padEnd(width + 2)}${v}`));
    }
    case "whoami":
      return [
        { kind: "sys", text: `${identity.name} // ${identity.roles.join(" · ")}` },
        out(`${identity.location} · ${identity.status}`),
        out(site.summary),
      ];
    case "projects":
      return site.projects.map((p) => link(`▸ ${p.title} (${p.period})`, `/projects/${p.slug}`));
    case "skills":
      return site.skillCategories.map((c) =>
        out(`${c.label}: ${site.skills.filter((s) => s.category === c.id).map((s) => s.name).join(", ")}`),
      );
    case "resume":
      window.open(config.resumePath, "_blank", "noopener");
      return [link(`${ui.contact.opening} ${config.resumePath}`, config.resumePath)];
    case "email":
      void copyText(identity.email).then((ok) => ok && toast(ui.contact.copied, "success"));
      return [link(identity.email, `mailto:${identity.email}`)];
    case "github":
      window.open(identity.github, "_blank", "noopener");
      return [link(identity.github, identity.github)];
    case "linkedin":
      window.open(identity.linkedin, "_blank", "noopener");
      return [link(identity.linkedin, identity.linkedin)];
    case "phone":
      if (config.showPhone) return [link(identity.phone, `tel:${identity.phone.replace(/[^+\d]/g, "")}`)];
      break;
    case "clear":
      return "clear";
    case "sudo hire subash":
      return ui.contact.hire.map((t, i) => ({ kind: i === ui.contact.hire.length - 1 ? "sys" : "out", text: t.replace("{email}", identity.email) }));
  }
  return [{ kind: "err", text: ui.contact.unknown.replace("{cmd}", raw.trim()) }];
}

function Terminal() {
  const [lines, setLines] = useState<Line[]>(() => ui.contact.welcome.map((text) => ({ kind: "sys" as const, text })));
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [lines]);

  const submit = () => {
    const result = run(value);
    blip(660, 0.05);
    if (result === "clear") setLines([]);
    else setLines((l) => [...l, { kind: "in", text: value }, ...result]);
    if (value.trim()) setHistory((h) => [value, ...h].slice(0, 30));
    setCursor(-1);
    setValue("");
  };

  return (
    <div className="glass brackets flex h-[26rem] flex-col overflow-hidden font-mono text-[13px] sm:h-[30rem]" onClick={() => input.current?.focus()}>
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#f87171]/80" />
        <span className="size-2.5 rounded-full bg-[#fbbf24]/80" />
        <span className="size-2.5 rounded-full bg-accent-3/80" />
        <span className="hud-label ml-3 truncate text-[10px]">{ui.contact.terminalTitle}</span>
        <TerminalSquare className="ml-auto size-4 text-fg-muted" aria-hidden />
      </div>
      <div ref={log} role="log" aria-live="polite" className="flex-1 space-y-1 overflow-y-auto p-4 leading-relaxed" data-lenis-prevent>
        {lines.map((l, i) => (
          <p
            key={i}
            className={`whitespace-pre-wrap break-words ${
              l.kind === "in" ? "text-fg" : l.kind === "sys" ? "text-accent-1" : l.kind === "err" ? "text-[#fda4af]" : "text-fg-muted"
            }`}
          >
            {l.kind === "in" && <span className="text-accent-3">{ui.contact.prompt} </span>}
            {l.kind === "link" ? (
              <a href={l.href} className="text-accent-1 underline-offset-4 hover:underline" target={l.href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                {l.text}
              </a>
            ) : (
              l.text
            )}
          </p>
        ))}
      </div>
      <form
        className="flex items-center gap-2 border-t border-line px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label htmlFor="terminal-input" className="shrink-0 text-accent-3">
          <span className="sr-only">{ui.contact.inputLabel}</span>
          <span aria-hidden>{ui.contact.prompt}</span>
        </label>
        <input
          ref={input}
          id="terminal-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" && history.length) {
              e.preventDefault();
              const n = Math.min(history.length - 1, cursor + 1);
              setCursor(n);
              setValue(history[n]);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              const n = cursor - 1;
              setCursor(Math.max(-1, n));
              setValue(n >= 0 ? history[n] : "");
            }
          }}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-fg caret-[var(--accent-1)] outline-none placeholder:text-fg-muted"
          placeholder="help"
        />
      </form>
    </div>
  );
}

function ContactCard() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (await copyText(identity.email)) {
      setCopied(true);
      toast(ui.contact.copied, "success");
      window.setTimeout(() => setCopied(false), 2000);
    }
  };
  const links = [
    { href: identity.linkedin, label: ui.contact.linkedin, icon: Briefcase, external: true },
    { href: identity.github, label: ui.contact.github, icon: FolderGit2, external: true },
    { href: config.resumePath, label: ui.hero.ctaResume, icon: Download, download: true },
    ...(config.showPhone ? [{ href: `tel:${identity.phone.replace(/[^+\d]/g, "")}`, label: identity.phone, icon: Phone }] : []),
  ];

  return (
    <div className="glass brackets flex flex-col p-6 sm:p-8">
      <p className="hud-label flex items-center gap-2">
        <span className="size-1.5 animate-pulse rounded-full bg-accent-3" />
        {identity.status}
      </p>
      <h3 className="mt-4 font-display text-3xl font-semibold leading-tight text-fg sm:text-4xl">{ui.contact.heading}</h3>
      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl p-3 ring-1 ring-line" style={{ background: "color-mix(in srgb, var(--bg-elev) 60%, transparent)" }}>
        <Mail className="size-4 shrink-0 text-accent-1" aria-hidden />
        <span className="min-w-0 flex-1 break-all font-mono text-sm text-fg">{identity.email}</span>
        <button type="button" onClick={copy} className="icon-btn size-9" aria-label={ui.contact.copyEmail}>
          {copied ? <Check className="size-4 text-accent-3" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        </button>
      </div>
      <Magnetic className="mt-4">
        <a href={`mailto:${identity.email}`} className="btn btn-primary w-full sm:w-auto">
          <Mail className="size-4" aria-hidden />
          {ui.contact.sendEmail}
        </a>
      </Magnetic>
      <ul className="mt-6 grid gap-2">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              {...("external" in l && l.external ? { target: "_blank", rel: "noreferrer" } : {})}
              {...("download" in l && l.download ? { download: true } : {})}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-fg ring-1 ring-line transition-colors hover:ring-accent-1"
            >
              <l.icon className="size-4 text-fg-muted transition-colors group-hover:text-accent-1" aria-hidden />
              {l.label}
              <span className="ml-auto font-mono text-xs text-fg-muted transition-transform group-hover:translate-x-0.5">→</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Contact() {
  return (
    <section id="contact" className="cv-auto container-hud scroll-mt-20 py-24 md:py-32">
      <SectionHeader id="contact" />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Terminal />
        <ContactCard />
      </div>
    </section>
  );
}
