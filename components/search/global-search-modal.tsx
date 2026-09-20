"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Trophy, Shield, User, Loader2, X } from "lucide-react";
import type { GlobalSearchResult } from "@/lib/search/global-search";

export const OPEN_SEARCH_EVENT = "futpro_open_search";

export function GlobalSearchModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GlobalSearchResult>({ leagues: [], teams: [], players: [] });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener(OPEN_SEARCH_EVENT, handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(OPEN_SEARCH_EVENT, handleCustomOpen);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults({ leagues: [], teams: [], players: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults({ leagues: [], teams: [], players: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch {
        // error handled gracefully
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  if (!isOpen) return null;

  const totalResults =
    results.leagues.length + results.teams.length + results.players.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-white/15 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de entrada de búsqueda */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
          <Search className="h-5 w-5 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ligas, equipos o futbolistas..."
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none"
          />
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-emerald-400 shrink-0" />
          ) : query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-gray-400 hover:text-white transition p-1"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <kbd className="hidden sm:inline-block rounded border border-white/20 bg-white/5 px-2 py-0.5 text-[11px] font-mono text-gray-300">
            ESC
          </kbd>
        </div>

        {/* Contenedor de Resultados */}
        <div className="overflow-y-auto p-4 space-y-4 max-h-[60vh]">
          {query.trim().length >= 2 && totalResults === 0 && !isLoading && (
            <div className="py-8 text-center text-sm text-gray-400">
              No se encontraron resultados para &ldquo;{query}&rdquo;.
            </div>
          )}

          {query.trim().length < 2 && (
            <div className="py-6 text-center text-xs text-gray-400 space-y-1">
              <p>Escribe al menos 2 caracteres para buscar en tiempo real.</p>
              <p className="text-gray-500">Atajo rápido: Presiona <span className="text-emerald-400 font-mono font-semibold">⌘K</span> o <span className="text-emerald-400 font-mono font-semibold">Ctrl+K</span> desde cualquier pantalla.</p>
            </div>
          )}

          {/* Ligas */}
          {results.leagues.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 px-2 flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5" /> Ligas
              </span>
              <div className="space-y-1">
                {results.leagues.map((league) => (
                  <button
                    key={league.id}
                    type="button"
                    onClick={() => handleSelect(`/liga/${league.slug}`)}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-white/10 transition group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {league.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={league.logoUrl}
                          alt={league.name}
                          className="h-6 w-6 rounded object-contain shrink-0"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                          {league.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-sm font-semibold text-white group-hover:text-emerald-300 truncate">
                        {league.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 group-hover:text-gray-200 shrink-0">
                      Ver liga →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Equipos */}
          {results.teams.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 px-2 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Equipos
              </span>
              <div className="space-y-1">
                {results.teams.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => handleSelect(`/liga/${team.leagueSlug}/teams/${team.slug}`)}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-white/10 transition group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {team.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={team.logoUrl}
                          alt={team.name}
                          className="h-6 w-6 rounded object-contain shrink-0"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold shrink-0">
                          {team.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white group-hover:text-teal-300 truncate">
                          {team.name}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {team.leagueName}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 group-hover:text-gray-200 shrink-0">
                      Ver plantilla →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Jugadores */}
          {results.players.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 px-2 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Jugadores
              </span>
              <div className="space-y-1">
                {results.players.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => handleSelect(`/credencial/${player.id}`)}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-white/10 transition group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-6 w-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {player.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white group-hover:text-cyan-300 truncate">
                          {player.fullName}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {player.position ?? "Posición sin definir"} • {player.leagueName}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 group-hover:text-gray-200 shrink-0">
                      Credencial QR →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
