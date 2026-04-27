"use client";

import { useActionState } from "react";
import { createVenueAction } from "@/app/dashboard/leagues/[slug]/venues/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CreateVenueFormState = {
  values: {
    name: string;
    address: string;
    city: string;
    state: string;
    latitude: string;
    longitude: string;
  };
  fieldErrors: Partial<Record<"name" | "address" | "city" | "state" | "latitude" | "longitude", string>>;
  formError: string | null;
};

const INITIAL_STATE: CreateVenueFormState = {
  values: {
    name: "",
    address: "",
    city: "",
    state: "",
    latitude: "",
    longitude: "",
  },
  fieldErrors: {},
  formError: null,
};

interface CreateVenueFormProps {
  leagueSlug: string;
}

export function CreateVenueForm({ leagueSlug }: CreateVenueFormProps) {
  const action = createVenueAction.bind(null, leagueSlug);
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="venue-name" className="text-sm font-medium text-gray-700">
          Nombre de la sede
        </label>
        <Input
          id="venue-name"
          name="name"
          required
          minLength={2}
          disabled={isPending}
          placeholder="Campo Deportivo Perote"
          defaultValue={state.values.name}
        />
        {state.fieldErrors.name ? <p className="text-sm text-red-600">{state.fieldErrors.name}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="venue-address" className="text-sm font-medium text-gray-700">
          Dirección (opcional)
        </label>
        <Input
          id="venue-address"
          name="address"
          disabled={isPending}
          placeholder="Centro, Perote, Veracruz"
          defaultValue={state.values.address}
        />
        {state.fieldErrors.address ? <p className="text-sm text-red-600">{state.fieldErrors.address}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="venue-city" className="text-sm font-medium text-gray-700">
            Ciudad (opcional)
          </label>
          <Input
            id="venue-city"
            name="city"
            disabled={isPending}
            placeholder="Perote"
            defaultValue={state.values.city}
          />
          {state.fieldErrors.city ? <p className="text-sm text-red-600">{state.fieldErrors.city}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="venue-state" className="text-sm font-medium text-gray-700">
            Estado (opcional)
          </label>
          <Input
            id="venue-state"
            name="state"
            disabled={isPending}
            placeholder="Veracruz"
            defaultValue={state.values.state}
          />
          {state.fieldErrors.state ? <p className="text-sm text-red-600">{state.fieldErrors.state}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="venue-latitude" className="text-sm font-medium text-gray-700">
            Latitud (opcional)
          </label>
          <Input
            id="venue-latitude"
            name="latitude"
            type="number"
            step="any"
            min={-90}
            max={90}
            disabled={isPending}
            placeholder="19.5625"
            defaultValue={state.values.latitude}
          />
          {state.fieldErrors.latitude ? <p className="text-sm text-red-600">{state.fieldErrors.latitude}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="venue-longitude" className="text-sm font-medium text-gray-700">
            Longitud (opcional)
          </label>
          <Input
            id="venue-longitude"
            name="longitude"
            type="number"
            step="any"
            min={-180}
            max={180}
            disabled={isPending}
            placeholder="-97.2425"
            defaultValue={state.values.longitude}
          />
          {state.fieldErrors.longitude ? (
            <p className="text-sm text-red-600">{state.fieldErrors.longitude}</p>
          ) : null}
        </div>
      </div>

      {state.formError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.formError}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creando sede..." : "Crear sede"}
      </Button>
    </form>
  );
}
