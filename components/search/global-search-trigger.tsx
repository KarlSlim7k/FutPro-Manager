"use client";

import { Search } from "lucide-react";
import { OPEN_SEARCH_EVENT } from "./global-search-modal";

interface GlobalSearchTriggerProps {
  className?: string;
  variant?: "button" | "input-lookalike";
}

export function GlobalSearchTrigger({
  className = "",
  variant = "input-lookalike",
}: GlobalSearchTriggerProps) {
  const handleClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT));
    }
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 p-2 text-gray-300 hover:border-emerald-400/40 hover:bg-white/10 hover:text-white transition active:scale-95 ${className}`}
        title="Buscar (⌘K)"
      >
        <Search className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-gray-400 hover:border-emerald-400/40 hover:bg-white/10 hover:text-gray-200 transition shadow-sm ${className}`}
      title="Buscador global (⌘K)"
    >
      <div className="flex items-center gap-2">
        <Search className="h-3.5 w-3.5 text-emerald-400" />
        <span>Buscar ligas, equipos...</span>
      </div>
      <kbd className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-gray-300">
        ⌘K
      </kbd>
    </button>
  );
}
