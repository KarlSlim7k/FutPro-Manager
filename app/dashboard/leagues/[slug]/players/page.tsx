import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CreatePlayerForm } from "@/components/players/create-player-form";
import { PlayerCard } from "@/components/players/player-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { League, Player } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type PlayerListItem = Pick<
  Player,
  "id" | "full_name" | "status" | "birth_date" | "photo_url" | "preferred_position" | "dominant_foot"
>;

interface LeaguePlayersPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LeaguePlayersPage({ params }: LeaguePlayersPageProps) {
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

  const { data: playersData, error: playersError } = await supabase
    .from("players")
    .select("id, full_name, status, birth_date, photo_url, preferred_position, dominant_foot")
    .eq("league_id", league.id)
    .order("created_at", { ascending: false });

  if (playersError) {
    throw playersError;
  }

  const players = (playersData ?? []) as PlayerListItem[];

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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Jugadores</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Administra jugadores de <span className="font-medium text-gray-900">{league.name}</span>.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo jugador</CardTitle>
        </CardHeader>
        <CardContent>
          <CreatePlayerForm leagueSlug={league.slug} />
        </CardContent>
      </Card>

      {players.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Sin jugadores registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Esta liga aún no tiene jugadores visibles para tu usuario.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => (
            <PlayerCard key={player.id} leagueSlug={league.slug} player={player} />
          ))}
        </div>
      )}
    </section>
  );
}
