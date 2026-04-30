import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatusBadge } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
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
          <Eyebrow className="font-medium">/{season.slug}</Eyebrow>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatusBadge variant="success">
            Estado: {formatStatus(season.status)}
          </StatusBadge>
          <p className="text-sm text-gray-600">
            {formatDate(season.start_date)} - {formatDate(season.end_date)}
          </p>
        </CardContent>
      </div>

      <CardContent className="pt-2">
        <TextLink
          href={`/dashboard/leagues/${leagueSlug}/seasons/${season.slug}`}
        >
          Ver detalle
        </TextLink>
      </CardContent>
    </Card>
  );
}
