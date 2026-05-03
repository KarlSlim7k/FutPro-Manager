import type { League } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatusBadge } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";

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
          <Eyebrow className="font-medium">/{league.slug}</Eyebrow>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">{getLocation(league) || "Sin ubicación"}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <StatusBadge variant="neutral">
              Estado: {formatStatus(league.status)}
            </StatusBadge>
            <StatusBadge variant={league.is_public ? "success" : "info"}>
              {league.is_public ? "Pública" : "Privada"}
            </StatusBadge>
          </div>
          <p className="text-xs text-gray-500">Creada: {formatDate(league.created_at)}</p>
        </CardContent>
      </div>
      <CardContent className="pt-2">
        <TextLink
          href={`/dashboard/leagues/${league.slug}`}
        >
          Ver detalle
        </TextLink>
      </CardContent>
    </Card>
  );
}
