import type * as React from "react";
import { cn } from "@/lib/utils";

export interface ToolbarActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function ToolbarActions({ children, className }: ToolbarActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}
