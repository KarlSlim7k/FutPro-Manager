import * as React from "react";
import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/eyebrow";

export interface SectionHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
  titleClassName,
  descriptionClassName,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div>
        {eyebrow ? (
          typeof eyebrow === "string" ? (
            <Eyebrow>{eyebrow}</Eyebrow>
          ) : (
            eyebrow
          )
        ) : null}
        <h2
          className={cn(
            "text-3xl font-bold tracking-tight text-gray-900",
            titleClassName
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "mt-2 text-sm text-gray-600 sm:text-base",
              descriptionClassName
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
