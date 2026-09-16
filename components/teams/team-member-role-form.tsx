"use client";

import { useActionState } from "react";
import {
  updateTeamMemberRoleAction,
  removeTeamMemberAction,
  type TeamMemberActionState,
} from "@/app/dashboard/leagues/[slug]/teams/[teamSlug]/staff/actions";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/types/database";

const ASSIGNABLE_TEAM_ROLES: { value: AppRole; label: string }[] = [
  { value: "team_admin", label: "Administrador de equipo" },
  { value: "coach", label: "Cuerpo técnico" },
  { value: "viewer", label: "Solo consulta" },
];

interface TeamMemberRoleFormProps {
  leagueSlug: string;
  teamSlug: string;
  memberId: string;
  currentRole: AppRole;
}

export function TeamMemberRoleForm({
  leagueSlug,
  teamSlug,
  memberId,
  currentRole,
}: TeamMemberRoleFormProps) {
  const boundUpdateAction = updateTeamMemberRoleAction.bind(null, leagueSlug, teamSlug);
  const [updateState, formUpdateAction, isUpdating] = useActionState<TeamMemberActionState, FormData>(
    boundUpdateAction,
    { success: false, message: null }
  );

  const boundRemoveAction = removeTeamMemberAction.bind(null, leagueSlug, teamSlug);
  const [removeState, formRemoveAction, isRemoving] = useActionState<TeamMemberActionState, FormData>(
    boundRemoveAction,
    { success: false, message: null }
  );

  const selectId = `team-member-role-${memberId}`;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <form action={formUpdateAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="memberId" value={memberId} />
          <label htmlFor={selectId} className="sr-only">
            Rol del miembro de staff
          </label>
          <select
            id={selectId}
            name="newRole"
            defaultValue={currentRole}
            disabled={isUpdating || isRemoving}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            {ASSIGNABLE_TEAM_ROLES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm" disabled={isUpdating || isRemoving}>
            {isUpdating ? "Guardando..." : "Cambiar"}
          </Button>
        </form>

        <form action={formRemoveAction}>
          <input type="hidden" name="memberId" value={memberId} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={isUpdating || isRemoving}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={(e) => {
              if (!window.confirm("¿Seguro que deseas remover a este miembro del staff?")) {
                e.preventDefault();
              }
            }}
          >
            {isRemoving ? "Removiendo..." : "Remover"}
          </Button>
        </form>
      </div>

      {updateState.message ? (
        <p className={`text-xs ${updateState.success ? "text-emerald-600" : "text-red-600"}`}>
          {updateState.message}
        </p>
      ) : null}

      {removeState.message ? (
        <p className={`text-xs ${removeState.success ? "text-emerald-600" : "text-red-600"}`}>
          {removeState.message}
        </p>
      ) : null}
    </div>
  );
}
