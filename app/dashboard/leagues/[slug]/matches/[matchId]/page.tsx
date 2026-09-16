import { notFound, redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { UpdateMatchResultForm } from "@/components/matches/update-match-result-form";
import { MatchStatusBadge } from "@/components/matches/match-status-badge";
import { RefereeAssignmentCard } from "@/components/referees/referee-assignment-card";
import { RefereeAssignmentForm } from "@/components/referees/referee-assignment-form";
import { RefereeHistory, type RefereeHistoryEntry } from "@/components/referees/referee-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ExternalTextLink } from "@/components/ui/external-text-link";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
import { MatchShareCard } from "@/components/social/match-share-card";
import { createClient } from "@/lib/supabase/server";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import { canOfficiateMatch } from "@/lib/permissions/match-permissions";
import type { League, Match, Season, Team, Venue } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type MatchDetail = Pick<
  Match,
  | "id"
  | "league_id"
  | "season_id"
  | "home_team_id"
  | "away_team_id"
  | "venue_id"
  | "scheduled_at"
  | "status"
  | "home_score"
  | "away_score"
  | "round_name"
  | "created_at"
  | "referee_id"
>;
type SeasonSummary = Pick<Season, "id" | "name">;
type TeamSummary = Pick<Team, "id" | "name">;
type VenueSummary = Pick<
  Venue,
  "id" | "name" | "address" | "city" | "state" | "latitude" | "longitude"
>;

interface MatchDetailPageProps {
  params: Promise<{ slug: string; matchId: string }>;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function getVenueLocation(venue: VenueSummary | null) {
  if (!venue) {
    return "Sin sede asignada";
  }

  return [venue.address, venue.city, venue.state].filter(Boolean).join(", ") || "Ubicación no definida";
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { slug, matchId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: leagueData, error: leagueError } = await supabase
    .from("leagues")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (leagueError) {
    throw leagueError;
  }

  if (!leagueData) {
    notFound();
  }

  const league = leagueData as LeagueSummary;

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .select("id, league_id, season_id, home_team_id, away_team_id, venue_id, scheduled_at, status, home_score, away_score, round_name, created_at, referee_id")
    .eq("id", matchId)
    .eq("league_id", league.id)
    .maybeSingle();

  if (matchError) {
    throw matchError;
  }

  if (!matchData) {
    notFound();
  }

  const match = matchData as MatchDetail;

  const isAssignedReferee = match.referee_id === user.id;
  const canOfficiateThisMatch = canOfficiateMatch(permissions, user.id, match.referee_id);
  const isStaffForMatch = permissions.staffTeamIds.some(
    (teamId) => teamId === match.home_team_id || teamId === match.away_team_id
  );
  const canUpdateThisResult = permissions.canManageLeague || canOfficiateThisMatch;
  const canManageThisEvents =
    permissions.canManageLeague || canOfficiateThisMatch || isStaffForMatch;

  const [seasonResult, homeTeamResult, awayTeamResult, venueResult] = await Promise.all([
    supabase
      .from("seasons")
      .select("id, name")
      .eq("id", match.season_id)
      .eq("league_id", league.id)
      .maybeSingle(),
    supabase
      .from("teams")
      .select("id, name")
      .eq("id", match.home_team_id)
      .eq("league_id", league.id)
      .maybeSingle(),
    supabase
      .from("teams")
      .select("id, name")
      .eq("id", match.away_team_id)
      .eq("league_id", league.id)
      .maybeSingle(),
    match.venue_id
      ? supabase
          .from("venues")
          .select("id, name, address, city, state, latitude, longitude")
          .eq("id", match.venue_id)
          .eq("league_id", league.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (seasonResult.error) throw seasonResult.error;
  if (homeTeamResult.error) throw homeTeamResult.error;
  if (awayTeamResult.error) throw awayTeamResult.error;
  if (venueResult.error) throw venueResult.error;

  const season = seasonResult.data as SeasonSummary | null;
  const homeTeam = homeTeamResult.data as TeamSummary | null;
  const awayTeam = awayTeamResult.data as TeamSummary | null;
  const venue = venueResult.data as VenueSummary | null;

  const hasVenueCoordinates =
    venue !== null && venue.latitude !== null && venue.longitude !== null;
  const googleMapsUrl = hasVenueCoordinates
    ? `https://www.google.com/maps?q=${venue.latitude},${venue.longitude}`
    : null;

  // Fetch referee profile if assigned
  let refereeName: string | null = null;
  if (match.referee_id) {
    const { data: refereeProfile } = await supabase
      .from("profiles")
      .select("id, full_name, display_name")
      .eq("id", match.referee_id)
      .maybeSingle();

    if (refereeProfile) {
      refereeName = refereeProfile.display_name || refereeProfile.full_name || null;
    }
  }

  // Fetch available referees for assignment form (only for users who can assign)
  let availableReferees: { id: string; name: string }[] = [];

  if (permissions.canAssignReferees) {
    const { data: refereeMembersData } = await supabase
      .from("league_members")
      .select("profile_id, role")
      .eq("league_id", league.id)
      .in("role", ["referee", "league_admin"]);

    const refereeMembers = refereeMembersData ?? [];

    if (refereeMembers.length > 0) {
      const refereeProfileIds = refereeMembers.map((m) => m.profile_id);
      const { data: refereeProfiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name")
        .in("id", refereeProfileIds);

      if (refereeProfiles) {
        availableReferees = refereeProfiles.map((p) => ({
          id: p.id,
          name: p.display_name || p.full_name || `Usuario ${p.id.slice(0, 8)}...`,
        }));
      }
    }
  }

  // Historial de arbitraje desde auditoría (solo si puede ver asignaciones)
  let refereeHistory: RefereeHistoryEntry[] = [];

  if (permissions.canViewRefereeAssignments) {
    const { data: historyData } = await supabase
      .from("audit_logs")
      .select("id, action, actor_id, metadata, created_at")
      .eq("league_id", league.id)
      .eq("entity_type", "match")
      .eq("entity_id", match.id)
      .in("action", ["match.referee_updated", "match.referee_removed"])
      .order("created_at", { ascending: false })
      .limit(20);

    const historyRows = historyData ?? [];
    if (historyRows.length > 0) {
      const nameIds = new Set<string>();
      for (const row of historyRows) {
        const meta = (row.metadata ?? {}) as Record<string, unknown>;
        if (typeof meta.previous_referee_id === "string") nameIds.add(meta.previous_referee_id);
        if (typeof meta.new_referee_id === "string") nameIds.add(meta.new_referee_id);
        if (row.actor_id) nameIds.add(row.actor_id as string);
      }
      let namesMap = new Map<string, string>();
      if (nameIds.size > 0) {
        const { data: historyProfiles } = await supabase
          .from("profiles")
          .select("id, full_name, display_name")
          .in("id", [...nameIds]);
        if (historyProfiles) {
          namesMap = new Map(
            historyProfiles.map((p) => [
              p.id,
              p.display_name || p.full_name || `Usuario ${p.id.slice(0, 8)}...`,
            ])
          );
        }
      }
      refereeHistory = historyRows.map((row) => {
        const meta = (row.metadata ?? {}) as Record<string, unknown>;
        const prevId = typeof meta.previous_referee_id === "string" ? meta.previous_referee_id : null;
        const newId = typeof meta.new_referee_id === "string" ? meta.new_referee_id : null;
        return {
          id: row.id as string,
          action: row.action as string,
          previousRefereeName: prevId ? (namesMap.get(prevId) ?? `Usuario ${prevId.slice(0, 8)}...`) : null,
          newRefereeName: newId ? (namesMap.get(newId) ?? `Usuario ${newId.slice(0, 8)}...`) : null,
          actorName: row.actor_id ? (namesMap.get(row.actor_id as string) ?? null) : null,
          createdAt: row.created_at as string,
        };
      });
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        backHref={`/dashboard/leagues/${league.slug}/matches`}
        backLabel="Volver a partidos"
        title="Detalle de partido"
        description={`${homeTeam?.name ?? "Equipo local"} vs ${awayTeam?.name ?? "Equipo visitante"}`}
        action={
          <ToolbarActions>
            {permissions.canManageMatches ? (
              <TextLink href={`/dashboard/leagues/${league.slug}/matches/${match.id}/edit`}>
                Editar partido
              </TextLink>
            ) : null}
            {match.status === "cancelled" ? (
              canUpdateThisResult ? (
                <span className="inline-flex items-center text-sm font-medium text-gray-500">
                  Resultado no disponible para partidos cancelados.
                </span>
              ) : null
            ) : canUpdateThisResult ? (
              <TextLink href={`/dashboard/leagues/${league.slug}/matches/${match.id}/result`}>
                Capturar resultado
              </TextLink>
            ) : null}
            {match.status === "cancelled" ? (
              canManageThisEvents ? (
                <span className="inline-flex items-center text-sm font-medium text-gray-500">
                  Eventos no disponibles para partidos cancelados.
                </span>
              ) : null
            ) : canManageThisEvents ? (
              <TextLink href={`/dashboard/leagues/${league.slug}/matches/${match.id}/events`}>
                Eventos
              </TextLink>
            ) : null}
            <TextLink href={`/dashboard/leagues/${league.slug}/matches/${match.id}/cedula`}>
              <span className="inline-flex items-center gap-1.5"><FileText className="h-4 w-4" aria-hidden /> Cédula oficial</span>
            </TextLink>
          </ToolbarActions>
        }
      />

      {isAssignedReferee ? (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                Árbitro oficial designado
              </span>
              <MatchStatusBadge status={match.status} />
            </div>
            <CardTitle className="text-base text-blue-950">
              Panel arbitral del encuentro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-blue-900">
              Tienes la designación oficial para este partido. Puedes capturar el resultado técnico, registrar eventos disciplinarios e incidencias, y emitir o imprimir la cédula oficial del partido.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-sm">
              {match.status !== "cancelled" ? (
                <TextLink href={`/dashboard/leagues/${league.slug}/matches/${match.id}/result`}>
                  Capturar resultado
                </TextLink>
              ) : null}
              {match.status !== "cancelled" ? (
                <TextLink href={`/dashboard/leagues/${league.slug}/matches/${match.id}/events`}>
                  Registrar eventos
                </TextLink>
              ) : null}
              <TextLink href={`/dashboard/leagues/${league.slug}/matches/${match.id}/cedula`}>
                <span className="inline-flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" aria-hidden /> Cédula oficial
                </span>
              </TextLink>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Información del encuentro</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Eyebrow>Liga</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{league.name}</p>
          </div>
          <div>
            <Eyebrow>Temporada</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{season?.name ?? "No disponible"}</p>
          </div>
          <div>
            <Eyebrow>Jornada / Ronda</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{match.round_name || "No definida"}</p>
          </div>
          <div>
            <Eyebrow>Estado</Eyebrow>
            <p className="mt-1">
              <MatchStatusBadge status={match.status} />
            </p>
          </div>
          <div>
            <Eyebrow>Equipo local</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{homeTeam?.name ?? "No disponible"}</p>
          </div>
          <div>
            <Eyebrow>Equipo visitante</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{awayTeam?.name ?? "No disponible"}</p>
          </div>
          <div>
            <Eyebrow>Marcador actual</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">
              {match.home_score} - {match.away_score}
            </p>
          </div>
          <div>
            <Eyebrow>Fecha y hora programada</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{formatDateTime(match.scheduled_at)}</p>
          </div>
          <div className="sm:col-span-2">
            <Eyebrow>Sede / Cancha</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{venue?.name ?? "Sin sede asignada"}</p>
            <p className="mt-1 text-sm text-gray-600">{getVenueLocation(venue)}</p>
            {googleMapsUrl ? (
              <ExternalTextLink
                href={googleMapsUrl}
                className="mt-2"
              >
                Ver en Google Maps
              </ExternalTextLink>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <Eyebrow>Fecha de creación</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{formatDateTime(match.created_at)}</p>
          </div>
          <div className="sm:col-span-2 border-t border-gray-100 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <Eyebrow>Difusión y Redes Sociales</Eyebrow>
              <p className="mt-1 text-xs text-gray-500">
                Genera la tarjeta gráfica oficial en formato PNG o comparte el resultado directo a WhatsApp.
              </p>
            </div>
            <MatchShareCard
              leagueName={league.name}
              seasonName={season?.name}
              roundName={match.round_name}
              homeTeamName={homeTeam?.name ?? "Local"}
              awayTeamName={awayTeam?.name ?? "Visitante"}
              homeScore={match.home_score}
              awayScore={match.away_score}
              matchStatus={match.status}
              matchDate={formatDateTime(match.scheduled_at)}
              matchUrl={`/liga/${league.slug}/matches/${match.id}`}
            />
          </div>
        </CardContent>
      </Card>

      {permissions.canViewRefereeAssignments ? (
        <RefereeAssignmentCard
          refereeName={isAssignedReferee ? `${refereeName ?? "Tú"} (Tú / Designado)` : refereeName}
          refereeId={match.referee_id}
          canAssign={permissions.canAssignReferees}
          assignmentForm={
            permissions.canAssignReferees ? (
              <RefereeAssignmentForm
                leagueSlug={league.slug}
                matchId={match.id}
                currentRefereeId={match.referee_id}
                availableReferees={availableReferees}
              />
            ) : null
          }
        />
      ) : null}

      {permissions.canViewRefereeAssignments ? <RefereeHistory entries={refereeHistory} /> : null}

      {match.status === "completed" && canUpdateThisResult ? (
        <Card>
          <CardHeader>
            <CardTitle>Ajuste administrativo de resultado y estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Usa este formulario para corregir marcador o cambiar el estado del partido
              finalizado (por ejemplo, volverlo a programado, en juego, pospuesto o cancelado).
            </p>
            <UpdateMatchResultForm
              leagueSlug={league.slug}
              matchId={match.id}
              initialHomeScore={match.home_score}
              initialAwayScore={match.away_score}
              initialStatus={match.status}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Próximas fases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>Captura de resultado: disponible.</p>
          <p>Eventos del partido: disponible.</p>
          <p>Alineaciones: módulo pendiente.</p>
          <p>Estadísticas: módulo pendiente.</p>
        </CardContent>
      </Card>
    </section>
  );
}
