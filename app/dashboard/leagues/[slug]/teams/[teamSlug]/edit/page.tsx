import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EditTeamForm } from "@/components/teams/edit-team-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { League, Team } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type TeamEditable = Pick<
  Team,
  "id" | "name" | "slug" | "logo_url" | "primary_color" | "secondary_color" | "founded_year" | "status"
>;

interface EditTeamPageProps {
  params: Promise<{ slug: string; teamSlug: string }>;
}

export default async function EditTeamPage({ params }: EditTeamPageProps) {
  const { slug, teamSlug } = await params;
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

  const { data: teamData, error: teamError } = await supabase
    .from("teams")
    .select("id, name, slug, logo_url, primary_color, secondary_color, founded_year, status")
    .eq("league_id", league.id)
    .eq("slug", teamSlug)
    .maybeSingle();

  if (teamError) {
    throw teamError;
  }

  if (!teamData) {
    notFound();
  }

  const team = teamData as TeamEditable;

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Link
          href={`/dashboard/leagues/${league.slug}/teams/${team.slug}`}
          className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
        >
          Volver al equipo
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Editar equipo</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Actualiza la información de <span className="font-medium text-gray-900">{team.name}</span> en{" "}
            <span className="font-medium text-gray-900">{league.name}</span>.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del equipo</CardTitle>
        </CardHeader>
        <CardContent>
          <EditTeamForm leagueSlug={league.slug} currentTeam={team} />
        </CardContent>
      </Card>
    </section>
  );
}
