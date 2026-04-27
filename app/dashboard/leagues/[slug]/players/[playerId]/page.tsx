import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="space-y-3">
        <Link
          href={`/dashboard/leagues/${league.slug}/players`}
          className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
        >
          Volver a jugadores
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{player.full_name}</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Liga: <span className="font-medium text-gray-900">{league.name}</span>
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ficha del jugador</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Nombre completo</p>
            <p className="mt-1 text-sm text-gray-900">{player.full_name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</p>
            <p className="mt-1 text-sm text-gray-900">{formatStatus(player.status)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Fecha de nacimiento</p>
            <p className="mt-1 text-sm text-gray-900">{formatBirthDate(player.birth_date)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Posición preferida
            </p>
            <p className="mt-1 text-sm text-gray-900">{player.preferred_position || "No definida"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Perfil dominante
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {player.dominant_foot ? dominantFootLabels[player.dominant_foot] : "No definido"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Foto</p>
            <p className="mt-1 text-sm text-gray-900">
              {player.photo_url ? (
                <a
                  href={player.photo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-emerald-700 hover:text-emerald-600"
                >
                  Ver foto
                </a>
              ) : (
                "No definida"
              )}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Fecha de creación</p>
            <p className="mt-1 text-sm text-gray-900">{formatDateTime(player.created_at)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Registro en equipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Registra y consulta movimientos del jugador por equipo y temporada.
            </p>
            <Link
              href={`/dashboard/leagues/${league.slug}/players/${player.id}/registrations`}
              className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
            >
              Ver historial de registros
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historial de equipos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">Consulta equipos y temporadas donde fue registrado.</p>
            <Link
              href={`/dashboard/leagues/${league.slug}/players/${player.id}/registrations`}
              className="inline-flex items-center text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
            >
              Ir al historial completo
            </Link>
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
