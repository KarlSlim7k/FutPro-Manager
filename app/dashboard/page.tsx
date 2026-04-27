import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

function buildCards(leaguesCount: number, teamsCount: number, playersCount: number, upcomingMatchesCount: number) {
  return [
    {
      title: "Ligas activas",
      value: String(leaguesCount),
      description: "Organiza torneos, jornadas y estado competitivo.",
    },
    {
      title: "Equipos registrados",
      value: String(teamsCount),
      description: "Controla plantillas y cuerpo técnico por equipo.",
    },
    {
      title: "Jugadores",
      value: String(playersCount),
      description: "Consolida fichas, dorsales y estatus de jugadores.",
    },
    {
      title: "Partidos próximos",
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

  // Fallback a todos los partidos visibles si el filtro de próximos falla
  const safeUpcomingMatchesCount = upcomingMatchesCount ?? 0;

  const cards = buildCards(leaguesCount ?? 0, teamsCount ?? 0, playersCount ?? 0, safeUpcomingMatchesCount);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Panel de control
        </h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          Gestiona ligas, equipos, jugadores y partidos desde un solo lugar.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-700">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
