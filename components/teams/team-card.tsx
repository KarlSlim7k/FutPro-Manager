import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Team } from "@/types/database";

type TeamCardData = Pick<
  Team,
  "id" | "name" | "slug" | "status" | "logo_url" | "primary_color" | "secondary_color" | "founded_year"
>;

interface TeamCardProps {
  leagueSlug: string;
  team: TeamCardData;
}

const statusStyles: Record<Team["status"], string> = {
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-gray-200 text-gray-700",
  archived: "bg-amber-100 text-amber-800",
};

function formatStatus(status: Team["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function TeamCard({ leagueSlug, team }: TeamCardProps) {
  return (
    <Card className="flex h-full flex-col justify-between">
      <div>
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="line-clamp-2 text-lg">{team.name}</CardTitle>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">/{team.slug}</p>
            </div>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[team.status]}`}>
              {formatStatus(team.status)}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {team.logo_url ? (
            <p className="text-sm text-gray-600">
              Logo:{" "}
              <a
                href={team.logo_url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-emerald-700 hover:text-emerald-600"
              >
                Disponible
              </a>
            </p>
          ) : (
            <p className="text-sm text-gray-600">Logo: No definido</p>
          )}

          <div className="space-y-2">
            {team.primary_color ? (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span
                  className="inline-flex h-4 w-4 rounded border border-gray-300"
                  style={{ backgroundColor: team.primary_color }}
                />
                Primario: {team.primary_color}
              </div>
            ) : null}

            {team.secondary_color ? (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span
                  className="inline-flex h-4 w-4 rounded border border-gray-300"
                  style={{ backgroundColor: team.secondary_color }}
                />
                Secundario: {team.secondary_color}
              </div>
            ) : null}

            {!team.primary_color && !team.secondary_color ? (
              <p className="text-sm text-gray-600">Colores: No definidos</p>
            ) : null}
          </div>

          <p className="text-sm text-gray-600">
            Fundación: {team.founded_year ? String(team.founded_year) : "No definido"}
          </p>
        </CardContent>
      </div>

      <CardContent className="pt-2">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/dashboard/leagues/${leagueSlug}/teams/${team.slug}`}
            className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
          >
            Ver detalle
          </Link>
          <Link
            href={`/dashboard/leagues/${leagueSlug}/teams/${team.slug}/roster`}
            className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
          >
            Plantilla
          </Link>
          <Link
            href={`/dashboard/leagues/${leagueSlug}/teams/${team.slug}/edit`}
            className="inline-flex items-center text-sm font-medium text-gray-600 transition hover:text-gray-800"
          >
            Editar
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
