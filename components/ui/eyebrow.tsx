import * as React from "react";
import { cn } from "@/lib/utils";

type EyebrowElement = "p" | "span" | "div";
type EyebrowTone = "default" | "brand" | "inverse";

const toneStyles: Record<EyebrowTone, string> = {
  default: "text-gray-500",
  brand: "text-emerald-700",
  inverse: "text-emerald-300",
};

export interface EyebrowProps extends React.HTMLAttributes<HTMLElement> {
  as?: EyebrowElement;
  tone?: EyebrowTone;
}

export function Eyebrow({
  as = "p",
  tone = "default",
  className,
  ...props
}: EyebrowProps) {
  const Component = as;

  return (
    <Component
      className={cn(
        "text-xs font-semibold uppercase tracking-wide",
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}
