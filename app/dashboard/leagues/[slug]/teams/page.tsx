import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CreateTeamForm } from "@/components/teams/create-team-form";
import { TeamCard } from "@/components/teams/team-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { League, Team } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type TeamListItem = Pick<
  Team,
  "id" | "name" | "slug" | "status" | "logo_url" | "primary_color" | "secondary_color" | "founded_year"
>;

interface LeagueTeamsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LeagueTeamsPage({ params }: LeagueTeamsPageProps) {
  const { slug } = await params;
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

  const { data: teamData, error: teamsError } = await supabase
    .from("teams")
    .select("id, name, slug, status, logo_url, primary_color, secondary_color, founded_year")
    .eq("league_id", league.id)
    .order("created_at", { ascending: false });

  if (teamsError) {
    throw teamsError;
  }

  const teams = (teamData ?? []) as TeamListItem[];

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Link
          href={`/dashboard/leagues/${league.slug}`}
          className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
        >
          Volver al detalle de liga
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Equipos</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Gestiona los equipos de <span className="font-medium text-gray-900">{league.name}</span>.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo equipo</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateTeamForm leagueSlug={league.slug} />
        </CardContent>
      </Card>

      {teams.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Sin equipos registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Esta liga aún no tiene equipos visibles para tu usuario.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} leagueSlug={league.slug} team={team} />
          ))}
        </div>
      )}
    </section>
  );
}
