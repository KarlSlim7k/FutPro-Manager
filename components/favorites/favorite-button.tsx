"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import {
  isFavoriteTeam,
  toggleFavoriteTeam,
  FAVORITES_EVENT,
  type FavoriteTeam,
} from "@/lib/favorites/favorites-storage";

interface FavoriteButtonProps {
  team: FavoriteTeam;
  variant?: "badge" | "icon" | "full";
  className?: string;
}

export function FavoriteButton({
  team,
  variant = "badge",
  className = "",
}: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFavorite(isFavoriteTeam(team.id));

    const handleUpdate = () => {
      setFavorite(isFavoriteTeam(team.id));
    };

    window.addEventListener(FAVORITES_EVENT, handleUpdate);
    return () => window.removeEventListener(FAVORITES_EVENT, handleUpdate);
  }, [team.id]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleFavoriteTeam(team);
    setFavorite(newState);
  };

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex items-center gap-1.5 opacity-50 ${className}`}
      >
        <Star className="h-4 w-4 text-gray-400" />
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        title={favorite ? "Quitar de favoritos" : "Seguir equipo"}
        aria-label={favorite ? "Quitar de favoritos" : "Seguir equipo"}
        className={`inline-flex items-center justify-center p-1.5 rounded-lg transition active:scale-95 ${
          favorite
            ? "text-amber-400 hover:text-amber-300"
            : "text-gray-400 hover:text-amber-400"
        } ${className}`}
      >
        <Star
          className={`h-4 w-4 ${favorite ? "fill-amber-400 stroke-amber-400" : ""}`}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={favorite ? "Quitar de favoritos" : "Seguir equipo"}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-sm transition active:scale-95 ${
        favorite
          ? "border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"
          : "border-white/15 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
      } ${className}`}
    >
      <Star
        className={`h-3.5 w-3.5 transition-transform ${
          favorite ? "fill-amber-400 stroke-amber-400 scale-110" : ""
        }`}
      />
      <span>{favorite ? "Siguiendo" : "Seguir equipo"}</span>
    </button>
  );
}
