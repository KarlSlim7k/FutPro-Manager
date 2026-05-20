import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/status-badge";

type CatalogEntry = { value: string; label: string; variant: StatusBadgeVariant };
type Catalog = { title: string; description: string; entries: CatalogEntry[] };

const catalogs: Catalog[] = [
  {
    title: "Estados de liga",
    description: "Ciclo de vida de una liga en el sistema.",
    entries: [
      { value: "draft", label: "Borrador", variant: "neutral" },
      { value: "active", label: "Activa", variant: "success" },
      { value: "inactive", label: "Inactiva", variant: "neutral" },
      { value: "archived", label: "Archivada", variant: "neutral" },
    ],
  },
  {
    title: "Estados de temporada",
    description: "Etapas del ciclo de una temporada.",
    entries: [
      { value: "draft", label: "Borrador", variant: "neutral" },
      { value: "upcoming", label: "Próxima", variant: "info" },
      { value: "active", label: "Activa", variant: "success" },
      { value: "completed", label: "Completada", variant: "neutral" },
      { value: "archived", label: "Archivada", variant: "neutral" },
    ],
  },
  {
    title: "Estados de equipo",
    description: "Disponibilidad operativa de un equipo.",
    entries: [
      { value: "active", label: "Activo", variant: "success" },
      { value: "inactive", label: "Inactivo", variant: "neutral" },
      { value: "archived", label: "Archivado", variant: "neutral" },
    ],
  },
  {
    title: "Estados de jugador",
    description: "Situación deportiva de un jugador.",
    entries: [
      { value: "active", label: "Activo", variant: "success" },
      { value: "inactive", label: "Inactivo", variant: "neutral" },
      { value: "injured", label: "Lesionado", variant: "danger" },
      { value: "suspended", label: "Suspendido", variant: "warning" },
      { value: "retired", label: "Retirado", variant: "neutral" },
    ],
  },
  {
    title: "Estados de registro en plantilla",
    description: "Vínculo de un jugador con un equipo en una temporada.",
    entries: [
      { value: "active", label: "Activo", variant: "success" },
      { value: "inactive", label: "Inactivo", variant: "neutral" },
      { value: "released", label: "Liberado", variant: "danger" },
      { value: "transferred", label: "Transferido", variant: "info" },
    ],
  },
  {
    title: "Estados de partido",
    description: "Ciclo de vida de un partido.",
    entries: [
      { value: "scheduled", label: "Programado", variant: "info" },
      { value: "in_progress", label: "En juego", variant: "warning" },
      { value: "completed", label: "Finalizado", variant: "success" },
      { value: "postponed", label: "Pospuesto", variant: "neutral" },
      { value: "cancelled", label: "Cancelado", variant: "danger" },
    ],
  },
  {
    title: "Tipos de evento de partido",
    description: "Acciones registrables durante un partido.",
    entries: [
      { value: "goal", label: "⚽ Gol", variant: "success" },
      { value: "own_goal", label: "⚽ Autogol", variant: "danger" },
      { value: "assist", label: "🅰️ Asistencia", variant: "info" },
      { value: "yellow_card", label: "🟨 Tarjeta amarilla", variant: "warning" },
      { value: "red_card", label: "🟥 Tarjeta roja", variant: "danger" },
      { value: "substitution", label: "🔄 Sustitución", variant: "neutral" },
      { value: "penalty_goal", label: "⚽ Gol de penalti", variant: "success" },
      { value: "penalty_miss", label: "❌ Penalti fallado", variant: "danger" },
    ],
  },
  {
    title: "Pie dominante",
    description: "Preferencia de pie de un jugador.",
    entries: [
      { value: "right", label: "Derecho", variant: "neutral" },
      { value: "left", label: "Izquierdo", variant: "neutral" },
      { value: "both", label: "Ambidiestro", variant: "info" },
    ],
  },
  {
    title: "Roles de usuario",
    description: "Niveles de acceso en el sistema.",
    entries: [
      { value: "super_admin", label: "Super administrador", variant: "danger" },
      { value: "league_admin", label: "Admin de liga", variant: "warning" },
      { value: "team_admin", label: "Admin de equipo", variant: "info" },
      { value: "coach", label: "Entrenador", variant: "info" },
      { value: "referee", label: "Árbitro", variant: "neutral" },
      { value: "viewer", label: "Consulta", variant: "neutral" },
    ],
  },
];

export default function TypesPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        title="Tipos y catálogos"
        description="Referencia de todos los valores controlados del sistema. Estos catálogos están definidos en el esquema y se usan en ligas, equipos, jugadores, partidos y eventos."
        backHref="/dashboard"
        backLabel="← Dashboard"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {catalogs.map((catalog) => (
          <Card key={catalog.title}>
            <CardHeader>
              <CardTitle className="text-sm">{catalog.title}</CardTitle>
              <p className="text-xs text-gray-500">{catalog.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {catalog.entries.map((entry) => (
                  <div key={entry.value} className="flex flex-col items-start gap-0.5">
                    <StatusBadge variant={entry.variant}>{entry.label}</StatusBadge>
                    <span className="px-1 font-mono text-[10px] text-gray-400">{entry.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        Estos valores son de solo lectura. Para modificar catálogos del sistema contacta al administrador técnico.
      </p>
    </section>
  );
}
