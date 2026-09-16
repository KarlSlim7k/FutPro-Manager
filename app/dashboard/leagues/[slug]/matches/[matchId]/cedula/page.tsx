import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TextLink } from "@/components/ui/text-link";
import { PrintCedulaButton } from "@/components/matches/print-cedula-button";
import type { League, Match, Season, Team, Venue, Profile, PlayerTeamRegistration, Player, MatchEvent } from "@/types/database";

interface MatchCedulaPageProps {
  params: Promise<{ slug: string; matchId: string }>;
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(date));
}

export default async function MatchCedulaPage({ params }: MatchCedulaPageProps) {
  const { slug, matchId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: leagueData, error: leagueError } = await supabase
    .from("leagues")
    .select("id, name, slug, logo_url, region, city")
    .eq("slug", slug)
    .maybeSingle();

  if (leagueError || !leagueData) {
    notFound();
  }

  const league = leagueData as Pick<League, "id" | "name" | "slug" | "logo_url" | "region" | "city">;

  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .select("id, league_id, season_id, home_team_id, away_team_id, venue_id, referee_id, scheduled_at, status, home_score, away_score, round_name, home_penalty_score, away_penalty_score")
    .eq("league_id", league.id)
    .eq("id", matchId)
    .maybeSingle();

  if (matchError || !matchData) {
    notFound();
  }

  const match = matchData as Pick<
    Match,
    | "id"
    | "league_id"
    | "season_id"
    | "home_team_id"
    | "away_team_id"
    | "venue_id"
    | "referee_id"
    | "scheduled_at"
    | "status"
    | "home_score"
    | "away_score"
    | "round_name"
    | "home_penalty_score"
    | "away_penalty_score"
  >;

  // Consultas complementarias
  const [seasonRes, teamsRes, venueRes, refereeRes, registrationsRes, eventsRes] = await Promise.all([
    supabase.from("seasons").select("id, name").eq("id", match.season_id).maybeSingle(),
    supabase.from("teams").select("id, name, slug, logo_url").in("id", [match.home_team_id, match.away_team_id]),
    match.venue_id ? supabase.from("venues").select("id, name, address").eq("id", match.venue_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    match.referee_id ? supabase.from("profiles").select("id, full_name").eq("id", match.referee_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    supabase
      .from("player_team_registrations")
      .select("id, player_id, team_id, jersey_number, status")
      .eq("season_id", match.season_id)
      .in("team_id", [match.home_team_id, match.away_team_id])
      .eq("status", "active"),
    supabase
      .from("match_events")
      .select("id, match_id, team_id, player_id, event_type, minute, notes")
      .eq("match_id", match.id)
      .order("minute", { ascending: true }),
  ]);

  const season = seasonRes.data as Pick<Season, "id" | "name"> | null;
  const teams = (teamsRes.data ?? []) as Pick<Team, "id" | "name" | "slug" | "logo_url">[];
  const venue = venueRes.data as Pick<Venue, "id" | "name" | "address"> | null;
  const referee = refereeRes.data as Pick<Profile, "id" | "full_name"> | null;
  const registrations = (registrationsRes.data ?? []) as Pick<PlayerTeamRegistration, "id" | "player_id" | "team_id" | "jersey_number" | "status">[];
  const events = (eventsRes.data ?? []) as Pick<MatchEvent, "id" | "match_id" | "team_id" | "player_id" | "event_type" | "minute" | "notes">[];

  const homeTeam = teams.find((t) => t.id === match.home_team_id) ?? { id: match.home_team_id, name: "Equipo Local", slug: "", logo_url: null };
  const awayTeam = teams.find((t) => t.id === match.away_team_id) ?? { id: match.away_team_id, name: "Equipo Visitante", slug: "", logo_url: null };

  const playerIds = [...new Set(registrations.map((r) => r.player_id))];
  let players: Pick<Player, "id" | "full_name" | "preferred_position">[] = [];
  if (playerIds.length > 0) {
    const { data: playersData } = await supabase
      .from("players")
      .select("id, full_name, preferred_position")
      .in("id", playerIds);
    players = playersData ?? [];
  }

  const playerMap = new Map(players.map((p) => [p.id, p]));

  // Separar plantillas
  const homeRoster = registrations
    .filter((r) => r.team_id === homeTeam.id)
    .map((r) => ({
      ...r,
      player: playerMap.get(r.player_id),
    }))
    .sort((a, b) => (a.jersey_number ?? 999) - (b.jersey_number ?? 999));

  const awayRoster = registrations
    .filter((r) => r.team_id === awayTeam.id)
    .map((r) => ({
      ...r,
      player: playerMap.get(r.player_id),
    }))
    .sort((a, b) => (a.jersey_number ?? 999) - (b.jersey_number ?? 999));

  // Mapa de eventos por jugador
  const playerGoalsMap = new Map<string, number>();
  const playerYellowMap = new Map<string, number>();
  const playerRedMap = new Map<string, number>();

  for (const e of events) {
    if (!e.player_id) continue;
    if (e.event_type === "goal" || e.event_type === "penalty_goal") {
      playerGoalsMap.set(e.player_id, (playerGoalsMap.get(e.player_id) ?? 0) + 1);
    } else if (e.event_type === "yellow_card") {
      playerYellowMap.set(e.player_id, (playerYellowMap.get(e.player_id) ?? 0) + 1);
    } else if (e.event_type === "red_card") {
      playerRedMap.set(e.player_id, (playerRedMap.get(e.player_id) ?? 0) + 1);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 print:p-0 print:bg-white text-gray-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Barra de Navegación y Botón de Imprimir (Ocultos al imprimir) */}
        <div className="flex items-center justify-between print:hidden">
          <TextLink href={`/dashboard/leagues/${league.slug}/matches/${match.id}`}>
            <ArrowLeft className="h-4 w-4" aria-hidden /> Volver al detalle del partido
          </TextLink>
          <PrintCedulaButton />
        </div>

        {/* Cédula Formato Físico / Hoja de Partido */}
        <div className="bg-white border border-gray-300 rounded-xl shadow-xs print:shadow-none print:border-black p-6 sm:p-8 space-y-6">
          {/* Encabezado Oficial */}
          <div className="flex items-center justify-between border-b-2 border-gray-800 pb-4">
            <div className="flex items-center gap-4">
              {league.logo_url && (
                <div className="relative h-14 w-14 overflow-hidden rounded-full border border-gray-200 shrink-0">
                  <Image src={league.logo_url} alt={league.name} fill className="object-cover" />
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
                  {league.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  CÉDULA OFICIAL ARBITRAL Y ACTA DE ENCUENTRO
                </p>
                {league.city && (
                  <p className="text-xs text-gray-400">
                    {league.city} {league.region ? `• ${league.region}` : ""}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block border border-gray-800 px-2 py-1 text-xs font-mono font-bold uppercase tracking-wider">
                Folio: #{match.id.slice(0, 8).toUpperCase()}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                {match.status.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Ficha Técnica del Partido */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200 text-xs">
            <div>
              <span className="font-semibold text-gray-500 block uppercase text-[10px]">Temporada</span>
              <span className="font-bold text-gray-800">{season?.name ?? "No asignada"}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-500 block uppercase text-[10px]">Jornada / Fase</span>
              <span className="font-bold text-gray-800">{match.round_name || "Partido regular"}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-500 block uppercase text-[10px]">Fecha y Hora</span>
              <span className="font-bold text-gray-800">{formatDateTime(match.scheduled_at)}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-500 block uppercase text-[10px]">Cancha / Sede</span>
              <span className="font-bold text-gray-800">{venue?.name ?? "Por definir"}</span>
            </div>
            <div className="col-span-2 sm:col-span-4 border-t border-gray-200 pt-2">
              <span className="font-semibold text-gray-500 uppercase text-[10px]">Árbitro Central: </span>
              <span className="font-bold text-gray-900">{referee?.full_name ?? "Sin árbitro asignado"}</span>
            </div>
          </div>

          {/* Marcador Principal */}
          <div className="flex items-center justify-around py-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-center">
            <div className="flex-1 px-2">
              <span className="text-xs font-bold uppercase text-gray-500 block">Local</span>
              <h2 className="text-base sm:text-xl font-black text-gray-900 truncate">{homeTeam.name}</h2>
            </div>
            <div className="px-4">
              <div className="text-2xl sm:text-4xl font-black text-emerald-800 tracking-wider">
                {match.home_score} - {match.away_score}
              </div>
              {match.home_penalty_score !== null && match.home_penalty_score !== undefined && (
                <span className="text-xs font-semibold text-gray-500 block">
                  ({match.home_penalty_score} - {match.away_penalty_score} penales)
                </span>
              )}
            </div>
            <div className="flex-1 px-2">
              <span className="text-xs font-bold uppercase text-gray-500 block">Visitante</span>
              <h2 className="text-base sm:text-xl font-black text-gray-900 truncate">{awayTeam.name}</h2>
            </div>
          </div>

          {/* Plantillas de Juego (Lado a Lado) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plantilla Local */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-3 py-1.5 font-bold text-xs uppercase tracking-wide border-b border-gray-300 flex justify-between">
                <span>{homeTeam.name} (Local)</span>
                <span>{homeRoster.length} jug.</span>
              </div>
              <table className="min-w-full divide-y divide-gray-200 text-[11px]">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-2 py-1 text-center w-8">#</th>
                    <th className="px-2 py-1 text-left">Jugador</th>
                    <th className="px-1 py-1 text-center w-6" title="Goles">G</th>
                    <th className="px-1 py-1 text-center w-6" title="Tarjeta Amarilla">TA</th>
                    <th className="px-1 py-1 text-center w-6" title="Tarjeta Roja">TR</th>
                    <th className="px-2 py-1 text-center w-16">Firma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {homeRoster.map((item) => {
                    const goals = playerGoalsMap.get(item.player_id) ?? 0;
                    const yellows = playerYellowMap.get(item.player_id) ?? 0;
                    const reds = playerRedMap.get(item.player_id) ?? 0;

                    return (
                      <tr key={item.id} className="h-6">
                        <td className="px-2 py-0.5 text-center font-bold text-gray-700">
                          {item.jersey_number ?? "-"}
                        </td>
                        <td className="px-2 py-0.5 truncate font-medium text-gray-900">
                          {item.player?.full_name ?? "Sin nombre"}
                        </td>
                        <td className="px-1 py-0.5 text-center font-bold text-emerald-700">
                          {goals > 0 ? goals : ""}
                        </td>
                        <td className="px-1 py-0.5 text-center font-bold text-amber-600">
                          {yellows > 0 ? yellows : ""}
                        </td>
                        <td className="px-1 py-0.5 text-center font-bold text-rose-600">
                          {reds > 0 ? reds : ""}
                        </td>
                        <td className="px-2 py-0.5 border-l border-gray-200"></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Plantilla Visitante */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-3 py-1.5 font-bold text-xs uppercase tracking-wide border-b border-gray-300 flex justify-between">
                <span>{awayTeam.name} (Visitante)</span>
                <span>{awayRoster.length} jug.</span>
              </div>
              <table className="min-w-full divide-y divide-gray-200 text-[11px]">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-2 py-1 text-center w-8">#</th>
                    <th className="px-2 py-1 text-left">Jugador</th>
                    <th className="px-1 py-1 text-center w-6" title="Goles">G</th>
                    <th className="px-1 py-1 text-center w-6" title="Tarjeta Amarilla">TA</th>
                    <th className="px-1 py-1 text-center w-6" title="Tarjeta Roja">TR</th>
                    <th className="px-2 py-1 text-center w-16">Firma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {awayRoster.map((item) => {
                    const goals = playerGoalsMap.get(item.player_id) ?? 0;
                    const yellows = playerYellowMap.get(item.player_id) ?? 0;
                    const reds = playerRedMap.get(item.player_id) ?? 0;

                    return (
                      <tr key={item.id} className="h-6">
                        <td className="px-2 py-0.5 text-center font-bold text-gray-700">
                          {item.jersey_number ?? "-"}
                        </td>
                        <td className="px-2 py-0.5 truncate font-medium text-gray-900">
                          {item.player?.full_name ?? "Sin nombre"}
                        </td>
                        <td className="px-1 py-0.5 text-center font-bold text-emerald-700">
                          {goals > 0 ? goals : ""}
                        </td>
                        <td className="px-1 py-0.5 text-center font-bold text-amber-600">
                          {yellows > 0 ? yellows : ""}
                        </td>
                        <td className="px-1 py-0.5 text-center font-bold text-rose-600">
                          {reds > 0 ? reds : ""}
                        </td>
                        <td className="px-2 py-0.5 border-l border-gray-200"></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumen de Incidencias Registradas */}
          {events.length > 0 && (
            <div className="border border-gray-300 rounded-lg p-3 text-xs">
              <span className="font-bold text-gray-700 block uppercase text-[10px] mb-1">
                Incidencias Registradas en Sistema
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {events.map((e) => (
                  <div key={e.id} className="text-[11px] text-gray-700">
                    <span className="font-mono font-bold text-gray-500">{e.minute}&apos;</span> - {e.event_type.replace(/_/g, " ")} ({playerMap.get(e.player_id ?? "")?.full_name ?? "Sin jugador"})
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observaciones Arbitrales Manuscritas */}
          <div className="border border-gray-300 rounded-lg p-3 space-y-1">
            <span className="font-bold text-gray-700 block uppercase text-[10px]">
              Observaciones e Informe Arbitral:
            </span>
            <div className="h-14 border-b border-dashed border-gray-300"></div>
          </div>

          {/* Sección de Firmas Formales */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="border-t border-gray-800 pt-1 font-bold text-gray-900">
                {referee?.full_name ?? "Árbitro Central"}
              </div>
              <span className="text-[10px] text-gray-500 uppercase">Cuerpo Arbitral</span>
            </div>
            <div>
              <div className="border-t border-gray-800 pt-1 font-bold text-gray-900">
                Capitán / Delegado
              </div>
              <span className="text-[10px] text-gray-500 uppercase">{homeTeam.name}</span>
            </div>
            <div>
              <div className="border-t border-gray-800 pt-1 font-bold text-gray-900">
                Capitán / Delegado
              </div>
              <span className="text-[10px] text-gray-500 uppercase">{awayTeam.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
