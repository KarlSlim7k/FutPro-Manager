import { notFound, redirect } from "next/navigation";
import { CreateTeamForm } from "@/components/teams/create-team-form";
import { TeamCard } from "@/components/teams/team-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormSectionCard } from "@/components/ui/form-section-card";
import { PageHeader } from "@/components/ui/page-header";
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
      <PageHeader
        backHref={`/dashboard/leagues/${league.slug}`}
        backLabel="Volver al detalle de liga"
        title="Equipos"
        description={
          <>
            Gestiona los equipos de{" "}
            <span className="font-medium text-gray-900">{league.name}</span>.
          </>
        }
      />

      <FormSectionCard title="Nuevo equipo">
        <CreateTeamForm leagueSlug={league.slug} />
      </FormSectionCard>

      {teams.length === 0 ? (
        <EmptyState
          title="Sin equipos registrados"
          description="Esta liga aún no tiene equipos visibles para tu usuario."
        />
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
