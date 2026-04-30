import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white p-5", className)}>
      <h3 className="text-base font-semibold tracking-tight text-gray-900">{title}</h3>
      <div className="mt-2 text-sm text-gray-600">{description}</div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
