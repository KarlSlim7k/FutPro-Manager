"use client";

import { useActionState, useState, useTransition } from "react";
import {
  assignSuperAdminAction,
  setGlobalRoleAction,
  setUserSuspensionAction,
  type UserAdminActionState,
} from "@/app/dashboard/users/user-admin-actions";

const initialState: UserAdminActionState = { success: false, message: "" };

const ROLE_OPTIONS = [
  { value: "league_admin", label: "Admin de liga" },
  { value: "team_admin", label: "Admin de equipo" },
  { value: "coach", label: "Entrenador" },
  { value: "referee", label: "Árbitro" },
  { value: "viewer", label: "Consulta" },
] as const;

function Feedback({ message, success }: { message: string; success: boolean }) {
  if (!message) return null;
  return (
    <span className={`block text-[11px] ${success ? "text-emerald-700" : "text-red-600"}`}>
      {message}
    </span>
  );
}

interface RoleControlsProps {
  targetUserId: string;
  currentRole: string;
  isSelf: boolean;
}

export function UserRoleControls({ targetUserId, currentRole, isSelf }: RoleControlsProps) {
  const [state, formAction, isPending] = useActionState(setGlobalRoleAction, initialState);
  const [superState, superFormAction, superPending] = useActionState(
    assignSuperAdminAction,
    initialState
  );
  const [showSuperForm, setShowSuperForm] = useState(false);

  if (currentRole === "super_admin") {
    return (
      <span className="text-[11px] text-gray-400">
        Gestionado por SQL administrativo
      </span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <form action={formAction} className="flex items-center gap-1.5">
        <input type="hidden" name="targetUserId" value={targetUserId} />
        <select
          name="newRole"
          defaultValue={currentRole}
          disabled={isPending}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 disabled:opacity-50"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          {isPending ? "..." : "Aplicar"}
        </button>
      </form>
      <Feedback message={state.message} success={state.success} />

      {!isSelf ? (
        showSuperForm ? (
          <form action={superFormAction} className="flex flex-col gap-1.5 rounded-lg border border-red-200 bg-red-50 p-2">
            <input type="hidden" name="targetUserId" value={targetUserId} />
            <span className="text-[11px] font-semibold text-red-800">
              Confirmación requerida: escribe ASIGNAR SUPER_ADMIN
            </span>
            <input
              name="confirmPhrase"
              autoComplete="off"
              className="rounded border border-red-200 px-2 py-1 text-xs"
              placeholder="ASIGNAR SUPER_ADMIN"
            />
            <div className="flex gap-1.5">
              <button
                type="submit"
                disabled={superPending}
                className="rounded bg-red-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {superPending ? "..." : "Confirmar"}
              </button>
              <button
                type="button"
                onClick={() => setShowSuperForm(false)}
                className="rounded border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600"
              >
                Cancelar
              </button>
            </div>
            <Feedback message={superState.message} success={superState.success} />
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowSuperForm(true)}
            className="text-[11px] font-medium text-red-700 hover:underline"
          >
            Asignar super_admin…
          </button>
        )
      ) : null}
    </div>
  );
}

interface SuspensionControlsProps {
  targetUserId: string;
  isSuspended: boolean;
}

export function UserSuspensionControls({ targetUserId, isSuspended }: SuspensionControlsProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ message: string; success: boolean } | null>(null);

  function toggle() {
    const confirmed = window.confirm(
      isSuspended
        ? "¿Rehabilitar esta cuenta? El usuario recuperará acceso al dashboard."
        : "¿Suspender esta cuenta? El usuario perderá acceso al dashboard en su próxima navegación."
    );
    if (!confirmed) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await setUserSuspensionAction(targetUserId, !isSuspended);
      setFeedback({ message: result.message, success: result.success });
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
          isSuspended
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
        }`}
      >
        {isPending ? "..." : isSuspended ? "Rehabilitar" : "Suspender"}
      </button>
      {feedback ? <Feedback message={feedback.message} success={feedback.success} /> : null}
    </div>
  );
}
