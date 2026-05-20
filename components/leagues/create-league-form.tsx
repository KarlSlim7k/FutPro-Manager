"use client";

import { useActionState } from "react";
import { createLeagueAction } from "@/app/dashboard/leagues/new/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INITIAL_STATE = {
  values: { name: "", slug: "", description: "", city: "", state: "", region: "", country: "México" },
  fieldErrors: {},
  formError: null,
};

export function CreateLeagueForm() {
  const [state, formAction, isPending] = useActionState(createLeagueAction, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="league-name" className="text-sm font-medium text-gray-700">
          Nombre de la liga
        </label>
        <Input
          id="league-name"
          name="name"
          required
          disabled={isPending}
          placeholder="Liga Municipal Perote"
          defaultValue={state.values.name}
        />
        {state.fieldErrors.name && <p className="text-sm text-red-600">{state.fieldErrors.name}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="league-slug" className="text-sm font-medium text-gray-700">
          Slug
        </label>
        <Input
          id="league-slug"
          name="slug"
          required
          disabled={isPending}
          placeholder="liga-municipal-perote"
          defaultValue={state.values.slug}
        />
        {state.fieldErrors.slug && <p className="text-sm text-red-600">{state.fieldErrors.slug}</p>}
        <p className="text-xs text-gray-500">Identificador único en URL. Solo minúsculas, números y guiones.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="league-description" className="text-sm font-medium text-gray-700">
          Descripción (opcional)
        </label>
        <Input
          id="league-description"
          name="description"
          disabled={isPending}
          placeholder="Liga de fútbol amateur de la región..."
          defaultValue={state.values.description}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="league-city" className="text-sm font-medium text-gray-700">
            Ciudad (opcional)
          </label>
          <Input id="league-city" name="city" disabled={isPending} placeholder="Perote" defaultValue={state.values.city} />
        </div>
        <div className="space-y-2">
          <label htmlFor="league-state" className="text-sm font-medium text-gray-700">
            Estado (opcional)
          </label>
          <Input id="league-state" name="state" disabled={isPending} placeholder="Veracruz" defaultValue={state.values.state} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="league-region" className="text-sm font-medium text-gray-700">
            Región (opcional)
          </label>
          <Input id="league-region" name="region" disabled={isPending} placeholder="Zona centro" defaultValue={state.values.region} />
        </div>
        <div className="space-y-2">
          <label htmlFor="league-country" className="text-sm font-medium text-gray-700">
            País
          </label>
          <Input id="league-country" name="country" required disabled={isPending} defaultValue={state.values.country} />
          {state.fieldErrors.country && <p className="text-sm text-red-600">{state.fieldErrors.country}</p>}
        </div>
      </div>

      {state.formError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.formError}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creando liga..." : "Crear liga"}
      </Button>
    </form>
  );
}
