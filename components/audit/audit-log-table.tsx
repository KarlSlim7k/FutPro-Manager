import { Card, CardContent } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { AuditActionBadge } from "@/components/audit/audit-action-badge";
import { AuditMetadataPreview } from "@/components/audit/audit-metadata-preview";

export interface AuditLogRow {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  actorDisplayName: string | null;
}

interface AuditLogTableProps {
  logs: AuditLogRow[];
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getActorLabel(log: AuditLogRow): string {
  if (log.actorDisplayName) return log.actorDisplayName;
  if (log.actor_id) return `Usuario ${log.actor_id.slice(0, 8)}`;
  return "Sistema";
}

function getEntityIdLabel(entityId: string | null): string {
  if (!entityId) return "N/A";
  return `${entityId.slice(0, 8)}...`;
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  return (
    <>
      {/* Mobile card layout */}
      <div className="space-y-3 md:hidden">
        {logs.map((log) => (
          <Card key={log.id}>
            <CardContent className="space-y-2 p-4 text-sm text-gray-700">
              <p className="text-xs text-gray-500">{formatDateTime(log.created_at)}</p>
              <div className="flex flex-wrap items-center gap-2">
                <AuditActionBadge action={log.action} />
              </div>
              <div>
                <Eyebrow as="span">Actor</Eyebrow>
                <p className="mt-0.5">{getActorLabel(log)}</p>
              </div>
              <div>
                <Eyebrow as="span">Entidad</Eyebrow>
                <p className="mt-0.5">{log.entity_type}</p>
              </div>
              <div>
                <Eyebrow as="span">ID Entidad</Eyebrow>
                <p className="mt-0.5 font-mono text-xs">{getEntityIdLabel(log.entity_id)}</p>
              </div>
              <div>
                <Eyebrow as="span">Detalles</Eyebrow>
                <div className="mt-0.5">
                  <AuditMetadataPreview metadata={log.metadata} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop table layout */}
      <div className="hidden overflow-x-auto rounded-lg border border-gray-200 md:block">
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3"><Eyebrow as="span">Fecha/Hora</Eyebrow></th>
              <th className="px-4 py-3"><Eyebrow as="span">Actor</Eyebrow></th>
              <th className="px-4 py-3"><Eyebrow as="span">Accion</Eyebrow></th>
              <th className="px-4 py-3"><Eyebrow as="span">Entidad</Eyebrow></th>
              <th className="px-4 py-3"><Eyebrow as="span">ID Entidad</Eyebrow></th>
              <th className="px-4 py-3"><Eyebrow as="span">Detalles</Eyebrow></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                <td className="px-4 py-3">{getActorLabel(log)}</td>
                <td className="px-4 py-3"><AuditActionBadge action={log.action} /></td>
                <td className="px-4 py-3">{log.entity_type}</td>
                <td className="px-4 py-3 font-mono text-xs">{getEntityIdLabel(log.entity_id)}</td>
                <td className="px-4 py-3 max-w-xs"><AuditMetadataPreview metadata={log.metadata} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
