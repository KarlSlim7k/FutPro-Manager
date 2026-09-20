"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, X } from "lucide-react";
import {
  getFavoriteTeams,
  removeFavoriteTeam,
  FAVORITES_EVENT,
  type FavoriteTeam,
} from "@/lib/favorites/favorites-storage";

export function FavoriteTeamsBar() {
  const [favorites, setFavorites] = useState<FavoriteTeam[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFavorites(getFavoriteTeams());

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<FavoriteTeam[]>;
      if (customEvent.detail) {
        setFavorites(customEvent.detail);
      } else {
        setFavorites(getFavoriteTeams());
      }
    };

    window.addEventListener(FAVORITES_EVENT, handleUpdate);
    return () => window.removeEventListener(FAVORITES_EVENT, handleUpdate);
  }, []);

  if (!mounted || favorites.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-white backdrop-blur-md">
      <div className="flex items-center gap-2 pb-2.5 border-b border-amber-500/15">
        <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
          Mis Equipos Favoritos ({favorites.length})
        </h3>
      </div>

      <div className="mt-3 flex flex-wrap gap-2.5">
        {favorites.map((team) => (
          <div
            key={team.id}
            className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 transition hover:border-amber-400/40 hover:bg-white/10"
          >
            {team.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={team.logoUrl}
                alt={team.name}
                className="h-5 w-5 rounded object-contain"
              />
            ) : (
              <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                {team.name.charAt(0)}
              </span>
            )}
            <Link
              href={`/liga/${team.leagueSlug}/teams/${team.slug}`}
              className="text-xs font-semibold text-white group-hover:text-amber-300 transition"
            >
              {team.name}
            </Link>
            <button
              type="button"
              onClick={() => removeFavoriteTeam(team.id)}
              className="text-gray-400 hover:text-red-400 transition p-0.5 rounded"
              title={`Dejar de seguir a ${team.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
