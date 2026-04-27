import { Card, CardContent } from "@/components/ui/card";

export function StandingsEmptyState() {
  return (
    <Card>
      <CardContent className="py-8">
        <p className="text-center text-sm text-gray-600">
          No hay datos en la tabla de posiciones todavía. Presiona "Recalcular tabla" para generarla.
        </p>
      </CardContent>
    </Card>
  );
}