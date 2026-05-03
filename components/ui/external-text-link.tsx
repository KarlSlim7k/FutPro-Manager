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
  ...props
}: ExternalTextLinkProps) {
  return (
    <TextLink
      target={openInNewTab ? "_blank" : target}
      rel={openInNewTab ? "noreferrer" : rel}
      {...props}
    />
  );
}
