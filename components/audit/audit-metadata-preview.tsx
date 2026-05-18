interface AuditMetadataPreviewProps {
  metadata: Record<string, unknown>;
}

export function AuditMetadataPreview({ metadata }: AuditMetadataPreviewProps) {
  const entries = Object.entries(metadata).slice(0, 5);
  if (entries.length === 0) {
    return <span className="text-xs text-gray-400">Sin detalles</span>;
  }
  return (
    <dl className="space-y-0.5 text-xs">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-1">
          <dt className="text-gray-500 shrink-0">{key}:</dt>
          <dd className="text-gray-700 break-all">
            {value === null || value === undefined
              ? "-"
              : typeof value === "object"
                ? "[objeto]"
                : String(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
