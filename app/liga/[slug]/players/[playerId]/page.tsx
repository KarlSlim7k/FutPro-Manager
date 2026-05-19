import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PublicLeagueHeader } from "@/components/public/public-league-header";
import { PublicNav } from "@/components/public/public-nav";
import { createClient } from "@/lib/supabase/server";
import type { League, MatchEvent, Player, PlayerTeamRegistration, Team, Season } from "@/types/database";

interface Props { params: Promise<{ slug: string; playerId: string }>; }
type LeagueSummary = Pick<League, "id" | "name" | "slug" | "description" | "status" | "logo_url">;
type PlayerDetail = Pick<Player, "id" | "full_name" | "status" | "preferred_position" | "photo_url">;
type Registration = Pick<PlayerTeamRegistration, "id" | "team_id" | "season_id" | "status" | "jersey_number" | "registered_at">;
type TeamItem = Pick<Team, "id" | "name" | "slug">;
type SeasonItem = Pick<Season, "id" | "name">;
type EventItem = Pick<MatchEvent, "id" | "event_type" | "minute" | "notes" | "match_id" | "created_at">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, playerId } = await params; const supabase = await createClient();
  const { data: league } = await supabase.from("leagues").select("id, name").eq("slug", slug).eq("is_public", true).eq("status", "active").maybeSingle();
  if (!league) return { title: "No encontrado | FutPro Manager" };
  const { data: player } = await supabase.from("players").select("full_name").eq("league_id", league.id).eq("id", playerId).maybeSingle();
  if (!player) return { title: "No encontrado | FutPro Manager" };
  const title = `${player.full_name} - ${league.name} | FutPro Manager`;
  const description = `Ficha pública de ${player.full_name} en la liga ${league.name}.`;
  return { title, description, openGraph: { title, description, type: "profile" }, twitter: { card: "summary", title, description } };
}

export default async function PublicPlayerPage({ params }: Props) {
  const { slug, playerId } = await params; const supabase = await createClient();
  const { data: leagueData } = await supabase.from("leagues").select("id, name, slug, description, status, logo_url").eq("slug", slug).eq("is_public", true).eq("status", "active").maybeSingle();
  if (!leagueData) notFound(); const league = leagueData as LeagueSummary;
  const { data: playerData } = await supabase.from("players").select("id, full_name, status, preferred_position, photo_url").eq("league_id", league.id).eq("id", playerId).maybeSingle();
  if (!playerData) notFound(); const player = playerData as PlayerDetail;

  let registrations: Registration[] = [];
  const regRes = await supabase.from("player_team_registrations").select("id, team_id, season_id, status, jersey_number, registered_at").eq("player_id", player.id).order("registered_at", { ascending: false });
  if (!regRes.error && regRes.data) registrations = regRes.data as Registration[];

  const teamIds = [...new Set(registrations.map((r) => r.team_id))];
  const seasonIds = [...new Set(registrations.map((r) => r.season_id))];
  let teams: TeamItem[] = []; let seasons: SeasonItem[] = [];
  if (teamIds.length) { const res = await supabase.from("teams").select("id, name, slug").eq("league_id", league.id).in("id", teamIds); if (!res.error && res.data) teams = res.data as TeamItem[]; }
  if (seasonIds.length) { const res = await supabase.from("seasons").select("id, name").eq("league_id", league.id).in("id", seasonIds); if (!res.error && res.data) seasons = res.data as SeasonItem[]; }

  let events: EventItem[] = [];
  const eventsRes = await supabase.from("match_events").select("id, event_type, minute, notes, match_id, created_at").eq("player_id", player.id).order("minute", { ascending: false }).limit(20);
  if (!eventsRes.error && eventsRes.data) events = eventsRes.data as EventItem[];

  const teamsMap = new Map(teams.map((t) => [t.id, t])); const seasonsMap = new Map(seasons.map((s) => [s.id, s]));

  return <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-100"><section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8"><PublicLeagueHeader league={league} /><PublicNav leagueSlug={league.slug} />
    <Card><CardHeader><CardTitle>{player.full_name}</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">{player.photo_url ? <div className="sm:col-span-2"><Eyebrow>Foto</Eyebrow><div className="mt-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={player.photo_url} alt={`Foto de ${player.full_name}`} className="h-24 w-24 rounded-lg border border-gray-200 object-cover" />
    </div></div> : <div className="sm:col-span-2"><p className="text-sm text-gray-600">Foto: Sin imagen.</p></div>}<div><Eyebrow>Estado</Eyebrow><p className="mt-1 text-sm text-gray-900">{player.status}</p></div><div><Eyebrow>Posición</Eyebrow><p className="mt-1 text-sm text-gray-900">{player.preferred_position || "No definida"}</p></div></CardContent></Card>
    <Card><CardHeader><CardTitle>Registros de equipo/temporada</CardTitle></CardHeader><CardContent>{registrations.length===0 ? <EmptyState title="Sin registros públicos" description="No hay registros de plantillas disponibles para este jugador o están restringidos por permisos."/> : <div className="space-y-2">{registrations.map((r)=><div key={r.id} className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700">Equipo: {teamsMap.get(r.team_id)?.name ?? "No disponible"} · Temporada: {seasonsMap.get(r.season_id)?.name ?? "No disponible"} · Estado: {r.status} · #{r.jersey_number ?? "-"}</div>)}</div>}</CardContent></Card>
    <Card><CardHeader><CardTitle>Eventos públicos recientes</CardTitle></CardHeader><CardContent>{events.length===0 ? <EmptyState title="Sin eventos públicos" description="No hay eventos disponibles para este jugador o su lectura está restringida."/> : <div className="space-y-2">{events.map((e)=><div key={e.id} className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700">{e.minute}&apos; · {e.event_type.replace(/_/g, " ")} {e.notes ? `· ${e.notes}` : ""}</div>)}</div>}</CardContent></Card>
  </section></main>;
}
