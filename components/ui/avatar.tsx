"use client";

import { useState } from "react";
import Image from "next/image";
import { resolveCdnMediaUrl } from "@/lib/media/upload-media";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  className?: string;
}

const SIZE_CLASSES: Record<AvatarSize, { container: string; pixels: number; text: string }> = {
  xs: { container: "h-6 w-6 text-[10px]", pixels: 24, text: "text-[10px]" },
  sm: { container: "h-8 w-8 text-xs", pixels: 32, text: "text-xs" },
  md: { container: "h-10 w-10 text-sm", pixels: 40, text: "text-sm" },
  lg: { container: "h-16 w-16 text-lg", pixels: 64, text: "text-lg" },
  xl: { container: "h-24 w-24 text-2xl", pixels: 96, text: "text-2xl" },
};

export function Avatar({
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  className = "",
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const sizeConfig = SIZE_CLASSES[size];

  const resolvedSrc = src && !hasError ? resolveCdnMediaUrl(src, { width: sizeConfig.pixels * 2, height: sizeConfig.pixels * 2, resize: "cover" }) : null;

  const initials = fallback
    ? fallback
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : null;

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 font-medium text-emerald-800 ring-2 ring-white shadow-sm select-none ${sizeConfig.container} ${className}`}
    >
      {resolvedSrc ? (
        <Image
          src={resolvedSrc}
          alt={alt}
          fill
          sizes={`${sizeConfig.pixels}px`}
          className="object-cover"
          onError={() => setHasError(true)}
          unoptimized={resolvedSrc.startsWith("blob:")}
        />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <svg
          className="h-3/5 w-3/5 text-emerald-700"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      )}
    </div>
  );
}
