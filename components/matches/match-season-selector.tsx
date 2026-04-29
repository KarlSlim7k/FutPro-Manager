import Link from "next/link";

interface MatchSeasonOption {
  id: string;
  name: string;
}

interface MatchSeasonSelectorProps {
  leagueSlug: string;
  seasons: MatchSeasonOption[];
  selectedSeasonId: string;
}

export function MatchSeasonSelector({
  leagueSlug,
  seasons,
  selectedSeasonId,
}: MatchSeasonSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {seasons.map((season) => {
        const isActive = season.id === selectedSeasonId;

        return (
          <Link
            key={season.id}
            href={`/dashboard/leagues/${leagueSlug}/matches?seasonId=${season.id}`}
            className={`inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-emerald-500 hover:text-emerald-700"
            }`}
          >
            {season.name}
          </Link>
        );
      })}
    </div>
  );
}
