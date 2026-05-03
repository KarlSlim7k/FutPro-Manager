import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ExternalTextLink } from "@/components/ui/external-text-link";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
import { createClient } from "@/lib/supabase/server";
import type { DominantFoot, League, Player, PlayerStatus } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type PlayerDetail = Pick<
  Player,
  "id" | "full_name" | "status" | "birth_date" | "photo_url" | "preferred_position" | "dominant_foot" | "created_at"
>;

interface PlayerDetailPageProps {
  params: Promise<{ slug: string; playerId: string }>;
}

const dominantFootLabels: Record<DominantFoot, string> = {
  left: "Izquierdo",
  right: "Derecho",
  both: "Ambos",
};

function formatStatus(status: PlayerStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatBirthDate(date: string | null) {
  if (!date) {
    return "No definida";
  }

  return new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(new Date(`${date}T00:00:00`));
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(date));
}

export default async function PlayerDetailPage({ params }: PlayerDetailPageProps) {
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
    .select("id, full_name, status, birth_date, photo_url, preferred_position, dominant_foot, created_at")
    .eq("league_id", league.id)
    .eq("id", playerId)
    .maybeSingle();

  if (playerError) {
    throw playerError;
  }

  if (!playerData) {
    notFound();
  }

  const player = playerData as PlayerDetail;

  return (
    <section className="space-y-6">
      <PageHeader
        backHref={`/dashboard/leagues/${league.slug}/players`}
        backLabel="Volver a jugadores"
        title={player.full_name}
        description={
          <>
            Liga: <span className="font-medium text-gray-900">{league.name}</span>
          </>
        }
        action={
          <ToolbarActions>
            <TextLink href={`/dashboard/leagues/${league.slug}/players/${player.id}/edit`}>
              Editar jugador
            </TextLink>
          </ToolbarActions>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Ficha del jugador</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Eyebrow>Nombre completo</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{player.full_name}</p>
          </div>
          <div>
            <Eyebrow>Estado</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{formatStatus(player.status)}</p>
          </div>
          <div>
            <Eyebrow>Fecha de nacimiento</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{formatBirthDate(player.birth_date)}</p>
          </div>
          <div>
            <Eyebrow>Posición preferida</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{player.preferred_position || "No definida"}</p>
          </div>
          <div>
            <Eyebrow>Perfil dominante</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">
              {player.dominant_foot ? dominantFootLabels[player.dominant_foot] : "No definido"}
            </p>
          </div>
          <div>
            <Eyebrow>Foto</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">
              {player.photo_url ? (
                <ExternalTextLink
                  href={player.photo_url}
                  className="font-medium"
                >
                  Ver foto
                </ExternalTextLink>
              ) : (
                "No definida"
              )}
            </p>
          </div>
          <div className="sm:col-span-2">
            <Eyebrow>Fecha de creación</Eyebrow>
            <p className="mt-1 text-sm text-gray-900">{formatDateTime(player.created_at)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Registros en equipos / temporadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Consulta y administra los movimientos del jugador por equipo y temporada.
            </p>
            <TextLink
              href={`/dashboard/leagues/${league.slug}/players/${player.id}/registrations`}
            >
              Ver registros del jugador
            </TextLink>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plantillas por equipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Navega a equipos para revisar sus plantillas por temporada.
            </p>
            <TextLink
              href={`/dashboard/leagues/${league.slug}/teams`}
            >
              Ver equipos de la liga
            </TextLink>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Módulo en preparación.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eventos de partido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Módulo en preparación.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
