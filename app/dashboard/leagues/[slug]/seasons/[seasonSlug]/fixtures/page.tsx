import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { FixtureGeneratorWizard } from "@/components/fixtures/fixture-generator-wizard";
import { createClient } from "@/lib/supabase/server";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";

interface SeasonFixturesPageProps {
  params: Promise<{ slug: string; seasonSlug: string }>;
}

export default async function SeasonFixturesPage({ params }: SeasonFixturesPageProps) {
  const { slug, seasonSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: league, error: leagueError } = await supabase
    .from("leagues")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  if (leagueError || !league) {
    notFound();
  }

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

  if (!permissions.canManageLeague && !permissions.canManageMatches) {
    redirect(`/dashboard/leagues/${slug}/seasons/${seasonSlug}`);
  }

  const { data: season, error: seasonError } = await supabase
    .from("seasons")
    .select("id, name, slug")
    .eq("league_id", league.id)
    .eq("slug", seasonSlug)
    .single();

  if (seasonError || !season) {
    notFound();
  }

  // Fetch teams and venues
  const [{ data: teams }, { data: venues }] = await Promise.all([
    supabase
      .from("teams")
      .select("id, name")
      .eq("league_id", league.id)
      .eq("status", "active")
      .order("name", { ascending: true }),
    supabase
      .from("venues")
      .select("id, name")
      .eq("league_id", league.id)
      .order("name", { ascending: true }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Generador de Calendario: ${season.name}`}
        description={`Crea automáticamente las jornadas y partidos de ${season.name} para ${league.name}.`}
        action={
          <Link
            href={`/dashboard/leagues/${slug}/seasons/${seasonSlug}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la Temporada
          </Link>
        }
      />

      <FixtureGeneratorWizard
        leagueSlug={slug}
        seasonSlug={seasonSlug}
        seasonName={season.name}
        availableTeams={teams || []}
        availableVenues={venues || []}
      />
    </div>
  );
}
