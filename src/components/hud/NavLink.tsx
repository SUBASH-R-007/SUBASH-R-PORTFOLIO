"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { scrollToId } from "@/lib/scroll";

/** Link to a home-page section: smooth-scrolls on the home page, navigates elsewhere. */
export function SectionLink({
  id,
  children,
  className,
  onNavigate,
  ...rest
}: {
  id: string;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">) {
  const pathname = usePathname();
  const onHome = pathname === "/";
  return (
    <Link
      href={id === "top" ? "/" : `/#${id}`}
      className={className}
      onClick={(e) => {
        onNavigate?.();
        if (!onHome) return;
        e.preventDefault();
        scrollToId(id);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
