"use client";

import { useState, useTransition } from "react";
import { deleteStorageObjectAction, type StorageObjectRow } from "@/app/dashboard/storage/actions";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

interface StorageObjectListProps {
  objects: StorageObjectRow[];
}

export function StorageObjectList({ objects }: StorageObjectListProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  function handleDelete(obj: StorageObjectRow) {
    const confirmed = window.confirm(
      `¿Eliminar permanentemente "${obj.name}" del bucket ${obj.bucket_id}? Esta acción queda auditada.`
    );
    if (!confirmed) return;
    startTransition(async () => {
      const result = await deleteStorageObjectAction(obj.id);
      setFeedback((prev) => ({ ...prev, [obj.id]: result.message }));
    });
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">Archivo</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Tamaño</th>
            <th className="px-4 py-3">Subido</th>
            <th className="px-4 py-3 text-right">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700">
          {objects.map((o) => (
            <tr key={o.id}>
              <td className="max-w-xs px-4 py-3">
                <span className="block truncate font-mono text-xs text-gray-900" title={o.name}>
                  {o.name}
                </span>
              </td>
              <td className="px-4 py-3 text-xs">{o.mime_type ?? "—"}</td>
              <td className="px-4 py-3 text-xs">{formatBytes(o.size_bytes)}</td>
              <td className="px-4 py-3 text-xs">
                {new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(o.created_at))}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => handleDelete(o)}
                  disabled={isPending}
                  className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                >
                  {isPending ? "..." : "Eliminar"}
                </button>
                {feedback[o.id] ? (
                  <span className="mt-1 block text-[10px] text-gray-500">{feedback[o.id]}</span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
