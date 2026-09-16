"use client";

import { useActionState } from "react";
import { setLeagueSubscriptionAction, type SubscriptionFormState } from "@/app/dashboard/subscriptions/actions";

const initialState: SubscriptionFormState = { success: false, message: null };

export function AssignSubscriptionForm({
  leagues,
  plans,
}: {
  leagues: Array<{ id: string; name: string }>;
  plans: Array<{ id: string; name: string }>;
}) {
  const [state, formAction, isPending] = useActionState(setLeagueSubscriptionAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 p-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="sub-league" className="text-xs font-medium text-gray-500">Liga</label>
        <select id="sub-league" name="leagueId" required disabled={isPending}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700">
          {leagues.map((league) => (
            <option key={league.id} value={league.id}>{league.name}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="sub-plan" className="text-xs font-medium text-gray-500">Plan</label>
        <select id="sub-plan" name="planId" required disabled={isPending}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700">
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>{plan.name}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="sub-status" className="text-xs font-medium text-gray-500">Estado</label>
        <select id="sub-status" name="status" defaultValue="active" disabled={isPending}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700">
          <option value="trialing">Prueba</option>
          <option value="active">Activa</option>
          <option value="past_due">Vencida</option>
          <option value="paused">Pausada</option>
        </select>
      </div>
      <button type="submit" disabled={isPending}
        className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50">
        {isPending ? "Asignando..." : "Asignar plan"}
      </button>
      {state.message ? (
        <p className={`w-full text-sm ${state.success ? "text-emerald-700" : "text-red-700"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
