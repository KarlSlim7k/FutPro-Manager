"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSeasonAction } from "@/app/dashboard/leagues/[slug]/seasons/actions";
import { SEASON_STATUS_VALUES } from "@/types/database";

type CreateSeasonFormState = {
  values: {
    name: string;
    slug: string;
    start_date: string;
    end_date: string;
    status: string;
  };
  fieldErrors: Partial<
    Record<"name" | "slug" | "start_date" | "end_date" | "status", string>
  >;
  formError: string | null;
};

const INITIAL_STATE: CreateSeasonFormState = {
  values: {
    name: "",
    slug: "",
    start_date: "",
    end_date: "",
    status: "draft",
  },
  fieldErrors: {},
  formError: null,
};

interface CreateSeasonFormProps {
  leagueSlug: string;
}

function formatStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function CreateSeasonForm({ leagueSlug }: CreateSeasonFormProps) {
  const action = createSeasonAction.bind(null, leagueSlug);
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="season-name" className="text-sm font-medium text-gray-700">
          Nombre de la temporada
        </label>
        <Input
          id="season-name"
          name="name"
          required
          disabled={isPending}
          placeholder="Temporada 2026"
          defaultValue={state.values.name}
        />
        {state.fieldErrors.name ? (
          <p className="text-sm text-red-600">{state.fieldErrors.name}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="season-slug" className="text-sm font-medium text-gray-700">
          Slug
        </label>
        <Input
          id="season-slug"
          name="slug"
          required
          disabled={isPending}
          placeholder="temporada-2026"
          defaultValue={state.values.slug}
        />
        {state.fieldErrors.slug ? (
          <p className="text-sm text-red-600">{state.fieldErrors.slug}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="season-start-date" className="text-sm font-medium text-gray-700">
            Fecha de inicio
          </label>
          <Input
            id="season-start-date"
            name="start_date"
            type="date"
            required
            disabled={isPending}
            defaultValue={state.values.start_date}
          />
          {state.fieldErrors.start_date ? (
            <p className="text-sm text-red-600">{state.fieldErrors.start_date}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="season-end-date" className="text-sm font-medium text-gray-700">
            Fecha de fin
          </label>
          <Input
            id="season-end-date"
            name="end_date"
            type="date"
            required
            disabled={isPending}
            defaultValue={state.values.end_date}
          />
          {state.fieldErrors.end_date ? (
            <p className="text-sm text-red-600">{state.fieldErrors.end_date}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="season-status" className="text-sm font-medium text-gray-700">
          Estado
        </label>
        <select
          id="season-status"
          name="status"
          defaultValue={state.values.status}
          disabled={isPending}
          className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
        >
          {SEASON_STATUS_VALUES.map((status) => (
            <option key={status} value={status}>
              {formatStatusLabel(status)}
            </option>
          ))}
        </select>
        {state.fieldErrors.status ? (
          <p className="text-sm text-red-600">{state.fieldErrors.status}</p>
        ) : null}
      </div>

      {state.formError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.formError}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creando temporada..." : "Crear temporada"}
      </Button>
    </form>
  );
}
