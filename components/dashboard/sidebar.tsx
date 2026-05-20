"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Panel de control", href: "/dashboard" },
  { label: "Ligas", href: "/dashboard/leagues" },
  { label: "Equipos", href: "/dashboard/teams" },
  { label: "Jugadores", href: "/dashboard/players" },
  { label: "Partidos", href: "/dashboard/matches" },
  { label: "Tipos", href: "/dashboard/types" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-gray-200 bg-gray-950 text-gray-100 md:min-h-screen md:w-64 md:border-b-0 md:border-r md:border-gray-800">
      <div className="px-5 py-4 md:px-6 md:py-8">
        <Eyebrow className="tracking-[0.18em] text-emerald-400">
          FutPro Manager
        </Eyebrow>
        <h2 className="mt-2 text-lg font-semibold text-white">Dashboard</h2>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-3 pb-4 md:block md:space-y-1 md:px-3 md:pb-0">
        {menuItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "inline-flex min-w-max items-center rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 md:flex md:w-full",
                isActive
                  ? "bg-emerald-700 text-white"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
