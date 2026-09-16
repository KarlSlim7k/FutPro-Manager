"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type PublicNavProps = {
  leagueSlug: string;
};

export function PublicNav({ leagueSlug }: PublicNavProps) {
  const pathname = usePathname();

  const tabs = [
    { label: "Resumen", href: `/liga/${leagueSlug}` },
    { label: "Tabla de posiciones", href: `/liga/${leagueSlug}/standings` },
    { label: "Estadísticas", href: `/liga/${leagueSlug}/stats` },
    { label: "Partidos", href: `/liga/${leagueSlug}/matches` },
    { label: "Equipos", href: `/liga/${leagueSlug}/teams` },
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto no-scrollbar border-b border-white/10 pb-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href ||
          (tab.href !== `/liga/${leagueSlug}` && pathname?.startsWith(`${tab.href}/`));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex min-h-[42px] items-center whitespace-nowrap border-b-2 px-3.5 py-2 text-xs sm:text-sm font-semibold transition touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-t-xl",
              isActive
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
