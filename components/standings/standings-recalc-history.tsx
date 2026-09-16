import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface StandingsRecalcEntry {
  id: string;
  action: string;
  createdAt: string;
  actorName: string | null;
  summary: string | null;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function actionLabel(action: string): string {
  if (action === "standings.recalculated_manual") return "Recálculo manual";
  if (action === "standings.recalculated_auto") return "Recálculo automático";
  return "Recálculo fallido";
}

export function StandingsRecalcHistory({ entries }: { entries: StandingsRecalcEntry[] }) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de recálculos</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="border-l-2 border-emerald-600 pl-3 text-sm">
              <p className="font-medium text-gray-900">{actionLabel(entry.action)}</p>
              {entry.summary ? <p className="text-gray-600">{entry.summary}</p> : null}
              <p className="mt-0.5 text-xs text-gray-500">
                {entry.actorName ? `Por ${entry.actorName} · ` : ""}
                {formatDateTime(entry.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
