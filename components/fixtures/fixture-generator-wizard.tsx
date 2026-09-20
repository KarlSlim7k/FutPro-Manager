"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  generateRoundRobinFixture,
  type FixtureTeam,
  type FixtureVenue,
  type GeneratedFixture,
  type GeneratedMatch,
} from "@/lib/fixtures/round-robin";
import { detectFixtureConflicts, type ScheduleConflict } from "@/lib/fixtures/detect-conflicts";
import { saveGeneratedFixtureAction } from "@/app/dashboard/leagues/[slug]/seasons/[seasonSlug]/fixtures/actions";

interface FixtureGeneratorWizardProps {
  leagueSlug: string;
  seasonSlug: string;
  seasonName: string;
  availableTeams: FixtureTeam[];
  availableVenues: FixtureVenue[];
}

export function FixtureGeneratorWizard({
  leagueSlug,
  seasonSlug,
  seasonName,
  availableTeams,
  availableVenues,
}: FixtureGeneratorWizardProps) {
  const router = useRouter();

  // Step 1: Configuration state
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(
    availableTeams.map((t) => t.id)
  );
  const [selectedVenueIds, setSelectedVenueIds] = useState<string[]>(
    availableVenues.map((v) => v.id)
  );
  const [twoLegs, setTwoLegs] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [timeSlotsStr, setTimeSlotsStr] = useState<string>("09:00, 11:00, 13:00, 15:00");

  // Step 2: Generated preview state
  const [fixture, setFixture] = useState<GeneratedFixture | null>(null);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleTeam = (id: string) => {
    setSelectedTeamIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllTeams = () => {
    if (selectedTeamIds.length === availableTeams.length) {
      setSelectedTeamIds([]);
    } else {
      setSelectedTeamIds(availableTeams.map((t) => t.id));
    }
  };

  const toggleVenue = (id: string) => {
    setSelectedVenueIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const teamsMap = new Map<string, FixtureTeam>(availableTeams.map((t) => [t.id, t]));
  const venuesMap = new Map<string, FixtureVenue>(availableVenues.map((v) => [v.id, v]));

  const handleGenerate = () => {
    setErrorMessage(null);
    const participatingTeams = availableTeams.filter((t) => selectedTeamIds.includes(t.id));
    const participatingVenues = availableVenues.filter((v) => selectedVenueIds.includes(v.id));

    if (participatingTeams.length < 2) {
      setErrorMessage("Debes seleccionar al menos 2 equipos para armar el rol de juegos.");
      return;
    }

    const timeSlots = timeSlotsStr
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /^\d{1,2}:\d{2}$/.test(s));

    const generated = generateRoundRobinFixture({
      teams: participatingTeams,
      venues: participatingVenues,
      twoLegs,
      startDate,
      timeSlots: timeSlots.length > 0 ? timeSlots : ["10:00"],
    });

    const detectedConflicts = detectFixtureConflicts(
      generated.matches,
      teamsMap,
      venuesMap,
      90
    );

    setFixture(generated);
    setConflicts(detectedConflicts);
  };

  const handleSaveFixture = async () => {
    if (!fixture) return;
    setIsSaving(true);
    setErrorMessage(null);

    const matchesToSave = fixture.matches.map((m) => ({
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      venueId: m.venueId || null,
      scheduledAt: m.scheduledTime || new Date().toISOString(),
      roundName: `Jornada ${m.round}`,
    }));

    try {
      const res = await saveGeneratedFixtureAction(leagueSlug, seasonSlug, matchesToSave);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => {
          router.push(`/dashboard/leagues/${leagueSlug}/matches`);
        }, 1500);
      } else {
        setErrorMessage(res.error || "No se pudo guardar el calendario.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado al guardar.";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Group matches by round for preview
  const matchesByRound: Record<number, GeneratedMatch[]> = {};
  if (fixture) {
    fixture.matches.forEach((m) => {
      if (!matchesByRound[m.round]) {
        matchesByRound[m.round] = [];
      }
      matchesByRound[m.round].push(m);
    });
  }

  return (
    <div className="space-y-8">
      {/* Configuration Panel */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">
            Generador Inteligente Round-Robin: {seasonName}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Teams selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-zinc-400" />
                Equipos Participantes ({selectedTeamIds.length} de {availableTeams.length})
              </label>
              <button
                type="button"
                onClick={toggleAllTeams}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                {selectedTeamIds.length === availableTeams.length ? "Deseleccionar todos" : "Seleccionar todos"}
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
              {availableTeams.length === 0 ? (
                <p className="text-xs text-zinc-500 py-2">No hay equipos registrados en la liga.</p>
              ) : (
                availableTeams.map((team) => (
                  <label
                    key={team.id}
                    className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTeamIds.includes(team.id)}
                      onChange={() => toggleTeam(team.id)}
                      className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>{team.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Venues selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-2">
              <MapPin className="h-4 w-4 text-zinc-400" />
              Sedes Disponibles ({selectedVenueIds.length} seleccionadas)
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
              {availableVenues.length === 0 ? (
                <p className="text-xs text-zinc-500 py-2">No hay sedes registradas en la liga.</p>
              ) : (
                availableVenues.map((venue) => (
                  <label
                    key={venue.id}
                    className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedVenueIds.includes(venue.id)}
                      onChange={() => toggleVenue(venue.id)}
                      className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>{venue.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Tournament format and start date */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-1.5">
                <Calendar className="h-4 w-4 text-zinc-400" />
                Fecha de Inicio de la Jornada 1
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Modalidad del Torneo
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="radio"
                    name="twoLegs"
                    checked={!twoLegs}
                    onChange={() => setTwoLegs(false)}
                    className="text-emerald-500"
                  />
                  <span>1 Vuelta (Solo Ida)</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="radio"
                    name="twoLegs"
                    checked={twoLegs}
                    onChange={() => setTwoLegs(true)}
                    className="text-emerald-500"
                  />
                  <span>2 Vueltas (Ida y Vuelta)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Kickoff times */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-1.5">
              <Clock className="h-4 w-4 text-zinc-400" />
              Horarios Rotativos por Jornada
            </label>
            <input
              type="text"
              value={timeSlotsStr}
              onChange={(e) => setTimeSlotsStr(e.target.value)}
              placeholder="09:00, 11:00, 13:00, 15:00"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Separados por comas en formato 24 hrs. Se asignarán rotativamente a los partidos.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-lg bg-red-950/40 border border-red-800 p-3 text-sm text-red-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-emerald-500 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            Generar Vista Previa del Calendario
          </button>
        </div>
      </div>

      {/* Preview and Validation Panel */}
      {fixture && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Resumen del Calendario Generado
              </h3>
              <p className="text-sm text-zinc-400 mt-1">
                {fixture.totalRounds} Jornadas programadas · {fixture.totalMatches} partidos en total
              </p>
            </div>
            <button
              type="button"
              disabled={isSaving || saveSuccess}
              onClick={handleSaveFixture}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando partidos...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  ¡Calendario Guardado!
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmar y Guardar Fixture
                </>
              )}
            </button>
          </div>

          {/* Conflict warnings */}
          {conflicts.length > 0 && (
            <div className="my-4 rounded-lg bg-amber-950/40 border border-amber-800 p-4 text-amber-200">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span>Atención: Se detectaron {conflicts.length} advertencias de horario o sede</span>
              </div>
              <ul className="mt-2 text-xs list-disc list-inside space-y-1 text-amber-300/90">
                {conflicts.map((c, idx) => (
                  <li key={idx}>{c.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Rounds Grid */}
          <div className="mt-6 space-y-6">
            {Object.entries(matchesByRound).map(([roundNum, roundMatches]) => {
              const r = Number(roundNum);
              const restingTeam = fixture.restingTeamsByRound[r];

              return (
                <div key={r} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-center justify-between mb-3 border-b border-zinc-800/80 pb-2">
                    <span className="font-bold text-sm text-emerald-400">Jornada {r}</span>
                    {restingTeam && (
                      <span className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full">
                        Descansa: <strong className="text-zinc-200">{restingTeam.name}</strong>
                      </span>
                    )}
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {roundMatches.map((m, idx) => {
                      const homeTeam = teamsMap.get(m.homeTeamId)?.name || "Local";
                      const awayTeam = teamsMap.get(m.awayTeamId)?.name || "Visitante";
                      const venueName = m.venueId ? venuesMap.get(m.venueId)?.name : "Por definir";
                      const dateFormatted = m.scheduledTime
                        ? new Date(m.scheduledTime).toLocaleString("es-MX", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Hora por definir";

                      return (
                        <div
                          key={idx}
                          className="rounded-lg bg-zinc-950/70 border border-zinc-800/80 p-3 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between font-semibold text-zinc-200">
                            <span className="truncate max-w-[45%] text-white">{homeTeam}</span>
                            <span className="text-zinc-500 font-bold px-1">vs</span>
                            <span className="truncate max-w-[45%] text-white text-right">{awayTeam}</span>
                          </div>
                          <div className="flex items-center justify-between text-zinc-400 text-[11px] pt-1 border-t border-zinc-800/50">
                            <span className="flex items-center gap-1 truncate max-w-[50%]">
                              <MapPin className="h-3 w-3 text-zinc-500" />
                              {venueName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-zinc-500" />
                              {dateFormatted}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
