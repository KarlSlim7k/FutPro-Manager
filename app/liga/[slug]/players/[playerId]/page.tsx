import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatusBadge } from "@/components/ui/status-badge";
import { PublicLeagueHeader } from "@/components/public/public-league-header";
import { PublicNav } from "@/components/public/public-nav";
import { PublicBreadcrumbs } from "@/components/public/public-breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import type {
  League,
  MatchEvent,
  MatchEventType,
  Player,
  PlayerRegistrationStatus,
  PlayerStatus,
  PlayerTeamRegistration,
  Season,
  Team,
} from "@/types/database";
import type { StatusBadgeVariant } from "@/components/ui/status-badge";

interface Props {
  params: Promise<{ slug: string; playerId: string }>;
}

type LeagueSummary = Pick<League, "id" | "name" | "slug" | "description" | "status" | "logo_url">;
type PlayerDetail = Pick<Player, "id" | "full_name" | "status" | "preferred_position" | "photo_url">;
type Registration = Pick<PlayerTeamRegistration, "id" | "team_id" | "season_id" | "status" | "jersey_number" | "registered_at">;
type TeamItem = Pick<Team, "id" | "name" | "slug">;
type SeasonItem = Pick<Season, "id" | "name">;
type EventItem = Pick<MatchEvent, "id" | "event_type" | "minute" | "notes" | "match_id">;

const PLAYER_STATUS_LABELS: Record<PlayerStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
  injured: "Lesionado",
  suspended: "Suspendido",
  retired: "Retirado",
};

const PLAYER_STATUS_VARIANTS: Record<PlayerStatus, StatusBadgeVariant> = {
  active: "success",
  inactive: "neutral",
  injured: "danger",
  suspended: "warning",
  retired: "neutral",
};

const REGISTRATION_STATUS_LABELS: Record<PlayerRegistrationStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
  released: "Liberado",
  transferred: "Transferido",
};

const REGISTRATION_STATUS_VARIANTS: Record<PlayerRegistrationStatus, StatusBadgeVariant> = {
  active: "success",
  inactive: "neutral",
  released: "danger",
  transferred: "info",
};

const EVENT_LABELS: Record<MatchEventType, string> = {
  goal: "⚽ Gol",
  own_goal: "⚽ Autogol",
  assist: "🅰️ Asistencia",
  yellow_card: "🟨 Tarjeta amarilla",
  red_card: "🟥 Tarjeta roja",
  substitution: "🔄 Sustitución",
  penalty_goal: "⚽ Gol de penalti",
  penalty_miss: "❌ Penalti fallado",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, playerId } = await params;
  const supabase = await createClient();
  const { data: league } = await supabase
    .from("leagues")
    .select("id, name")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("status", "active")
    .maybeSingle();
  if (!league) return { title: "No encontrado | FutPro Manager" };
  const { data: player } = await supabase
    .from("players")
    .select("full_name")
    .eq("league_id", league.id)
    .eq("id", playerId)
    .maybeSingle();
  if (!player) return { title: "No encontrado | FutPro Manager" };
  const title = `${player.full_name} - ${league.name} | FutPro Manager`;
  const description = `Ficha pública de ${player.full_name} en la liga ${league.name}.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "profile" },
    twitter: { card: "summary", title, description },
  };
}

export default async function PublicPlayerPage({ params }: Props) {
  const { slug, playerId } = await params;
  const supabase = await createClient();

  const { data: leagueData } = await supabase
    .from("leagues")
    .select("id, name, slug, description, status, logo_url")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("status", "active")
    .maybeSingle();
  if (!leagueData) notFound();
  const league = leagueData as LeagueSummary;

  const { data: playerData } = await supabase
    .from("players")
    .select("id, full_name, status, preferred_position, photo_url")
    .eq("league_id", league.id)
    .eq("id", playerId)
    .maybeSingle();
  if (!playerData) notFound();
  const player = playerData as PlayerDetail;

  const { data: regData } = await supabase
    .from("player_team_registrations")
    .select("id, team_id, season_id, status, jersey_number, registered_at")
    .eq("player_id", player.id)
    .order("registered_at", { ascending: false });
  const registrations = (regData ?? []) as Registration[];

  const teamIds = [...new Set(registrations.map((r) => r.team_id))];
  const seasonIds = [...new Set(registrations.map((r) => r.season_id))];

  const [teamsRes, seasonsRes, eventsRes] = await Promise.all([
    teamIds.length
      ? supabase.from("teams").select("id, name, slug").eq("league_id", league.id).in("id", teamIds)
      : Promise.resolve({ data: [], error: null }),
    seasonIds.length
      ? supabase.from("seasons").select("id, name").eq("league_id", league.id).in("id", seasonIds)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("match_events")
      .select("id, event_type, minute, notes, match_id")
      .eq("player_id", player.id)
      .order("minute", { ascending: false })
      .limit(20),
  ]);

  const teamsMap = new Map(((teamsRes.data ?? []) as TeamItem[]).map((t) => [t.id, t]));
  const seasonsMap = new Map(((seasonsRes.data ?? []) as SeasonItem[]).map((s) => [s.id, s]));
  const events = (eventsRes.data ?? []) as EventItem[];

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-100">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <PublicLeagueHeader league={league} />
        <PublicNav leagueSlug={league.slug} />
        <PublicBreadcrumbs
          items={[
            { label: league.name, href: `/liga/${league.slug}` },
            { label: "Jugador" },
            { label: player.full_name },
          ]}
        />

        {/* Perfil */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <CardTitle className="text-xl">{player.full_name}</CardTitle>
              <StatusBadge variant={PLAYER_STATUS_VARIANTS[player.status]}>
                {PLAYER_STATUS_LABELS[player.status]}
              </StatusBadge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {player.photo_url ? (
              <div className="sm:col-span-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={player.photo_url}
                  alt={`Foto de ${player.full_name}`}
                  className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                />
              </div>
            ) : null}
            <div>
              <Eyebrow>Posición</Eyebrow>
              <p className="mt-1 text-sm text-gray-900">
                {player.preferred_position ?? "No definida"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Registros */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de equipos</CardTitle>
          </CardHeader>
          <CardContent>
            {registrations.length === 0 ? (
              <EmptyState
                title="Sin registros"
                description="No hay registros de plantillas disponibles para este jugador."
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {registrations.map((r) => {
                  const team = teamsMap.get(r.team_id);
                  const season = seasonsMap.get(r.season_id);
                  return (
                    <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div className="space-y-0.5">
                        {team?.slug ? (
                          <Link
                            href={`/liga/${league.slug}/teams/${team.slug}`}
                            className="text-sm font-medium text-emerald-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                          >
                            {team.name}
                          </Link>
                        ) : (
                          <p className="text-sm font-medium text-gray-900">
                            {team?.name ?? "No disponible"}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {season?.name ?? "Temporada no disponible"}
                          {r.jersey_number != null ? ` · #${r.jersey_number}` : ""}
                        </p>
                      </div>
                      <StatusBadge variant={REGISTRATION_STATUS_VARIANTS[r.status]}>
                        {REGISTRATION_STATUS_LABELS[r.status]}
                      </StatusBadge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Eventos */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <EmptyState
                title="Sin eventos"
                description="No hay eventos disponibles para este jugador."
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {events.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className="w-8 shrink-0 text-xs font-medium text-gray-400">
                      {e.minute}&apos;
                    </span>
                    <span className="flex-1 text-gray-700">
                      {EVENT_LABELS[e.event_type] ?? e.event_type}
                      {e.notes ? (
                        <span className="ml-1 text-gray-400">· {e.notes}</span>
                      ) : null}
                    </span>
                    <Link
                      href={`/liga/${league.slug}/matches/${e.match_id}`}
                      className="shrink-0 text-xs text-emerald-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                    >
                      Ver partido
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
