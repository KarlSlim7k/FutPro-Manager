"use client";

import { useActionState } from "react";
import {
  addTeamMemberAction,
  type TeamMemberActionState,
} from "@/app/dashboard/leagues/[slug]/teams/[teamSlug]/staff/actions";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/types/database";

const ASSIGNABLE_TEAM_ROLES: { value: AppRole; label: string }[] = [
  { value: "team_admin", label: "Administrador de equipo" },
  { value: "coach", label: "Cuerpo técnico" },
  { value: "viewer", label: "Solo consulta" },
];

export interface AvailableProfileOption {
  id: string;
  fullName: string;
  displayName: string | null;
}

interface AddTeamMemberFormProps {
  leagueSlug: string;
  teamSlug: string;
  availableProfiles: AvailableProfileOption[];
}

export function AddTeamMemberForm({
  leagueSlug,
  teamSlug,
  availableProfiles,
}: AddTeamMemberFormProps) {
  const boundAction = addTeamMemberAction.bind(null, leagueSlug, teamSlug);
  const [state, formAction, isPending] = useActionState<TeamMemberActionState, FormData>(
    boundAction,
    { success: false, message: null }
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="staff-profile-id" className="text-sm font-medium text-gray-700">
            Usuario
          </label>
          <select
            id="staff-profile-id"
            name="profileId"
            required
            disabled={isPending || availableProfiles.length === 0}
            className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Selecciona un usuario de la liga</option>
            {availableProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.fullName} {profile.displayName ? `(${profile.displayName})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="staff-role" className="text-sm font-medium text-gray-700">
            Rol en el equipo
          </label>
          <select
            id="staff-role"
            name="role"
            defaultValue="coach"
            disabled={isPending}
            className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            {ASSIGNABLE_TEAM_ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {availableProfiles.length === 0 ? (
        <p className="text-sm text-gray-500">
          No hay más miembros de la liga disponibles para agregar a este equipo.
        </p>
      ) : null}

      {state.message ? (
        <p className={`text-sm ${state.success ? "text-emerald-600" : "text-red-600"}`}>
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending || availableProfiles.length === 0}>
        {isPending ? "Agregando..." : "Agregar miembro al staff"}
      </Button>
    </form>
  );
}
