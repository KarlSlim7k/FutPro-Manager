"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, Trophy, Volleyball } from "lucide-react";

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="search"
            placeholder="Buscar liga por nombre o palabra clave..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-white/15 bg-white/[0.06] backdrop-blur-md pl-10 pr-4 text-sm text-white placeholder:text-gray-400 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
            <Search className="h-4 w-4" aria-hidden />
          </div>
        </div>
        <p className="text-xs font-medium text-gray-400" aria-live="polite">
          {filtered.length === initialLeagues.length
            ? `${initialLeagues.length} ${initialLeagues.length === 1 ? "liga activa" : "ligas activas"}`
            : `${filtered.length} de ${initialLeagues.length} ligas`}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-md">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-gray-400">
            <Trophy className="h-6 w-6" />
          </div>
          <p className="mt-4 text-base font-bold text-white">
            No se encontraron ligas con &quot;{search}&quot;
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Intenta con otro término de búsqueda o revisa la ortografía.
          </p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
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
              className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-slate-900/80 hover:shadow-emerald-950/60 active:scale-[0.99] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3 min-w-0">
                  {league.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={league.logo_url}
                      alt={`Logo de ${league.name}`}
                      className="h-12 w-12 rounded-xl border border-white/10 object-contain shrink-0 bg-white/5 p-1"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                      <Volleyball className="h-6 w-6" aria-hidden />
                    </div>
                  )}
                  <div className="flex-1 truncate">
                    <h3 className="truncate text-base font-bold text-white transition group-hover:text-emerald-300">
                      {league.name}
                    </h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                      Portal público
                    </span>
                  </div>
                </div>

                <p className="line-clamp-2 text-xs text-gray-300 leading-relaxed">
                  {league.description ||
                    "Consulta partidos, tabla de posiciones y estadísticas oficiales de esta liga."}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Liga activa
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-300">
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
