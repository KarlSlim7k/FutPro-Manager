"use client";

import { useState } from "react";
import { deleteMatchEventAction } from "@/app/dashboard/leagues/[slug]/matches/[matchId]/events/actions";
import { Button } from "@/components/ui/button";

interface DeleteMatchEventButtonProps {
  leagueSlug: string;
  matchId: string;
  eventId: string;
}

export function DeleteMatchEventButton({
  leagueSlug,
  matchId,
  eventId,
}: DeleteMatchEventButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm("¿Seguro que deseas eliminar este evento del partido?")) {
      return;
    }
    setIsDeleting(true);
    setError(null);
    try {
      const res = await deleteMatchEventAction(leagueSlug, matchId, eventId);
      if (!res.success) {
        setError(res.message);
      }
    } catch {
      setError("No se pudo eliminar el evento.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isDeleting}
        onClick={handleDelete}
        className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        {isDeleting ? "Eliminando..." : "Eliminar"}
      </Button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
