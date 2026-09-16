"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, Volleyball } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Eyebrow } from "@/components/ui/eyebrow";

export type LeagueExplorerItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  status: string;
};

export function LeagueSearchExplorer({
  initialLeagues,
  initialQuery = "",
}: {
  initialLeagues: LeagueExplorerItem[];
  initialQuery?: string;
}) {
  const [search, setSearch] = useState(initialQuery);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return initialLeagues;
    return initialLeagues.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.description && l.description.toLowerCase().includes(q)) ||
        l.slug.toLowerCase().includes(q)
    );
  }, [initialLeagues, search]);

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Input
          type="search"
          placeholder="Buscar liga por nombre o palabra clave..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
          <Search className="h-4 w-4" aria-hidden />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-base font-semibold text-gray-800">
            No se encontraron ligas con &quot;{search}&quot;
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Intenta con otro término o revisa la ortografía.
          </p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-4 inline-flex text-xs font-semibold text-emerald-700 hover:underline"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((league) => (
            <Link
              key={league.id}
              href={`/liga/${league.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {league.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={league.logo_url}
                      alt={`Logo de ${league.name}`}
                      className="h-12 w-12 rounded-lg border border-gray-100 object-contain"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 font-bold text-emerald-800">
                      <Volleyball className="h-6 w-6" aria-hidden />
                    </div>
                  )}
                  <div className="flex-1 truncate">
                    <h3 className="truncate font-semibold text-gray-900 group-hover:text-emerald-700">
                      {league.name}
                    </h3>
                    <Eyebrow className="text-[10px]">Portal público</Eyebrow>
                  </div>
                </div>

                <p className="line-clamp-2 text-xs text-gray-600">
                  {league.description || "Consulta partidos, tabla de posiciones y estadísticas oficiales de esta liga."}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3">
                <StatusBadge variant="success">Liga activa</StatusBadge>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                  Ver liga <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
