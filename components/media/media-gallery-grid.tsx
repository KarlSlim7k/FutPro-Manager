"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { resolveCdnMediaUrl } from "@/lib/media/upload-media";
import { deleteMediaUploadAction } from "@/app/dashboard/leagues/[slug]/media/actions";
import type { MediaUpload } from "@/types/database";

interface MediaGalleryGridProps {
  leagueSlug: string;
  uploads: MediaUpload[];
  canManage: boolean;
}

const ENTITY_LABELS: Record<string, { label: string; color: string }> = {
  league: { label: "Logo de liga", color: "bg-purple-100 text-purple-800" },
  team: { label: "Logo de equipo", color: "bg-blue-100 text-blue-800" },
  player: { label: "Foto de jugador", color: "bg-emerald-100 text-emerald-800" },
  league_gallery: { label: "Galería de liga", color: "bg-amber-100 text-amber-800" },
  profile_avatar: { label: "Avatar", color: "bg-pink-100 text-pink-800" },
};

export function MediaGalleryGrid({ leagueSlug, uploads, canManage }: MediaGalleryGridProps) {
  const [filter, setFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const filteredUploads = uploads.filter((item) => {
    if (filter === "all") return true;
    if (filter === "logos") return item.entity_type === "league" || item.entity_type === "team";
    if (filter === "players") return item.entity_type === "player";
    if (filter === "gallery") return item.entity_type === "league_gallery";
    return true;
  });

  const getPublicUrl = (path: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    return `${supabaseUrl}/storage/v1/object/public/league-media/${path}`;
  };

  const handleCopyUrl = (id: string, path: string) => {
    const fullUrl = resolveCdnMediaUrl(getPublicUrl(path));
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este archivo multimedia de forma permanente?")) {
      return;
    }

    startTransition(async () => {
      const res = await deleteMediaUploadAction(leagueSlug, id);
      setActionMessage(res.message);
    });
  };

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatDate(isoString: string) {
    return new Intl.DateTimeFormat("es-MX", { dateStyle: "short", timeStyle: "short" }).format(
      new Date(isoString)
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              filter === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Todos ({uploads.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("logos")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              filter === "logos"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Logos ({uploads.filter((u) => u.entity_type === "league" || u.entity_type === "team").length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("players")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              filter === "players"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Jugadores ({uploads.filter((u) => u.entity_type === "player").length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("gallery")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              filter === "gallery"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Galería ({uploads.filter((u) => u.entity_type === "league_gallery").length})
          </button>
        </div>

        <span className="text-xs text-gray-500">
          Mostrando {filteredUploads.length} de {uploads.length} elementos
        </span>
      </div>

      {actionMessage ? (
        <p className="rounded-md bg-emerald-50 p-2.5 text-sm font-medium text-emerald-800">
          {actionMessage}
        </p>
      ) : null}

      {/* Grid de imágenes */}
      {filteredUploads.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          No hay archivos multimedia registrados en esta categoría.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredUploads.map((item) => {
            const rawUrl = getPublicUrl(item.path);
            const resolvedUrl = resolveCdnMediaUrl(rawUrl, { width: 400, height: 400, resize: "cover" });
            const entityConfig = ENTITY_LABELS[item.entity_type] || {
              label: item.entity_type,
              color: "bg-gray-100 text-gray-800",
            };

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow"
              >
                <div>
                  <div className="relative h-32 w-full bg-gray-50">
                    <Image
                      src={resolvedUrl}
                      alt={item.path}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>

                  <div className="p-2.5">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${entityConfig.color}`}
                    >
                      {entityConfig.label}
                    </span>
                    <p className="mt-1.5 truncate text-[11px] font-mono text-gray-600" title={item.path}>
                      {item.path.split("/").pop()}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-gray-500">
                      <span>{formatBytes(item.size_bytes)}</span>
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 p-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(item.id, item.path)}
                    className="text-gray-600 hover:text-emerald-700 font-medium"
                  >
                    {copiedId === item.id ? "¡Copiado!" : "Copiar URL"}
                  </button>

                  {canManage ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={isPending}
                      className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
