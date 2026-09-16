import type * as React from "react";
import { TextLink } from "@/components/ui/text-link";

export interface ExternalTextLinkProps
  extends React.ComponentProps<typeof TextLink> {
  openInNewTab?: boolean;
}

export function ExternalTextLink({
  openInNewTab = true,
  target,
  rel,
  href,
  ...props
}: ExternalTextLinkProps) {
  // Defensa en profundidad: solo renderizar enlaces http, https, rutas relativas o anclas.
  // Cualquier otro esquema (javascript:, data:, vbscript:, etc.) se neutraliza a <span>.
  if (typeof href === "string") {
    const trimmed = href.trim();
    const isSafe = /^https?:\/\//i.test(trimmed) || trimmed.startsWith("/") || trimmed.startsWith("#");
    if (!isSafe) {
      return <span {...props} />;
    }
  }
  return (
    <TextLink
      href={href}
      target={openInNewTab ? "_blank" : target}
      rel={openInNewTab ? "noreferrer" : rel}
      {...props}
    />
  );
}
