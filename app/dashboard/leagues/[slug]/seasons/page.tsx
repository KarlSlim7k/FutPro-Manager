import { notFound, redirect } from "next/navigation";
import { CreateSeasonForm } from "@/components/seasons/create-season-form";
import { SeasonCard } from "@/components/seasons/season-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormSectionCard } from "@/components/ui/form-section-card";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import type { League, Season } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type SeasonListItem = Pick<Season, "id" | "name" | "slug" | "status" | "start_date" | "end_date">;

interface LeagueSeasonsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LeagueSeasonsPage({ params }: LeagueSeasonsPageProps) {
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

  const { data: seasonData, error: seasonsError } = await supabase
    .from("seasons")
    .select("id, name, slug, status, start_date, end_date")
    .eq("league_id", league.id)
    .order("start_date", { ascending: false });

  if (seasonsError) {
    throw seasonsError;
  }

  const seasons = (seasonData ?? []) as SeasonListItem[];

  return (
    <section className="space-y-6">
      <PageHeader
        backHref={`/dashboard/leagues/${league.slug}`}
        backLabel="Volver al detalle de liga"
        title="Temporadas"
        description={
          <>
            Gestiona las temporadas de{" "}
            <span className="font-medium text-gray-900">{league.name}</span>.
          </>
        }
      />

      <FormSectionCard title="Nueva temporada">
        <CreateSeasonForm leagueSlug={league.slug} />
      </FormSectionCard>

      {seasons.length === 0 ? (
        <EmptyState
          title="Sin temporadas registradas"
          description="Esta liga aún no tiene temporadas visibles para tu usuario."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {seasons.map((season) => (
            <SeasonCard key={season.id} leagueSlug={league.slug} season={season} />
          ))}
        </div>
      )}
    </section>
  );
}
