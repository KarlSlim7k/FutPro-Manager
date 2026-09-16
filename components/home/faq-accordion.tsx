"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqAccordionProps {
  faqs: FaqItem[];
  theme?: "dark" | "light";
  className?: string;
}

export function FaqAccordion({
  faqs,
  theme = "dark",
  className,
}: FaqAccordionProps) {
  const [open, setOpen] = React.useState<number | null>(0);
  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "divide-y",
        isDark ? "divide-white/10" : "divide-gray-200",
        className
      )}
    >
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={faq.q} className="py-4 first:pt-0 last:pb-0">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className={cn(
                "flex w-full items-center justify-between gap-4 rounded-lg text-left font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                isDark
                  ? "text-white hover:text-emerald-300"
                  : "text-gray-900 hover:text-emerald-700"
              )}
            >
              <span className="text-sm sm:text-base font-semibold">{faq.q}</span>
              <span
                className={cn(
                  "shrink-0 rounded-full border p-1 transition-all duration-300",
                  isDark
                    ? isOpen
                      ? "rotate-180 border-emerald-400/40 bg-emerald-500/15 text-emerald-400"
                      : "border-white/15 bg-white/5 text-gray-400"
                    : isOpen
                    ? "rotate-180 border-emerald-200 text-emerald-700"
                    : "border-gray-200 text-gray-400"
                )}
              >
                <ChevronDown className="h-4 w-4" aria-hidden />
              </span>
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen
                  ? "mt-2.5 grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    isDark ? "text-gray-300" : "text-gray-600"
                  )}
                >
                  {faq.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
