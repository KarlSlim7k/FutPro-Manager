"use client";

import { useActionState, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  broadcastNotificationAction,
  type BroadcastState,
} from "@/app/dashboard/notifications/broadcast/actions";

const initialState: BroadcastState = { success: false, message: null };

export function BroadcastForm() {
  const [state, formAction, isPending] = useActionState(broadcastNotificationAction, initialState);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar aviso global</CardTitle>
        <p className="mt-1 text-xs text-gray-500">
          El aviso aparecerá en la campana de notificaciones de cada destinatario. Queda auditado
          como notification.broadcast.
        </p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="broadcast-title" className="mb-1 block text-xs font-medium text-gray-500">
                Título *
              </label>
              <input
                id="broadcast-title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Mantenimiento programado"
              />
            </div>
            <div>
              <label htmlFor="broadcast-type" className="mb-1 block text-xs font-medium text-gray-500">
                Tipo
              </label>
              <select
                id="broadcast-type"
                name="type"
                defaultValue="system"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="system">Sistema</option>
                <option value="match_update">Actualización de partidos</option>
                <option value="match_assignment">Designaciones</option>
              </select>
            </div>
            <div>
              <label htmlFor="broadcast-target" className="mb-1 block text-xs font-medium text-gray-500">
                Destinatarios
              </label>
              <select
                id="broadcast-target"
                name="targetRole"
                defaultValue="all"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="all">Todos los usuarios activos</option>
                <option value="super_admin">Solo super_admin</option>
                <option value="league_admin">Solo admins de liga</option>
                <option value="team_admin">Solo admins de equipo</option>
                <option value="coach">Solo cuerpos técnicos</option>
                <option value="referee">Solo árbitros</option>
                <option value="viewer">Solo consulta</option>
              </select>
            </div>
            <div>
              <label htmlFor="broadcast-link" className="mb-1 block text-xs font-medium text-gray-500">
                Link (opcional)
              </label>
              <input
                id="broadcast-link"
                name="linkUrl"
                type="url"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </div>
          </div>
          <div>
            <label htmlFor="broadcast-message" className="mb-1 block text-xs font-medium text-gray-500">
              Mensaje *
            </label>
            <textarea
              id="broadcast-message"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={1000}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Escribe el aviso que recibirán los usuarios..."
            />
          </div>

          {title || message ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-[11px] font-semibold uppercase text-emerald-700">Vista previa</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{title || "Título..."}</p>
              <p className="text-sm text-gray-700">{message || "Mensaje..."}</p>
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
            >
              {isPending ? "Enviando..." : "Enviar aviso"}
            </button>
            {state.message ? (
              <span className={`text-xs ${state.success ? "text-emerald-700" : "text-red-600"}`}>
                {state.message}
              </span>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
