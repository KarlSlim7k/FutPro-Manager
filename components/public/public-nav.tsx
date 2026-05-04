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
    { label: "Partidos", href: `/liga/${leagueSlug}/matches` },
  ];

  return (
    <nav className="flex flex-wrap gap-2 border-b border-gray-200 pb-1">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || (tab.href !== `/liga/${leagueSlug}` && pathname?.startsWith(`${tab.href}/`));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex items-center border-b-2 px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2",
              isActive
                ? "border-emerald-700 text-emerald-800"
                : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
