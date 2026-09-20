"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import type { TutorialFaqItem } from "@/types/database";
import { cn } from "@/lib/utils";

export interface TutorialFaqProps {
  faq: TutorialFaqItem[];
}

export function TutorialFaq({ faq }: TutorialFaqProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  if (!faq || faq.length === 0) {
    return null;
  }

  const toggleItem = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
        <HelpCircle className="h-5 w-5 text-blue-600" aria-hidden="true" />
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">
          Preguntas Frecuentes (FAQ)
        </h2>
      </div>

      <div className="divide-y divide-gray-100">
        {faq.map((item, index) => {
          const isOpen = openIndexes.includes(index);
          const buttonId = `faq-btn-${index}`;
          const panelId = `faq-panel-${index}`;

          return (
            <div key={index} className="py-3.5 first:pt-0 last:pb-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(index)}
                className="flex w-full items-center justify-between text-left font-medium text-gray-900 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded p-1 transition-colors"
              >
                <span className="text-sm sm:text-base pr-4">{item.q}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200",
                    isOpen && "rotate-180 text-blue-600"
                  )}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="mt-2.5 text-sm text-gray-600 leading-relaxed pl-1"
                >
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
