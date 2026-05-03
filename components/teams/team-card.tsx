import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ExternalTextLink } from "@/components/ui/external-text-link";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
import type { Team } from "@/types/database";

type TeamCardData = Pick<
  Team,
  "id" | "name" | "slug" | "status" | "logo_url" | "primary_color" | "secondary_color" | "founded_year"
>;

interface TeamCardProps {
  leagueSlug: string;
  team: TeamCardData;
}

const statusVariants: Record<Team["status"], StatusBadgeVariant> = {
  active: "success",
  inactive: "neutral",
  archived: "warning",
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
            <div className="min-w-0">
              <CardTitle className="line-clamp-2 text-lg">{team.name}</CardTitle>
              <Eyebrow className="font-medium">/{team.slug}</Eyebrow>
            </div>
            <StatusBadge variant={statusVariants[team.status]}>
              {formatStatus(team.status)}
            </StatusBadge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {team.logo_url ? (
            <p className="text-sm text-gray-600">
              Logo:{" "}
              <ExternalTextLink
                href={team.logo_url}
                className="text-sm font-medium"
                aria-label={`Abrir logo de ${team.name} en una nueva pestaña`}
              >
                Disponible
              </ExternalTextLink>
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
        <ToolbarActions>
          <TextLink
            href={`/dashboard/leagues/${leagueSlug}/teams/${team.slug}`}
          >
            Ver detalle
          </TextLink>
          <TextLink
            href={`/dashboard/leagues/${leagueSlug}/teams/${team.slug}/roster`}
          >
            Plantilla
          </TextLink>
          <TextLink
            href={`/dashboard/leagues/${leagueSlug}/teams/${team.slug}/edit`}
            variant="muted"
          >
            Editar
          </TextLink>
        </ToolbarActions>
      </CardContent>
    </Card>
  );
}
