import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const cards = [
  {
    title: "Ligas activas",
    value: "0",
    description: "Organiza torneos, jornadas y estado competitivo.",
  },
  {
    title: "Equipos registrados",
    value: "0",
    description: "Controla plantillas y cuerpo técnico por equipo.",
  },
  {
    title: "Jugadores",
    value: "0",
    description: "Consolida fichas, dorsales y estatus de jugadores.",
  },
  {
    title: "Partidos próximos",
    value: "0",
    description: "Visualiza programación y próximos encuentros.",
  },
];

export default function DashboardPage() {
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
