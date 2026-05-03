import * as React from "react";
import { cn } from "@/lib/utils";
import { TextLink } from "@/components/ui/text-link";
import { SectionHeader } from "@/components/ui/section-header";

export interface PageHeaderProps {
  backHref?: string;
  backLabel?: string;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  backHref,
  backLabel = "Volver",
  eyebrow,
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {backHref ? <TextLink href={backHref}>{backLabel}</TextLink> : null}
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        titleAs="h1"
        description={description}
        action={action}
      />
    </div>
  );
}
