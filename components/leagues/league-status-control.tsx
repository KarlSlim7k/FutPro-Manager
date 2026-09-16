"use client";

import { useState, useTransition } from "react";
import { updateLeagueStatusAction } from "@/app/dashboard/leagues/actions";

const STATUS_OPTIONS = [
  { value: "draft", label: "Borrador" },
  { value: "active", label: "Activa" },
  { value: "inactive", label: "Inactiva" },
  { value: "archived", label: "Archivada" },
] as const;

interface LeagueStatusControlProps {
  leagueId: string;
  status: string;
}

export function LeagueStatusControl({ leagueId, status }: LeagueStatusControlProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleChange(nextStatus: string) {
    if (nextStatus === status) return;
    const confirmed = window.confirm(
      `¿Cambiar el estado de la liga a "${nextStatus}"? Esta acción queda registrada en auditoría.`
    );
    if (!confirmed) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await updateLeagueStatusAction(leagueId, nextStatus);
      setFeedback(result.message);
    });
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <label className="sr-only" htmlFor={`status-${leagueId}`}>
        Estado de la liga
      </label>
      <select
        id={`status-${leagueId}`}
        value={status}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:border-gray-300 disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {feedback ? <span className="text-[11px] text-gray-500">{feedback}</span> : null}
    </div>
  );
}
