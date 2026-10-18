# Adding images, certificates and the résumé

Every image slot on the site already shows a designed **SIGNAL PENDING** placeholder.
Drop a file at the path below and it replaces the placeholder automatically.

1. Put the file in the exact folder, with the exact filename shown.
2. Run `npm run assets:check` (it also runs automatically before `npm run dev` and `npm run build`).
3. Reload. That's it.

**Filenames must match.** The one allowance: an image may use a different image extension
(`cover.png`, `cover.webp`, `cover.jpeg` or `cover.avif` all work for `cover.jpg`).
In development, each placeholder prints the path it is waiting for.

Use JPG for photos, PNG (transparent background) for logos. Keep photos under ~500 KB;
Next.js serves resized AVIF/WebP versions automatically.

| Path | What | Recommended size |
|---|---|---|
| `resume/Subash_R_Resume.pdf` | Résumé linked from the hero, palette and terminal. Replace to update. | – |
| `images/profile/portrait.jpg` | Hero portrait (shown in the HUD ring, cropped to a circle) | 1200 × 1500 |
| `images/profile/portrait-alt.jpg` | *Optional*, second portrait used in About | 1200 × 1500 |
| `images/experience/niepmd-logo.png` | NIEPMD logo (Mission Log card) | 256 × 256, transparent |
| `images/experience/rec-logo.png` | REC logo (KuttyKoncepts card and the REC orbit) | 256 × 256, transparent |
| `images/experience/shakra-logo.png` | Shakra Innovations logo | 256 × 256, transparent |
| `images/projects/<slug>/cover.jpg` | Project cover | 1600 × 1000 (16:10) |
| `images/projects/<slug>/gallery-01.jpg` … `gallery-0N.jpg` | Case-study gallery. Add as many as you like; numbering sets the order. | 1600 × 1000 |
| `images/projects/kuttykoncepts/demo.mp4` | *Optional*, muted demo clip that plays on the cover. Any project can have one: add `video` to it in `site.ts`. | 1280 × 800, H.264, < 8 MB |
| `images/achievements/<id>.jpg` | Award photo or certificate, shown on the back of each flip card | 1600 × 1000 |
| `images/leadership/inovx-01.jpg` … | INOVX event photos (carousel). Add as many as you like. | 1600 × 1000 |
| `certificates/<id>.jpg` **or** `.pdf` | Certificate. An image is shown in the lightbox; a PDF is embedded and opens in a new tab. You can supply both. | 2000 px wide |

Project slugs: `sagar-nethra`, `campus-app`, `kuttykoncepts`, `price-prediction`,
`hospital-management`, `traffic-dashboard`, `localink`.

Achievement ids: `sih-2026`, `smartability`, `minister-presentation`, `kuttykoncepts-hackathon`,
`academic-topper`, `ieee-cs-ml`, `codesapiens`.

Certificate ids: `india-space-lab`, `tansam-power-bi`, `aws-academy-cloud-architecting`,
`iitm-foundations-data-science`, `mongodb-basics`.

To add a "Verify" button to a certificate, set `verifyUrl` on it in `src/content/site.ts`.

Only add logos and photos you have the right to use.
