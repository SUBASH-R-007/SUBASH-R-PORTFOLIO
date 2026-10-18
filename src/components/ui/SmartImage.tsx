import Image from "next/image";
import { getAsset } from "@/lib/assets";
import { Placeholder, type SlotKind } from "./Placeholder";

interface Props {
  /** Path as referenced in site.ts. */
  src: string | undefined;
  alt: string;
  kind: SlotKind;
  sizes: string;
  className?: string;
  imgClassName?: string;
  fit?: "cover" | "contain";
  preload?: boolean;
  compactPlaceholder?: boolean;
}

/**
 * Renders the real image when it exists in /public (per the asset manifest),
 * otherwise a designed placeholder. Always fills its positioned parent.
 */
export function SmartImage({
  src,
  alt,
  kind,
  sizes,
  className = "",
  imgClassName = "",
  fit = "cover",
  preload = false,
  compactPlaceholder = false,
}: Props) {
  const asset = getAsset(src);
  if (!asset) return <Placeholder kind={kind} path={src} compact={compactPlaceholder} className={className} />;
  return (
    <Image
      src={asset.src}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      placeholder={asset.blurDataURL ? "blur" : "empty"}
      blurDataURL={asset.blurDataURL}
      className={`${fit === "cover" ? "object-cover" : "object-contain"} ${imgClassName} ${className}`}
    />
  );
}
