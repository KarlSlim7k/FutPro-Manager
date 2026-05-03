import { notFound, redirect } from "next/navigation";
import { MatchResultForm } from "@/components/matches/match-result-form";
import { MatchStatusBadge } from "@/components/matches/match-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import type { League, Match, Season, Team, Venue } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type MatchSummary = Pick<
  Match,
  | "id"
  | "season_id"
  | "home_team_id"
  | "away_team_id"
  | "venue_id"
  | "scheduled_at"
  | "status"
  | "home_score"
  | "away_score"
  | "round_name"
>;
type SeasonSummary = Pick<Season, "id" | "name">;
type TeamSummary = Pick<Team, "id" | "name">;
type VenueSummary = Pick<Venue, "id" | "name">;

interface MatchResultPageProps {
  params: Promise<{ slug: string; matchId: string }>;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function MatchResultPage({ params }: MatchResultPageProps) {
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

  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .select("id, season_id, home_team_id, away_team_id, venue_id, scheduled_at, status, home_score, away_score, round_name")
    .eq("id", matchId)
    .eq("league_id", league.id)
    .maybeSingle();

  if (matchError) {
    throw matchError;
  }

  if (!matchData) {
    notFound();
  }

  const match = matchData as MatchSummary;

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
          .select("id, name")
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

  const homeTeamName = homeTeam?.name ?? "Equipo local";
  const awayTeamName = awayTeam?.name ?? "Equipo visitante";
  const hasValidTeams = homeTeam !== null && awayTeam !== null;

  return (
    <section className="space-y-6">
      <PageHeader
        backHref={`/dashboard/leagues/${league.slug}/matches/${match.id}`}
        backLabel="Volver al detalle del partido"
        title="Capturar resultado"
        description={`${homeTeamName} vs ${awayTeamName}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Contexto del partido</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Eyebrow>Temporada</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{season?.name ?? "No disponible"}</p>
          </div>
          <div>
            <Eyebrow>Estado actual</Eyebrow>
            <p className="mt-1">
              <MatchStatusBadge status={match.status} />
            </p>
          </div>
          <div>
            <Eyebrow>Jornada / Ronda</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{match.round_name || "No definida"}</p>
          </div>
          <div>
            <Eyebrow>Fecha y hora programada</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{formatDateTime(match.scheduled_at)}</p>
          </div>
          <div>
            <Eyebrow>Sede / Cancha</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{venue?.name ?? "Sin sede asignada"}</p>
          </div>
          <div>
            <Eyebrow>Marcador actual</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">
              {match.home_score} - {match.away_score}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado final</CardTitle>
        </CardHeader>
        <CardContent>
          <MatchResultForm
            leagueSlug={league.slug}
            matchId={match.id}
            matchStatus={match.status}
            homeTeamName={homeTeamName}
            awayTeamName={awayTeamName}
            initialHomeScore={match.home_score}
            initialAwayScore={match.away_score}
            hasValidTeams={hasValidTeams}
          />
        </CardContent>
      </Card>
    </section>
  );
}
