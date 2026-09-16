"use client";

import { useActionState, useState, useTransition } from "react";
import { Calendar, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  saveRefereeAvailabilityAction,
  deleteRefereeAvailabilityAction,
} from "@/app/dashboard/matches/availability/actions";
import {
  REFEREE_AVAILABILITY_STATUS_LABELS,
  type RefereeAvailability,
} from "@/types/database";

interface LeagueOption {
  id: string;
  name: string;
}

interface RefereeAvailabilityManagerProps {
  leagues: LeagueOption[];
  availabilities: RefereeAvailability[];
}

function formatDate(dateStr: string) {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "full",
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function RefereeAvailabilityManager({
  leagues,
  availabilities,
}: RefereeAvailabilityManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [state, formAction, isPending] = useActionState(saveRefereeAvailabilityAction, {
    success: false,
    message: null,
  });
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (!confirm("¿Deseas eliminar este registro de disponibilidad?")) return;
    startDeleteTransition(async () => {
      await deleteRefereeAvailabilityAction(id);
    });
  };

  if (leagues.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            Mi disponibilidad arbitral
          </CardTitle>
          <p className="text-xs text-gray-500 mt-1">
            Indica los días u horarios en los que no podrás oficiar partidos para que la liga los considere en sus designaciones.
          </p>
        </div>
        <Button
          size="sm"
          variant={showForm ? "secondary" : "primary"}
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? "Cancelar" : "Registrar fecha"}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {showForm && (
          <form
            action={async (formData) => {
              await formAction(formData);
              setShowForm(false);
            }}
            className="rounded-lg border border-gray-200 bg-gray-50/70 p-4 space-y-3"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Nuevo registro de disponibilidad
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="avail-league" className="block text-xs font-semibold text-gray-700 mb-1">
                  Liga
                </label>
                <select
                  id="avail-league"
                  name="leagueId"
                  required
                  defaultValue={leagues[0]?.id ?? ""}
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {leagues.map((lg) => (
                    <option key={lg.id} value={lg.id}>
                      {lg.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="avail-date" className="block text-xs font-semibold text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  id="avail-date"
                  type="date"
                  name="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="avail-status" className="block text-xs font-semibold text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  id="avail-status"
                  name="status"
                  defaultValue="unavailable"
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="unavailable">No disponible</option>
                  <option value="tentative">Tentativo / Por confirmar</option>
                  <option value="available">Disponible</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="avail-start" className="block text-xs font-semibold text-gray-700 mb-1">
                  Hora inicio (opcional)
                </label>
                <input
                  id="avail-start"
                  type="time"
                  name="startTime"
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="avail-end" className="block text-xs font-semibold text-gray-700 mb-1">
                  Hora fin (opcional)
                </label>
                <input
                  id="avail-end"
                  type="time"
                  name="endTime"
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="avail-notes" className="block text-xs font-semibold text-gray-700 mb-1">
                  Motivo / Observaciones (opcional)
                </label>
                <input
                  id="avail-notes"
                  type="text"
                  name="notes"
                  placeholder="Ej. Viaje familiar, compromiso laboral"
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar disponibilidad"}
              </Button>
            </div>
          </form>
        )}

        {state.message && (
          <p className={`text-xs ${state.success ? "text-emerald-600" : "text-rose-600"}`}>
            {state.message}
          </p>
        )}

        {availabilities.length === 0 ? (
          <p className="text-xs text-gray-500 italic">
            No tienes fechas registradas. Estás considerado como disponible para todas las jornadas.
          </p>
        ) : (
          <div className="divide-y divide-gray-100 border rounded-lg overflow-hidden text-xs">
            {availabilities.map((item) => {
              const statusColor =
                item.status === "unavailable"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : item.status === "tentative"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200";

              return (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 capitalize">
                        {formatDate(item.date)}
                      </span>
                      <span className={`inline-block border px-1.5 py-0.5 rounded text-[10px] font-semibold ${statusColor}`}>
                        {REFEREE_AVAILABILITY_STATUS_LABELS[item.status]}
                      </span>
                    </div>

                    {(item.start_time || item.end_time) && (
                      <p className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.start_time ? item.start_time.slice(0, 5) : "Inicio de día"} - {item.end_time ? item.end_time.slice(0, 5) : "Fin de día"}
                      </p>
                    )}

                    {item.notes && (
                      <p className="text-[11px] text-gray-600">Nota: {item.notes}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={isDeleting}
                    aria-label="Eliminar fecha"
                    className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
