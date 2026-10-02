# SUBASH-R-PORTFOLIO

"Neural Interface", Subash R's personal portfolio. Next.js 16 (App Router) + TypeScript, Tailwind CSS 4,
Motion, GSAP ScrollTrigger, Lenis, React Three Fiber, cmdk. Every page is statically generated.

## Run locally

Requires Node.js 22+.

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000. Other scripts:

| Script | What it does |
|---|---|
| `npm run build` | Production build (runs `assets:check` first) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run assets:check` | Scan `/public` for images/certificates and print what's missing |

## Edit content

**All copy lives in [`src/content/site.ts`](src/content/site.ts)**: identity, summary, stats, education,
skills, experience, projects, awards, leadership, certifications, section titles, boot lines, SEO, and
the `ui` block (button labels, terminal responses, palette text, 404 copy). Components never hardcode copy.
Types are in [`src/content/types.ts`](src/content/types.ts), so TypeScript flags a typo or missing field.

Useful fields:

- **Projects:** `tags` are skill ids (they drive the chips, the Neural Map highlights and the skill filter);
  `domains` drive the filter bar; `featured: true` puts a project in the pinned panels; `metrics` become
  the animated numbers. Add a long write-up with the optional `caseStudy` field (Markdown: headings,
  paragraphs, `- ` lists, `**bold**`, `` `code` ``, `[links](url)`). It renders on the case-study page.
- **Certifications:** add `verifyUrl` to show a Verify button.
- **Status line:** `identity.status` ("Open to internships & collaborations").
- **Navigation:** `ui.nav.links` lists which sections appear in the top bar.

## Add images, certificates and the résumé

See [`public/README.md`](public/README.md) for every expected path and recommended size. In short: drop a
file at the listed path (e.g. `public/images/projects/sagar-nethra/cover.jpg`), then rebuild or run
`npm run assets:check`. Missing files show a designed "SIGNAL PENDING" placeholder, and the build never
fails because of a missing image. In development each placeholder also prints the path it expects.

- **Résumé:** replace `public/resume/Subash_R_Resume.pdf` (keep the filename, or change `config.resumePath`).
- **Certificates:** `public/certificates/<id>.jpg` and/or `.pdf`.
- **Demo videos:** add `video: "/images/projects/<slug>/demo.mp4"` to a project.

## Toggle phone visibility

The phone number is in `identity.phone` but hidden by default. Set `config.showPhone: true` in `site.ts` to
show it in the contact card and add a `phone` terminal command. Note that the résumé PDF itself contains
the number, so swap in a phone-less PDF if you want it fully private.

## Other switches (`config` in `site.ts`)

- `url`: canonical domain used for SEO, Open Graph, sitemap and robots. **Update it after deploying.**
- `bootSequence`: first-visit terminal boot (skipped automatically for reduced-motion users).
- `defaultTheme`: `"dark"` or `"light"`.

Easter egg: type `neural` anywhere (or the Konami code). `Ctrl/⌘ + K` opens the command palette.

## Deploy to Vercel

1. Push this repository to GitHub.
2. Go to https://vercel.com/new and import the repository. Vercel detects Next.js; keep the defaults
   (build command `npm run build`, no environment variables needed).
3. Click **Deploy**.
4. Set `config.url` in `src/content/site.ts` to the production URL (e.g. `https://subash-r.vercel.app`
   or your custom domain), commit and push. Vercel redeploys automatically on every push to `main`.
5. Optional: add a custom domain under Project → Settings → Domains.

## Project structure

```
src/
  app/            routes: home, /projects/[slug], OG image, icon, sitemap, robots, 404
  components/
    hud/          nav, scroll rail, boot sequence, cursor, command palette, toasts, smooth scroll
    hero/         R3F neural field (+ CSS fallback), portrait frame, telemetry
    sections/     About, Experience, Projects, Skills, Achievements, Certifications, Leadership, Contact
    projects/     featured panels, bento grid, cover media, gallery
    ui/           smart image, placeholder, scramble text, counter, tilt card, lightbox, chips
  content/        site.ts (all copy), types.ts, asset-manifest.json (generated)
  lib/            asset lookup, store, scroll, gsap loader, motion presets, hooks
scripts/check-assets.ts
```

## Accessibility and motion

`prefers-reduced-motion` disables the boot sequence, 3D field, smooth scrolling, pinned/scrubbed scroll
effects and the custom cursor; content still fades in. The 3D field falls back to a CSS gradient mesh
without hardware WebGL, on low-power devices, and on phones until the first interaction.
