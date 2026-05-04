import { notFound, redirect } from "next/navigation";
import { CreatePlayerForm } from "@/components/players/create-player-form";
import { PlayerCard } from "@/components/players/player-card";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormSectionCard } from "@/components/ui/form-section-card";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
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

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

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
      <PageHeader
        backHref={`/dashboard/leagues/${league.slug}`}
        backLabel="Volver al detalle de liga"
        title="Jugadores"
        description={
          <>
            Administra jugadores de{" "}
            <span className="font-medium text-gray-900">{league.name}</span>.
          </>
        }
      />

      {permissions.canManageCatalog ? (
        <FormSectionCard title="Nuevo jugador">
          <CreatePlayerForm leagueSlug={league.slug} />
        </FormSectionCard>
      ) : (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-gray-600">
              Tienes acceso de consulta a los jugadores de esta liga. Las acciones administrativas están disponibles para administradores de liga.
            </p>
          </CardContent>
        </Card>
      )}

      {players.length === 0 ? (
        <EmptyState
          title="Sin jugadores registrados"
          description="Esta liga aún no tiene jugadores visibles para tu usuario."
        />
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
