"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";
import {
  getNavigationForRole,
  getRoleDisplayName,
  type UserDashboardRole,
} from "@/components/dashboard/navigation-config";

interface DashboardSidebarProps {
  role?: UserDashboardRole;
}

export function DashboardSidebar({ role = "viewer" }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { all: menuItems } = getNavigationForRole(role);
  const roleLabel = getRoleDisplayName(role);

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:min-h-screen md:border-r md:border-gray-800 md:bg-gray-950 md:text-gray-100">
      <div className="px-6 py-8">
        <Eyebrow className="tracking-[0.18em] text-emerald-400">
          FutPro Manager
        </Eyebrow>
        <h2 className="mt-2 text-lg font-semibold text-white">Dashboard</h2>
        <p className="mt-0.5 text-xs text-emerald-400/80 font-medium">
          {roleLabel}
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 pb-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.exact || item.href === "/dashboard"
              ? pathname === item.href
              : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950",
                isActive
                  ? "bg-emerald-700 text-white font-semibold"
                  : "text-gray-400 hover:bg-gray-900 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
