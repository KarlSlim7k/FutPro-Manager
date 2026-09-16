import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface RefereeHistoryEntry {
  id: string;
  action: string;
  previousRefereeName: string | null;
  newRefereeName: string | null;
  actorName: string | null;
  createdAt: string;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function describeEntry(entry: RefereeHistoryEntry): string {
  if (entry.action === "match.referee_removed" || !entry.newRefereeName) {
    return `Se quitó a ${entry.previousRefereeName ?? "el árbitro anterior"}`;
  }
  if (!entry.previousRefereeName) {
    return `Se asignó a ${entry.newRefereeName}`;
  }
  return `Cambió de ${entry.previousRefereeName} a ${entry.newRefereeName}`;
}

export function RefereeHistory({ entries }: { entries: RefereeHistoryEntry[] }) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de arbitraje</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="border-l-2 border-emerald-600 pl-3 text-sm">
              <p className="text-gray-900">{describeEntry(entry)}</p>
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
