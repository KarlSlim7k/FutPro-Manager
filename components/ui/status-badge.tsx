import * as React from "react";
import { cn } from "@/lib/utils";

export type StatusBadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "info";

const variantStyles: Record<StatusBadgeVariant, string> = {
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  neutral: "bg-gray-100 text-gray-700",
  info: "bg-blue-100 text-blue-800",
};

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusBadgeVariant;
}

export function StatusBadge({
  className,
  variant = "neutral",
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
