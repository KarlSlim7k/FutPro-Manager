import Link, { type LinkProps } from "next/link";
import type * as React from "react";
import { cn } from "@/lib/utils";

type TextLinkVariant = "primary" | "muted";

const variantStyles: Record<TextLinkVariant, string> = {
  primary:
    "inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600",
  muted:
    "inline-flex items-center text-sm font-medium text-gray-600 transition hover:text-gray-800",
};

type AnchorProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export interface TextLinkProps extends LinkProps, AnchorProps {
  variant?: TextLinkVariant;
}

export function TextLink({
  className,
  variant = "primary",
  ...props
}: TextLinkProps) {
  return <Link className={cn(variantStyles[variant], className)} {...props} />;
}
