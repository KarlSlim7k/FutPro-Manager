import { EmptyState } from "@/components/ui/empty-state";

export function StandingsEmptyState() {
  return (
    <EmptyState
      title="Sin datos en la tabla"
      description='No hay datos en la tabla de posiciones todavía. Presiona "Recalcular tabla" para generarla.'
      className="py-8 text-center"
    />
  );
}
