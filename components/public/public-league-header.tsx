import { Card, CardContent } from "@/components/ui/card";
import type { League } from "@/types/database";

type PublicLeagueHeaderProps = {
  league: Pick<League, "name" | "slug" | "description" | "status">;
};

export function PublicLeagueHeader({ league }: PublicLeagueHeaderProps) {
  return (
    <Card className="border-gray-200 bg-white">
      <CardContent className="space-y-2 p-5">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {league.name}
        </h1>
        {league.description ? (
          <p className="text-sm text-gray-600">{league.description}</p>
        ) : null}
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {league.status === "active" ? "Liga activa" : `Estado: ${league.status}`}
        </p>
      </CardContent>
    </Card>
  );
}
