import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PublicLeagueHeader } from "@/components/public/public-league-header";
import { PublicNav } from "@/components/public/public-nav";
import { createClient } from "@/lib/supabase/server";
import type { League } from "@/types/database";

type PublicLeague = Pick<League, "id" | "name" | "slug" | "description" | "status">;

interface LeaguePublicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LeaguePublicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("leagues")
    .select("name, description")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("status", "active")
    .maybeSingle();

  if (!data) {
    return { title: "Liga no encontrada | FutPro Manager" };
  }

  return {
    title: `${data.name} | FutPro Manager`,
    description: data.description ?? `Información pública de ${data.name}`,
  };
}

export default async function LeaguePublicPage({ params }: LeaguePublicPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: leagueData, error: leagueError } = await supabase
    .from("leagues")
    .select("id, name, slug, description, status")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("status", "active")
    .maybeSingle();

  if (leagueError) {
    throw leagueError;
  }

  if (!leagueData) {
    notFound();
  }

  const league = leagueData as PublicLeague;

  const [
    { data: seasonsData },
    { data: teamsData },
    { data: matchesData },
  ] = await Promise.all([
    supabase
      .from("seasons")
      .select("id, name, status, start_date, end_date")
      .eq("league_id", league.id)
      .order("start_date", { ascending: false })
      .limit(1),
    supabase
      .from("teams")
      .select("id", { count: "exact", head: true })
      .eq("league_id", league.id),
    supabase
      .from("matches")
      .select("id, status, scheduled_at", { count: "exact", head: true })
      .eq("league_id", league.id)
      .order("scheduled_at", { ascending: false })
      .limit(5),
  ]);

  const latestSeason = seasonsData?.[0] ?? null;
  const teamCount = teamsData?.length ?? 0;
  const matchCount = matchesData?.length ?? 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-100">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <PublicLeagueHeader league={league} />
        <PublicNav leagueSlug={league.slug} />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Temporada más reciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestSeason ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">{latestSeason.name}</p>
                  <p className="text-xs text-gray-600 capitalize">
                    Estado: {latestSeason.status.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-gray-600">
                    {latestSeason.start_date} — {latestSeason.end_date}
                  </p>
                </div>
              ) : (
                <EmptyState
                  title="Sin temporadas"
                  description="Esta liga aún no tiene temporadas registradas."
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Equipos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{teamCount}</p>
              <p className="mt-1 text-sm text-gray-600">Equipos registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Partidos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{matchCount}</p>
              <p className="mt-1 text-sm text-gray-600">Partidos próximos o recientes</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
