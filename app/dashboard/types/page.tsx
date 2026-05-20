import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const catalogs = [
  {
    title: "Tipos de evento",
    description:
      "Gol, autogol, asistencia, tarjeta amarilla, tarjeta roja, sustitución, penalti. Actualmente definidos en código como enums; la configuración visual está pendiente.",
  },
  {
    title: "Estados de jugador",
    description:
      "Activo, inactivo, lesionado, suspendido, retirado. Definidos en schema; edición desde UI pendiente.",
  },
  {
    title: "Categorías de liga",
    description:
      "Clasificación por categoría (rama, edad, división). No existe tabla aún; pendiente de diseño.",
  },
  {
    title: "Tipos de temporada",
    description:
      "Torneo, liga regular, copa. No existe tabla aún; pendiente de diseño.",
  },
];

export default function TypesPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        title="Tipos y catálogos"
        description="Configuración de catálogos base del sistema: categorías, estados, tipos de evento y otros valores controlados."
        backHref="/dashboard"
        backLabel="← Dashboard"
      />

      <EmptyState
        title="Módulo pendiente — Post-MVP"
        description={
          <span>
            Este módulo servirá para configurar los catálogos y valores
            controlados del sistema desde la interfaz. Actualmente están
            definidos directamente en el esquema de base de datos y en código.{" "}
            <TextLink href="/dashboard/leagues">Ir a Ligas</TextLink> para
            gestionar lo que ya está disponible.
          </span>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {catalogs.map((c) => (
          <Card key={c.title}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">
                {c.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{c.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
