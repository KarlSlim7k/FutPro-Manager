import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CreateSeasonForm } from "@/components/seasons/create-season-form";
import { SeasonCard } from "@/components/seasons/season-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="space-y-3">
        <Link
          href={`/dashboard/leagues/${league.slug}`}
          className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
        >
          Volver al detalle de liga
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Temporadas</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Gestiona las temporadas de <span className="font-medium text-gray-900">{league.name}</span>.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nueva temporada</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateSeasonForm leagueSlug={league.slug} />
        </CardContent>
      </Card>

      {seasons.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Sin temporadas registradas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Esta liga aún no tiene temporadas visibles para tu usuario.
            </p>
          </CardContent>
        </Card>
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
