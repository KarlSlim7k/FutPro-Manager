"use client";

import { useTransition } from "react";
import { togglePlanAction } from "@/app/dashboard/subscriptions/actions";

export function PlanToggleButton({ planId, isActive }: { planId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(async () => { await togglePlanAction(planId, isActive); })}
      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
    >
      {isActive ? "Desactivar" : "Activar"}
    </button>
  );
}
