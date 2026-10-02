import Link from "next/link";
import { ui } from "@/content/site";

export default function NotFound() {
  return (
    <section className="container-hud grid min-h-[80vh] place-items-center pt-24 text-center">
      <div className="relative">
        <div aria-hidden className="scanlines pointer-events-none absolute -inset-10 opacity-50" />
        <p className="hud-label" style={{ color: "#fda4af" }}>
          {ui.notFound.err}
        </p>
        <h1 className="mt-4 font-display text-5xl font-bold tracking-tight text-fg sm:text-7xl">
          <span className="gradient-text text-glow">{ui.notFound.code}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-fg-muted">{ui.notFound.message}</p>
        <Link href="/" className="btn btn-primary mt-8">
          {ui.notFound.home}
        </Link>
      </div>
    </section>
  );
}
