import Link, { type LinkProps } from "next/link";
import type * as React from "react";
import { cn } from "@/lib/utils";

type TextLinkVariant = "primary" | "muted";

const variantStyles: Record<TextLinkVariant, string> = {
  primary:
    "inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 rounded-sm",
  muted:
    "inline-flex items-center text-sm font-medium text-gray-600 transition hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 rounded-sm",
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
