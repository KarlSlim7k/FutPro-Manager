"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  q: string;
  a: string;
}

export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <div className="divide-y divide-gray-200">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={faq.q} className="py-4 first:pt-0 last:pb-0">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 rounded-md text-left font-semibold text-gray-900 transition hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
            >
              <span className="text-sm sm:text-base">{faq.q}</span>
              <span
                className={cn(
                  "shrink-0 rounded-full border border-gray-200 p-1 text-gray-400 transition-transform duration-300",
                  isOpen && "rotate-180 border-emerald-200 text-emerald-700"
                )}
              >
                <ChevronDown className="h-4 w-4" aria-hidden />
              </span>
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p className="text-sm leading-relaxed text-gray-600">{faq.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
