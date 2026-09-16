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
}

export function StandingsSeasonSelector({
  leagueSlug,
  seasons,
  selectedSeasonId,
  basePath = "/dashboard/leagues",
  subPath = "standings",
  tab,
}: StandingsSeasonSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {seasons.map((season) => {
        const isActive = season.id === selectedSeasonId;
        const tabQuery = tab ? `&tab=${tab}` : "";

        return (
          <Link
            key={season.id}
            href={`${basePath}/${leagueSlug}/${subPath}?seasonId=${season.id}${tabQuery}`}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${
              isActive
                ? "border-emerald-700 bg-emerald-700 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-emerald-600 hover:text-emerald-700"
            }`}
          >
            {season.name}
          </Link>
        );
      })}
    </div>
  );
}

