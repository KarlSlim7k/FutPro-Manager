import Link from "next/link";
import type { League } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LeagueCardData = Pick<
  League,
  "id" | "name" | "slug" | "region" | "city" | "state" | "country" | "status" | "is_public" | "created_at"
>;

interface LeagueCardProps {
  league: LeagueCardData;
}

function formatStatus(status: League["status"]) {
  return status.replace(/_/g, " ");
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(date));
}

function getLocation(league: LeagueCardData) {
  return [league.city, league.state, league.region, league.country]
    .filter((value): value is string => Boolean(value))
    .join(", ");
}

export function LeagueCard({ league }: LeagueCardProps) {
  return (
    <Card className="flex h-full flex-col justify-between">
      <div>
        <CardHeader>
          <CardTitle className="line-clamp-2 text-lg">{league.name}</CardTitle>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            /{league.slug}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">{getLocation(league) || "Sin ubicación"}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
              Estado: {formatStatus(league.status)}
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-800">
              {league.is_public ? "Pública" : "Privada"}
            </span>
          </div>
          <p className="text-xs text-gray-500">Creada: {formatDate(league.created_at)}</p>
        </CardContent>
      </div>
      <CardContent className="pt-2">
        <Link
          href={`/dashboard/leagues/${league.slug}`}
          className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
        >
          Ver detalle
        </Link>
      </CardContent>
    </Card>
  );
}
