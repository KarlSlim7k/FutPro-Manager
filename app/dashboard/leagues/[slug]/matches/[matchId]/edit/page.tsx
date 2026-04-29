import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EditMatchForm } from "@/components/matches/edit-match-form";
import { MatchStatusBadge } from "@/components/matches/match-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { League, Match, Season, Team, Venue } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type MatchEditable = Pick<
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
type VenueOption = Pick<Venue, "id" | "name">;

interface EditMatchPageProps {
  params: Promise<{ slug: string; matchId: string }>;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function EditMatchPage({ params }: EditMatchPageProps) {
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

  const match = matchData as MatchEditable;

  const [seasonResult, teamsResult, venuesResult] = await Promise.all([
    supabase
      .from("seasons")
      .select("id, name")
      .eq("id", match.season_id)
      .eq("league_id", league.id)
      .maybeSingle(),
    supabase
      .from("teams")
      .select("id, name")
      .in("id", [match.home_team_id, match.away_team_id])
      .eq("league_id", league.id),
    supabase.from("venues").select("id, name").eq("league_id", league.id).order("name", { ascending: true }),
  ]);

  if (seasonResult.error) throw seasonResult.error;
  if (teamsResult.error) throw teamsResult.error;
  if (venuesResult.error) throw venuesResult.error;

  const season = seasonResult.data as SeasonSummary | null;
  const teams = (teamsResult.data ?? []) as TeamSummary[];
  const venues = (venuesResult.data ?? []) as VenueOption[];

  const teamsMap = new Map(teams.map((team) => [team.id, team.name]));
  const homeTeamName = teamsMap.get(match.home_team_id) ?? "Equipo local";
  const awayTeamName = teamsMap.get(match.away_team_id) ?? "Equipo visitante";

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Link
          href={`/dashboard/leagues/${league.slug}/matches/${match.id}`}
          className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
        >
          Volver al detalle del partido
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Editar partido</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            {homeTeamName} vs {awayTeamName}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contexto del partido</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Temporada</p>
            <p className="mt-1 text-sm text-gray-900">{season?.name ?? "No disponible"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Estado actual</p>
            <p className="mt-1">
              <MatchStatusBadge status={match.status} />
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Equipo local</p>
            <p className="mt-1 text-sm text-gray-900">{homeTeamName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Equipo visitante</p>
            <p className="mt-1 text-sm text-gray-900">{awayTeamName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Marcador actual</p>
            <p className="mt-1 text-sm text-gray-900">
              {match.home_score} - {match.away_score}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Fecha programada actual</p>
            <p className="mt-1 text-sm text-gray-900">{formatDateTime(match.scheduled_at)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Programación y estado básico</CardTitle>
        </CardHeader>
        <CardContent>
          <EditMatchForm
            leagueSlug={league.slug}
            matchId={match.id}
            currentMatch={match}
            venues={venues.map((venue) => ({ id: venue.id, name: venue.name }))}
          />
        </CardContent>
      </Card>
    </section>
  );
}
