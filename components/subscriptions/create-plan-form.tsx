"use client";

import { useActionState } from "react";
import { createPlanAction, type SubscriptionFormState } from "@/app/dashboard/subscriptions/actions";

const initialState: SubscriptionFormState = { success: false, message: null };

export function CreatePlanForm() {
  const [state, formAction, isPending] = useActionState(createPlanAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 p-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="plan-name" className="text-xs font-medium text-gray-500">Nombre</label>
        <input id="plan-name" name="name" type="text" required placeholder="Plan Pro" disabled={isPending}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700" />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="plan-slug" className="text-xs font-medium text-gray-500">Slug</label>
        <input id="plan-slug" name="slug" type="text" required placeholder="plan-pro" disabled={isPending}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700" />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="plan-price" className="text-xs font-medium text-gray-500">Precio mensual (MXN)</label>
        <input id="plan-price" name="price_monthly" type="number" min="0" step="0.01" required placeholder="0.00" disabled={isPending}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700" />
      </div>
      <button type="submit" disabled={isPending}
        className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50">
        {isPending ? "Creando..." : "Crear plan"}
      </button>
      {state.message ? (
        <p className={`w-full text-sm ${state.success ? "text-emerald-700" : "text-red-700"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
