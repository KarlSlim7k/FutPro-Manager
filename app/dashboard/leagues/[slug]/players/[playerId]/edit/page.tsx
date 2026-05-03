import { notFound, redirect } from "next/navigation";
import { EditPlayerForm } from "@/components/players/edit-player-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import type { League, Player } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type PlayerEditable = Pick<
  Player,
  "id" | "full_name" | "birth_date" | "photo_url" | "preferred_position" | "dominant_foot" | "status"
>;

interface EditPlayerPageProps {
  params: Promise<{ slug: string; playerId: string }>;
}

export default async function EditPlayerPage({ params }: EditPlayerPageProps) {
  const { slug, playerId } = await params;
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

  const { data: playerData, error: playerError } = await supabase
    .from("players")
    .select("id, full_name, birth_date, photo_url, preferred_position, dominant_foot, status")
    .eq("league_id", league.id)
    .eq("id", playerId)
    .maybeSingle();

  if (playerError) {
    throw playerError;
  }

  if (!playerData) {
    notFound();
  }

  const player = playerData as PlayerEditable;

  return (
    <section className="space-y-6">
      <PageHeader
        backHref={`/dashboard/leagues/${league.slug}/players/${player.id}`}
        backLabel="Volver al detalle del jugador"
        title="Editar jugador"
        description={
          <>
            Actualiza la información de <span className="font-medium text-gray-900">{player.full_name}</span> en{" "}
            <span className="font-medium text-gray-900">{league.name}</span>.
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Datos del jugador</CardTitle>
        </CardHeader>
        <CardContent>
          <EditPlayerForm leagueSlug={league.slug} playerId={player.id} currentPlayer={player} />
        </CardContent>
      </Card>
    </section>
  );
}
