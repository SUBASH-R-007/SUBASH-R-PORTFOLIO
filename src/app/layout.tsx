import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { site, ui } from "@/content/site";
import { BootSequence } from "@/components/hud/BootSequence";
import { ClientShell } from "@/components/hud/ClientShell";
import { Nav } from "@/components/hud/Nav";
import { ScrollRail } from "@/components/hud/ScrollRail";
import { Toaster } from "@/components/hud/Toaster";
import { Footer } from "@/components/sections/Footer";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--nf-display", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--nf-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--nf-mono", display: "swap" });

const { identity, seo, config } = site;

export const metadata: Metadata = {
  metadataBase: new URL(config.url),
  title: { default: seo.title, template: `%s | ${identity.name}` },
  description: seo.description,
  keywords: seo.keywords,
  authors: [{ name: identity.name, url: config.url }],
  creator: identity.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: identity.name,
    title: seo.title,
    description: seo.description,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: seo.title, description: seo.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#05070d" },
    { media: "(prefers-color-scheme: light)", color: "#eef2f8" },
  ],
  colorScheme: "dark light",
};

/**
 * Runs before first paint: applies the saved theme and decides whether the boot
 * sequence plays (first visit this session, motion allowed, enabled in config).
 */
const preflight = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('sr-theme');if(t==='light'||t==='dark')d.dataset.theme=t;}catch(e){}var seen=true;try{seen=!!sessionStorage.getItem('sr-boot');}catch(e){}var rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;d.dataset.boot=(seen||rm||!${config.bootSequence})?'seen':'pending';})();`;

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: identity.name,
  url: config.url,
  email: `mailto:${identity.email}`,
  jobTitle: identity.roles[0],
  description: seo.description,
  address: { "@type": "PostalAddress", addressLocality: "Chennai", addressCountry: "IN" },
  alumniOf: site.education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.institution })),
  knowsAbout: identity.roles,
  sameAs: [identity.linkedin, identity.github],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme={config.defaultTheme}
      data-boot="seen"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: preflight }} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="btn btn-primary fixed left-4 top-4 z-[200] -translate-y-24 focus-visible:translate-y-0"
        >
          {ui.skipToContent}
        </a>
        <div className="ambient" aria-hidden>
          <div className="ambient-glow" />
          <div className="ambient-dots" />
          <div className="ambient-floor" />
          <div className="ambient-grain" />
        </div>
        <BootSequence />
        <Nav />
        <ScrollRail />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
        <Toaster />
        <ClientShell />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
