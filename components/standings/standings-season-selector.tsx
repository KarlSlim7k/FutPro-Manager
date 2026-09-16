import Link from "next/link";
import type { Season } from "@/types/database";

type SeasonOption = Pick<Season, "id" | "name">;

interface StandingsSeasonSelectorProps {
  leagueSlug: string;
  seasons: SeasonOption[];
  selectedSeasonId: string;
  basePath?: string;
  subPath?: string;
  tab?: string;
  theme?: "light" | "dark";
}

export function StandingsSeasonSelector({
  leagueSlug,
  seasons,
  selectedSeasonId,
  basePath = "/dashboard/leagues",
  subPath = "standings",
  tab,
  theme,
}: StandingsSeasonSelectorProps) {
  const isDark = theme === "dark" || (theme === undefined && basePath.startsWith("/liga"));

  return (
    <div className="flex flex-wrap gap-2">
      {seasons.map((season) => {
        const isActive = season.id === selectedSeasonId;
        const tabQuery = tab ? `&tab=${tab}` : "";

        const activeClass = isDark
          ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300 font-semibold shadow-sm"
          : "border-emerald-700 bg-emerald-700 text-white";

        const inactiveClass = isDark
          ? "border-white/10 bg-white/5 text-gray-300 hover:border-emerald-500/30 hover:text-white hover:bg-white/10"
          : "border-gray-300 bg-white text-gray-700 hover:border-emerald-600 hover:text-emerald-700";

        return (
          <Link
            key={season.id}
            href={`${basePath}/${leagueSlug}/${subPath}?seasonId=${season.id}${tabQuery}`}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
              isActive ? activeClass : inactiveClass
            }`}
          >
            {season.name}
          </Link>
        );
      })}
    </div>
  );
}

