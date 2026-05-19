"use client";

import { useActionState } from "react";
import { updateMemberRoleAction } from "@/app/dashboard/leagues/[slug]/members/actions";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/types/database";

const ASSIGNABLE_ROLES: { value: AppRole; label: string }[] = [
  { value: "league_admin", label: "League admin" },
  { value: "team_admin", label: "Team admin" },
  { value: "coach", label: "Coach" },
  { value: "referee", label: "Referee" },
  { value: "viewer", label: "Viewer" },
];

interface LeagueMemberRoleFormProps {
  memberId: string;
  currentRole: AppRole;
  leagueSlug: string;
}

export function LeagueMemberRoleForm({
  memberId,
  currentRole,
  leagueSlug,
}: LeagueMemberRoleFormProps) {
  const boundAction = updateMemberRoleAction.bind(null, leagueSlug);
  const [state, formAction, isPending] = useActionState(boundAction, {
    success: false,
    message: null,
  });

  const selectId = `member-role-${memberId}`;

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="memberId" value={memberId} />
      <label htmlFor={selectId} className="sr-only">
        Rol del miembro
      </label>
      <select
        id={selectId}
        name="newRole"
        defaultValue={currentRole}
        disabled={isPending}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
      >
        {ASSIGNABLE_ROLES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Guardando..." : "Cambiar"}
      </Button>
      {state.message ? (
        <p className={`text-xs ${state.success ? "text-emerald-600" : "text-red-600"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
