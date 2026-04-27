import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Season } from "@/types/database";

type SeasonCardData = Pick<Season, "name" | "slug" | "status" | "start_date" | "end_date">;

interface SeasonCardProps {
  leagueSlug: string;
  season: SeasonCardData;
}

function formatStatus(status: Season["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(date));
}

export function SeasonCard({ leagueSlug, season }: SeasonCardProps) {
  return (
    <Card className="flex h-full flex-col justify-between">
      <div>
        <CardHeader>
          <CardTitle className="line-clamp-2 text-lg">{season.name}</CardTitle>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">/{season.slug}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
            Estado: {formatStatus(season.status)}
          </span>
          <p className="text-sm text-gray-600">
            {formatDate(season.start_date)} - {formatDate(season.end_date)}
          </p>
        </CardContent>
      </div>

      <CardContent className="pt-2">
        <Link
          href={`/dashboard/leagues/${leagueSlug}/seasons/${season.slug}`}
          className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
        >
          Ver detalle
        </Link>
      </CardContent>
    </Card>
  );
}
