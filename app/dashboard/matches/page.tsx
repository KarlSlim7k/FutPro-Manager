import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextLink } from "@/components/ui/text-link";
import { StatusBadge } from "@/components/ui/status-badge";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
import { MatchStatusBadge } from "@/components/matches/match-status-badge";
import { createClient } from "@/lib/supabase/server";
import type { League, MatchStatus } from "@/types/database";

type LeagueItem = Pick<League, "id" | "name" | "slug" | "status">;

interface AssignedMatchItem {
  id: string;
  leagueId: string;
  leagueName: string;
  leagueSlug: string;
  homeTeamName: string;
  awayTeamName: string;
  venueName: string | null;
  scheduledAt: string;
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  roundName: string | null;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function MatchesHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Fetch matches assigned to current user as referee
  let assignedMatches: AssignedMatchItem[] = [];
  const { data: rawAssignedMatches } = await supabase
    .from("matches")
    .select(
      "id, league_id, season_id, home_team_id, away_team_id, venue_id, scheduled_at, status, home_score, away_score, round_name"
    )
    .eq("referee_id", user.id)
    .order("scheduled_at", { ascending: true });

  const assignedList = rawAssignedMatches ?? [];
  if (assignedList.length > 0) {
    const leagueIds = [...new Set(assignedList.map((m) => m.league_id))];
    const teamIds = [
      ...new Set(assignedList.flatMap((m) => [m.home_team_id, m.away_team_id])),
    ];
    const venueIds = [
      ...new Set(
        assignedList
          .map((m) => m.venue_id)
          .filter((id): id is string => id !== null)
      ),
    ];

    const [
      { data: leaguesInfo },
      { data: teamsInfo },
      { data: venuesInfo },
    ] = await Promise.all([
      supabase.from("leagues").select("id, name, slug").in("id", leagueIds),
      supabase.from("teams").select("id, name").in("id", teamIds),
      venueIds.length > 0
        ? supabase.from("venues").select("id, name").in("id", venueIds)
        : Promise.resolve({ data: [] }),
    ]);

    const leagueMap = new Map((leaguesInfo ?? []).map((l) => [l.id, l]));
    const teamMap = new Map((teamsInfo ?? []).map((t) => [t.id, t.name]));
    const venueMap = new Map((venuesInfo ?? []).map((v) => [v.id, v.name]));

    assignedMatches = assignedList.map((m) => {
      const lg = leagueMap.get(m.league_id);
      return {
        id: m.id,
        leagueId: m.league_id,
        leagueName: lg?.name ?? "Liga",
        leagueSlug: lg?.slug ?? "",
        homeTeamName: teamMap.get(m.home_team_id) ?? "Equipo local",
        awayTeamName: teamMap.get(m.away_team_id) ?? "Equipo visitante",
        venueName: m.venue_id ? (venueMap.get(m.venue_id) ?? null) : null,
        scheduledAt: m.scheduled_at,
        status: m.status as MatchStatus,
        homeScore: m.home_score,
        awayScore: m.away_score,
        roundName: m.round_name,
      };
    });
  }

  // 2. Fetch leagues catalog
  const { data, error } = await supabase
    .from("leagues")
    .select("id, name, slug, status")
    .order("created_at", { ascending: false });

  if (error) throw error;
  const leagues = (data ?? []) as LeagueItem[];

  return (
    <section className="space-y-8">
      <PageHeader
        title="Partidos"
        description="Gestiona tus partidos asignados o navega por liga."
        backHref="/dashboard"
        backLabel="Dashboard"
      />

      {/* Sección Mis partidos asignados (para árbitros con designaciones) */}
      {assignedMatches.length > 0 ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Mis partidos asignados
            </h2>
            <p className="text-sm text-gray-600">
              Partidos donde estás designado como árbitro oficial.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assignedMatches.map((m) => (
              <Card key={m.id} className="flex flex-col justify-between">
                <CardHeader className="space-y-2 pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                      Árbitro asignado
                    </span>
                    <MatchStatusBadge status={m.status} />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-gray-900">
                      {m.homeTeamName} vs {m.awayTeamName}
                    </CardTitle>
                    <p className="text-xs text-gray-500">
                      {m.leagueName} • {m.roundName || "Jornada no definida"}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-sm text-gray-700">
                  <p>
                    <span className="font-medium text-gray-900">Fecha y hora:</span>{" "}
                    {formatDateTime(m.scheduledAt)}
                  </p>
                  <p>
                    <span className="font-medium text-gray-900">Sede:</span>{" "}
                    {m.venueName || "Sin sede asignada"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-900">Marcador:</span>{" "}
                    {m.homeScore} - {m.awayScore}
                  </p>

                  <ToolbarActions className="pt-2">
                    <TextLink
                      href={`/dashboard/leagues/${m.leagueSlug}/matches/${m.id}`}
                    >
                      Detalle
                    </TextLink>
                    {m.status !== "cancelled" ? (
                      <TextLink
                        href={`/dashboard/leagues/${m.leagueSlug}/matches/${m.id}/result`}
                      >
                        Resultado
                      </TextLink>
                    ) : null}
                    {m.status !== "cancelled" ? (
                      <TextLink
                        href={`/dashboard/leagues/${m.leagueSlug}/matches/${m.id}/events`}
                      >
                        Eventos
                      </TextLink>
                    ) : null}
                    <TextLink
                      href={`/dashboard/leagues/${m.leagueSlug}/matches/${m.id}/cedula`}
                    >
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" aria-hidden /> Cédula
                      </span>
                    </TextLink>
                  </ToolbarActions>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      {/* Sección Explorar por liga */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {assignedMatches.length > 0 ? "Explorar por liga" : "Ligas disponibles"}
          </h2>
          <p className="text-sm text-gray-600">
            Selecciona una liga para gestionar o consultar sus partidos.
          </p>
        </div>

        {leagues.length === 0 ? (
          <EmptyState
            title="Sin ligas disponibles"
            description="Primero crea una liga para poder gestionar partidos."
            action={<TextLink href="/dashboard/leagues">Ir a Ligas</TextLink>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {leagues.map((league) => (
              <Card key={league.id} className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-base">{league.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <StatusBadge
                    variant={league.status === "active" ? "success" : "neutral"}
                  >
                    {league.status}
                  </StatusBadge>
                  <div>
                    <Link
                      href={`/dashboard/leagues/${league.slug}/matches`}
                      className="inline-flex items-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                    >
                      Ver partidos
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
