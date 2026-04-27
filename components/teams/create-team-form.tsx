"use client";

import { useActionState } from "react";
import { createTeamAction } from "@/app/dashboard/leagues/[slug]/teams/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TEAM_STATUS_VALUES } from "@/types/database";

type CreateTeamFormState = {
  values: {
    name: string;
    slug: string;
    logo_url: string;
    primary_color: string;
    secondary_color: string;
    founded_year: string;
    status: string;
  };
  fieldErrors: Partial<
    Record<
      "name" | "slug" | "logo_url" | "primary_color" | "secondary_color" | "founded_year" | "status",
      string
    >
  >;
  formError: string | null;
};

const INITIAL_STATE: CreateTeamFormState = {
  values: {
    name: "",
    slug: "",
    logo_url: "",
    primary_color: "",
    secondary_color: "",
    founded_year: "",
    status: "active",
  },
  fieldErrors: {},
  formError: null,
};

const MAX_FOUNDED_YEAR = new Date().getFullYear() + 1;

interface CreateTeamFormProps {
  leagueSlug: string;
}

function formatStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function CreateTeamForm({ leagueSlug }: CreateTeamFormProps) {
  const action = createTeamAction.bind(null, leagueSlug);
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="team-name" className="text-sm font-medium text-gray-700">
          Nombre del equipo
        </label>
        <Input
          id="team-name"
          name="name"
          required
          disabled={isPending}
          placeholder="Club Perote FC"
          defaultValue={state.values.name}
        />
        {state.fieldErrors.name ? <p className="text-sm text-red-600">{state.fieldErrors.name}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="team-slug" className="text-sm font-medium text-gray-700">
          Slug
        </label>
        <Input
          id="team-slug"
          name="slug"
          required
          disabled={isPending}
          placeholder="club-perote-fc"
          defaultValue={state.values.slug}
        />
        {state.fieldErrors.slug ? <p className="text-sm text-red-600">{state.fieldErrors.slug}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="team-logo-url" className="text-sm font-medium text-gray-700">
          URL de logo (opcional)
        </label>
        <Input
          id="team-logo-url"
          name="logo_url"
          type="url"
          disabled={isPending}
          placeholder="https://..."
          defaultValue={state.values.logo_url}
        />
        {state.fieldErrors.logo_url ? (
          <p className="text-sm text-red-600">{state.fieldErrors.logo_url}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="team-primary-color" className="text-sm font-medium text-gray-700">
            Color primario (hex)
          </label>
          <Input
            id="team-primary-color"
            name="primary_color"
            disabled={isPending}
            placeholder="#047857"
            defaultValue={state.values.primary_color}
          />
          {state.fieldErrors.primary_color ? (
            <p className="text-sm text-red-600">{state.fieldErrors.primary_color}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="team-secondary-color" className="text-sm font-medium text-gray-700">
            Color secundario (hex)
          </label>
          <Input
            id="team-secondary-color"
            name="secondary_color"
            disabled={isPending}
            placeholder="#111827"
            defaultValue={state.values.secondary_color}
          />
          {state.fieldErrors.secondary_color ? (
            <p className="text-sm text-red-600">{state.fieldErrors.secondary_color}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="team-founded-year" className="text-sm font-medium text-gray-700">
            Año de fundación (opcional)
          </label>
          <Input
            id="team-founded-year"
            name="founded_year"
            type="number"
            min={1850}
            max={MAX_FOUNDED_YEAR}
            disabled={isPending}
            placeholder="2026"
            defaultValue={state.values.founded_year}
          />
          {state.fieldErrors.founded_year ? (
            <p className="text-sm text-red-600">{state.fieldErrors.founded_year}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="team-status" className="text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            id="team-status"
            name="status"
            defaultValue={state.values.status}
            disabled={isPending}
            className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            {TEAM_STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {formatStatusLabel(status)}
              </option>
            ))}
          </select>
          {state.fieldErrors.status ? (
            <p className="text-sm text-red-600">{state.fieldErrors.status}</p>
          ) : null}
        </div>
      </div>

      {state.formError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.formError}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creando equipo..." : "Crear equipo"}
      </Button>
    </form>
  );
}
