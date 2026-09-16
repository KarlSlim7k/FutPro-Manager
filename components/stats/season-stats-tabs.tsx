"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Trophy, Target, ShieldAlert, Swords, Zap, ShieldCheck } from "lucide-react";

export type StatsTabType = "standings" | "scorers" | "assists" | "clean-sheets" | "fair-play" | "playoffs";

interface SeasonStatsTabsProps {
  currentTab: StatsTabType;
  basePath: string;
  allowedTabs?: StatsTabType[];
  defaultTab?: StatsTabType;
}

const ALL_TABS: { id: StatsTabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    id: "standings",
    label: "Clasificación General",
    icon: Trophy,
  },
  {
    id: "playoffs",
    label: "Liguilla / Eliminatorias",
    icon: Swords,
  },
  {
    id: "scorers",
    label: "Goleo Individual",
    icon: Target,
  },
  {
    id: "assists",
    label: "Máximos Asistentes",
    icon: Zap,
  },
  {
    id: "clean-sheets",
    label: "Vallas Invictas",
    icon: ShieldCheck,
  },
  {
    id: "fair-play",
    label: "Juego Limpio / Tarjetas",
    icon: ShieldAlert,
  },
];

export function SeasonStatsTabs({
  currentTab,
  basePath,
  allowedTabs,
  defaultTab = "standings",
}: SeasonStatsTabsProps) {
  const searchParams = useSearchParams();

  const tabs = allowedTabs
    ? ALL_TABS.filter((t) => allowedTabs.includes(t.id))
    : ALL_TABS;

  const createTabHref = (tab: StatsTabType) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === defaultTab) {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    return `${basePath}${query ? `?${query}` : ""}`;
  };

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto pb-1 sm:pb-0" aria-label="Tabs de estadísticas">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={createTabHref(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-emerald-600 text-emerald-700 font-semibold"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
