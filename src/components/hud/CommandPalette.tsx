"use client";

import { Command } from "cmdk";
import { ArrowRight, Briefcase, Copy, Download, FolderGit2, Hash, Moon, Volume2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { site, ui } from "@/content/site";
import { scrollToId } from "@/lib/scroll";
import { copyText, setUI, toast, toggleSound, toggleTheme, useUI } from "@/lib/store";

function Item({ value, onSelect, icon, children, hint }: { value: string; onSelect: () => void; icon: ReactNode; children: ReactNode; hint?: string }) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-fg-muted data-[selected=true]:bg-accent-1/10 data-[selected=true]:text-fg data-[selected=true]:shadow-[inset_0_0_0_1px_var(--line-strong)]"
    >
      <span className="text-accent-1">{icon}</span>
      <span className="flex-1 truncate">{children}</span>
      {hint && <span className="hud-label text-[10px]">{hint}</span>}
    </Command.Item>
  );
}

const groupClass =
  "[&_[cmdk-group-heading]]:hud-label [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[10px]";

/** Ctrl/⌘ + K palette. Loaded on demand the first time it opens. */
export default function CommandPalette() {
  const open = useUI((s) => s.paletteOpen);
  const router = useRouter();
  const pathname = usePathname();

  const close = () => setUI({ paletteOpen: false });
  const run = (fn: () => void) => () => {
    close();
    // Let the dialog unlock scrolling before navigating.
    window.setTimeout(fn, 30);
  };
  const goSection = (id: string) =>
    run(() => {
      if (pathname !== "/" || !scrollToId(id)) router.push(id === "top" ? "/" : `/#${id}`);
    });

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(o) => setUI({ paletteOpen: o })}
      label={ui.nav.palette}
      loop
      overlayClassName="fixed inset-0 z-[96] bg-bg/70 backdrop-blur-sm"
      contentClassName="fixed left-1/2 top-[12vh] z-[97] w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2"
    >
      <div className="glass brackets overflow-hidden" style={{ background: "var(--glass-strong)", boxShadow: "0 30px 80px -20px var(--glow)" }}>
        <div className="flex items-center gap-3 border-b border-line px-4">
          <span className="font-mono text-accent-1">&gt;</span>
          <Command.Input
            placeholder={ui.palette.placeholder}
            className="h-14 flex-1 bg-transparent font-mono text-sm text-fg outline-none placeholder:text-fg-muted/60"
          />
          <kbd className="kbd">ESC</kbd>
        </div>
        <Command.List className="max-h-[min(60vh,26rem)] overflow-y-auto p-2" data-lenis-prevent>
          <Command.Empty className="px-3 py-8 text-center font-mono text-sm text-fg-muted">{ui.palette.empty}</Command.Empty>
          <Command.Group heading={ui.palette.sections} className={groupClass}>
            {site.sections.map((s) => (
              <Item key={s.id} value={`section ${s.title} ${s.nav} ${s.code}`} onSelect={goSection(s.id)} icon={<Hash className="size-4" />} hint={s.index}>
                {s.title} <span className="text-fg-muted/60">· {s.nav}</span>
              </Item>
            ))}
          </Command.Group>
          <Command.Group heading={ui.palette.projects} className={groupClass}>
            {site.projects.map((p) => (
              <Item key={p.slug} value={`project ${p.title} ${p.context}`} onSelect={run(() => router.push(`/projects/${p.slug}`))} icon={<ArrowRight className="size-4" />} hint={p.period}>
                {p.title}
              </Item>
            ))}
          </Command.Group>
          <Command.Group heading={ui.palette.actions} className={groupClass}>
            <Item
              value="copy email"
              icon={<Copy className="size-4" />}
              onSelect={run(() => void copyText(site.identity.email).then((ok) => ok && toast(ui.contact.copied, "success")))}
              hint={site.identity.email}
            >
              {ui.palette.copyEmail}
            </Item>
            <Item
              value="download resume cv"
              icon={<Download className="size-4" />}
              onSelect={run(() => {
                const a = document.createElement("a");
                a.href = site.config.resumePath;
                a.download = "";
                a.click();
              })}
            >
              {ui.palette.resume}
            </Item>
            <Item value="open github" icon={<FolderGit2 className="size-4" />} onSelect={run(() => window.open(site.identity.github, "_blank", "noopener"))}>
              {ui.contact.github}
            </Item>
            <Item value="open linkedin" icon={<Briefcase className="size-4" />} onSelect={run(() => window.open(site.identity.linkedin, "_blank", "noopener"))}>
              {ui.contact.linkedin}
            </Item>
            <Item value="toggle theme daylight dark light" icon={<Moon className="size-4" />} onSelect={run(toggleTheme)}>
              {ui.palette.theme}
            </Item>
            <Item value="toggle sound audio" icon={<Volume2 className="size-4" />} onSelect={run(toggleSound)}>
              {ui.palette.sound}
            </Item>
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
}
