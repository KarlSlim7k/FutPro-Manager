import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import { StandingsTable } from "@/components/standings/standings-table";
import { RecalculateStandingsForm } from "@/components/standings/recalculate-standings-form";
import { StandingsEmptyState } from "@/components/standings/standings-empty-state";
import type { League, Season, Standing, Team } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type SeasonDetail = Pick<Season, "id" | "name" | "slug">;

interface StandingsPageProps {
  params: Promise<{ slug: string; seasonSlug: string }>;
}

export default async function StandingsPage({ params }: StandingsPageProps) {
  const { slug, seasonSlug } = await params;
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

  const { data: seasonData, error: seasonError } = await supabase
    .from("seasons")
    .select("id, name, slug")
    .eq("league_id", league.id)
    .eq("slug", seasonSlug)
    .maybeSingle();

  if (seasonError) {
    throw seasonError;
  }

  if (!seasonData) {
    notFound();
  }

  const season = seasonData as SeasonDetail;

  const [
    { data: standingsData, error: standingsError },
    { data: teamsData, error: teamsError },
  ] = await Promise.all([
    supabase
      .from("standings")
      .select("*")
      .eq("league_id", league.id)
      .eq("season_id", season.id)
      .order("points", { ascending: false }),
    supabase
      .from("teams")
      .select("id, name, slug")
      .eq("league_id", league.id)
      .neq("status", "archived")
      .order("name", { ascending: true }),
  ]);

  if (standingsError) throw standingsError;
  if (teamsError) throw teamsError;

  const standings = (standingsData ?? []) as Standing[];
  const teams = (teamsData ?? []) as Team[];

  const teamMap = new Map<string, { name: string; slug: string }>();
  for (const team of teams) {
    teamMap.set(team.id, { name: team.name, slug: team.slug });
  }

  return (
    <section className="space-y-6">
      <PageHeader
        backHref={`/dashboard/leagues/${league.slug}/seasons/${season.slug}`}
        backLabel="Volver a temporada"
        title="Tabla de posiciones"
        description={
          <>
            Liga: <span className="font-medium text-gray-900">{league.name}</span> · Temporada:{" "}
            <span className="font-medium text-gray-900">{season.name}</span>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Recalcular tabla</CardTitle>
        </CardHeader>
        <CardContent>
          <RecalculateStandingsForm leagueSlug={league.slug} seasonSlug={season.slug} />
        </CardContent>
      </Card>

      {standings.length === 0 ? (
        <StandingsEmptyState />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Clasificación</CardTitle>
          </CardHeader>
          <CardContent>
            <StandingsTable standings={standings} teamMap={teamMap} leagueSlug={league.slug} />
          </CardContent>
        </Card>
      )}
    </section>
  );
}
