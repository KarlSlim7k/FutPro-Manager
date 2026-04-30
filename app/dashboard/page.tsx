import {
  type MetricCardProps,
  MetricCard,
} from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

function buildCards(
  leaguesCount: number,
  teamsCount: number,
  playersCount: number,
  upcomingMatchesCount: number
): MetricCardProps[] {
  return [
    {
      label: "Ligas activas",
      value: String(leaguesCount),
      description: "Organiza torneos, jornadas y estado competitivo.",
    },
    {
      label: "Equipos registrados",
      value: String(teamsCount),
      description: "Controla plantillas y cuerpo técnico por equipo.",
    },
    {
      label: "Jugadores",
      value: String(playersCount),
      description: "Consolida fichas, dorsales y estatus de jugadores.",
    },
    {
      label: "Partidos próximos",
      value: String(upcomingMatchesCount),
      description: "Visualiza programación y próximos encuentros.",
    },
  ];
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const [
    { count: leaguesCount, error: leaguesError },
    { count: teamsCount, error: teamsError },
    { count: playersCount, error: playersError },
    { count: upcomingMatchesCount, error: matchesError },
  ] = await Promise.all([
    supabase.from("leagues").select("id", { count: "exact", head: true }),
    supabase.from("teams").select("id", { count: "exact", head: true }),
    supabase.from("players").select("id", { count: "exact", head: true }),
    supabase
      .from("matches")
      .select("id", { count: "exact", head: true })
      .eq("status", "scheduled")
      .gte("scheduled_at", now),
  ]);

  if (leaguesError) {
    throw leaguesError;
  }

  if (teamsError) {
    throw teamsError;
  }

  if (playersError) {
    throw playersError;
  }

  // Fallback a cero si el conteo de próximos falla
  const safeUpcomingMatchesCount = matchesError ? 0 : (upcomingMatchesCount ?? 0);

  const cards = buildCards(leaguesCount ?? 0, teamsCount ?? 0, playersCount ?? 0, safeUpcomingMatchesCount);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Panel de control"
        description="Gestiona ligas, equipos, jugadores y partidos desde un solo lugar."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>
    </section>
  );
}
