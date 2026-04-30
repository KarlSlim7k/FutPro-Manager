import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";

const menuItems = [
  { label: "Panel de control", href: "/dashboard", enabled: true },
  { label: "Ligas", href: "/dashboard/leagues", enabled: true },
  { label: "Equipos", href: "#", enabled: false },
  { label: "Jugadores", href: "#", enabled: false },
  { label: "Partidos", href: "#", enabled: false },
  { label: "Tipos", href: "#", enabled: false },
];

export function DashboardSidebar() {
  return (
    <aside className="w-full border-b border-gray-200 bg-gray-950 text-gray-100 md:min-h-screen md:w-64 md:border-b-0 md:border-r md:border-gray-800">
      <div className="px-5 py-4 md:px-6 md:py-8">
        <Eyebrow className="tracking-[0.18em] text-emerald-400">
          FutPro Manager
        </Eyebrow>
        <h2 className="mt-2 text-lg font-semibold text-white">Dashboard</h2>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-3 pb-4 md:block md:space-y-1 md:px-3 md:pb-0">
        {menuItems.map((item) =>
          item.enabled ? (
            <Link
              key={item.label}
              href={item.href}
              className="inline-flex min-w-max items-center rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 md:flex md:w-full"
            >
              {item.label}
            </Link>
          ) : (
            <span
              key={item.label}
              className="inline-flex min-w-max items-center rounded-lg border border-gray-800 px-4 py-2 text-sm text-gray-400 md:flex md:w-full"
            >
              {item.label}
            </span>
          )
        )}
      </nav>
    </aside>
  );
}
