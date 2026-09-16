"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface RoundTrendItem {
  roundName: string;
  matchesCount: number;
  goalsCount: number;
}

export interface DashboardTrendsProps {
  totalMatches: number;
  statusCounts: {
    completed: number;
    in_progress: number;
    scheduled: number;
    cancelled: number;
    postponed: number;
  };
  totalGoals: number;
  averageGoalsPerMatch: number;
  totalYellowCards: number;
  totalRedCards: number;
  roundTrends: RoundTrendItem[];
}

export function DashboardTrendsChart({
  totalMatches,
  statusCounts,
  totalGoals,
  averageGoalsPerMatch,
  totalYellowCards,
  totalRedCards,
  roundTrends,
}: DashboardTrendsProps) {
  const [activeMetric, setActiveMetric] = useState<"goals" | "matches">("goals");

  const completed = statusCounts.completed || 0;
  const inProgress = statusCounts.in_progress || 0;
  const scheduled = statusCounts.scheduled || 0;
  const other = (statusCounts.cancelled || 0) + (statusCounts.postponed || 0);

  const completionRate = totalMatches > 0 ? Math.round((completed / totalMatches) * 100) : 0;
  const completedPct = totalMatches > 0 ? (completed / totalMatches) * 100 : 0;
  const inProgressPct = totalMatches > 0 ? (inProgress / totalMatches) * 100 : 0;
  const scheduledPct = totalMatches > 0 ? (scheduled / totalMatches) * 100 : 0;
  const otherPct = totalMatches > 0 ? (other / totalMatches) * 100 : 0;

  // Cálculo para gráfica SVG
  const maxTrendValue = Math.max(
    ...roundTrends.map((r) => (activeMetric === "goals" ? r.goalsCount : r.matchesCount)),
    5
  );

  const chartHeight = 160;
  const chartWidth = 540;
  const barPadding = 12;
  const numBars = roundTrends.length > 0 ? roundTrends.length : 1;
  const barWidth = Math.max(16, Math.min(48, (chartWidth - barPadding * (numBars + 1)) / numBars));

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Métricas y tendencias de competición</CardTitle>
          <p className="mt-0.5 text-xs text-gray-500">
            Ritmo de juego, distribución de partidos y balance disciplinario de los torneos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveMetric("goals")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              activeMetric === "goals"
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Goles por jornada
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric("matches")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              activeMetric === "matches"
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Partidos por jornada
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Métricas destacadas */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <span className="text-xs font-medium text-gray-500">Goles anotados</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{totalGoals}</span>
              <span className="text-xs font-medium text-emerald-600">
                {averageGoalsPerMatch.toFixed(1)} / juego
              </span>
            </div>
            <span className="text-[11px] text-gray-500">En partidos completados</span>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <span className="text-xs font-medium text-gray-500">Avance de calendario</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{completionRate}%</span>
              <span className="text-xs font-medium text-gray-600">{completed}/{totalMatches}</span>
            </div>
            <span className="text-[11px] text-gray-500">Partidos finalizados</span>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <span className="text-xs font-medium text-gray-500">Tarjetas amarillas</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-600">{totalYellowCards}</span>
              <span className="text-xs font-medium text-gray-600">
                {completed > 0 ? (totalYellowCards / completed).toFixed(1) : "0"} / juego
              </span>
            </div>
            <span className="text-[11px] text-gray-500">Amonestaciones totales</span>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <span className="text-xs font-medium text-gray-500">Tarjetas rojas</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-red-600">{totalRedCards}</span>
              <span className="text-xs font-medium text-gray-600">
                {completed > 0 ? (totalRedCards / completed).toFixed(2) : "0"} / juego
              </span>
            </div>
            <span className="text-[11px] text-gray-500">Expulsiones totales</span>
          </div>
        </div>

        {/* Barra de distribución del estado de partidos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-gray-700">
            <span>Distribución de partidos ({totalMatches} totales)</span>
            <span>{completed} completados • {inProgress} en curso • {scheduled} por jugar</span>
          </div>

          <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner">
            {completedPct > 0 ? (
              <div
                style={{ width: `${completedPct}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Finalizados: ${completed} (${completedPct.toFixed(1)}%)`}
              />
            ) : null}
            {inProgressPct > 0 ? (
              <div
                style={{ width: `${inProgressPct}%` }}
                className="bg-amber-400 transition-all duration-500"
                title={`En curso: ${inProgress} (${inProgressPct.toFixed(1)}%)`}
              />
            ) : null}
            {scheduledPct > 0 ? (
              <div
                style={{ width: `${scheduledPct}%` }}
                className="bg-blue-500 transition-all duration-500"
                title={`Programados: ${scheduled} (${scheduledPct.toFixed(1)}%)`}
              />
            ) : null}
            {otherPct > 0 ? (
              <div
                style={{ width: `${otherPct}%` }}
                className="bg-gray-400 transition-all duration-500"
                title={`Otros/Cancelados: ${other} (${otherPct.toFixed(1)}%)`}
              />
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Finalizados ({completed})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              En curso ({inProgress})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              Programados ({scheduled})
            </span>
            {other > 0 ? (
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                Pospuestos / Cancelados ({other})
              </span>
            ) : null}
          </div>
        </div>

        {/* Gráfica de barras SVG por jornada */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-gray-700">
            <span>
              Tendencia por jornada (
              {activeMetric === "goals" ? "Goles convertidos" : "Partidos programados/disputados"})
            </span>
            <span className="text-gray-500">Máximo: {maxTrendValue}</span>
          </div>

          {roundTrends.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-xs text-gray-500">
              No hay jornadas registradas para graficar tendencias.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="min-w-[480px]">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`}
                  className="w-full h-44 overflow-visible"
                >
                  {/* Líneas de guía horizontales */}
                  {[0, 0.25, 0.5, 0.75, 1].map((step) => {
                    const y = chartHeight - step * (chartHeight - 20);
                    const val = Math.round(step * maxTrendValue);
                    return (
                      <g key={step}>
                        <line
                          x1="30"
                          y1={y}
                          x2={chartWidth - 10}
                          y2={y}
                          stroke="#e5e7eb"
                          strokeDasharray="3 3"
                        />
                        <text
                          x="22"
                          y={y + 3}
                          textAnchor="end"
                          fontSize="9"
                          fill="#9ca3af"
                          className="font-mono"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Barras por jornada */}
                  {roundTrends.map((round, idx) => {
                    const val = activeMetric === "goals" ? round.goalsCount : round.matchesCount;
                    const barHeight =
                      maxTrendValue > 0 ? (val / maxTrendValue) * (chartHeight - 20) : 0;
                    const x =
                      35 +
                      idx * ((chartWidth - 50) / roundTrends.length) +
                      ((chartWidth - 50) / roundTrends.length - barWidth) / 2;
                    const y = chartHeight - barHeight;

                    return (
                      <g key={round.roundName} className="group cursor-pointer">
                        {/* Barra */}
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={Math.max(barHeight, 2)}
                          rx="4"
                          className={`transition-all duration-300 ${
                            activeMetric === "goals"
                              ? "fill-emerald-500 group-hover:fill-emerald-600"
                              : "fill-blue-500 group-hover:fill-blue-600"
                          }`}
                        >
                          <title>{`${round.roundName}: ${val} ${
                            activeMetric === "goals" ? "goles" : "partidos"
                          }`}</title>
                        </rect>

                        {/* Valor sobre la barra si cabe */}
                        {val > 0 ? (
                          <text
                            x={x + barWidth / 2}
                            y={y - 4}
                            textAnchor="middle"
                            fontSize="9"
                            fontWeight="bold"
                            fill="#374151"
                          >
                            {val}
                          </text>
                        ) : null}

                        {/* Etiqueta de la jornada en eje X */}
                        <text
                          x={x + barWidth / 2}
                          y={chartHeight + 16}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#4b5563"
                          className="font-medium truncate"
                        >
                          {round.roundName.length > 8
                            ? round.roundName.slice(0, 8) + "…"
                            : round.roundName}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
