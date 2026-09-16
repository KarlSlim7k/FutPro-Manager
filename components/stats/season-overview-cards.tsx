import { Card, CardContent } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Goal, Calendar, ShieldAlert } from "lucide-react";
import type { SeasonOverviewMetrics } from "@/lib/stats/get-season-stats";

interface SeasonOverviewCardsProps {
  overview: SeasonOverviewMetrics;
  theme?: "light" | "dark";
}

export function SeasonOverviewCards({ overview, theme = "dark" }: SeasonOverviewCardsProps) {
  const isDark = theme === "dark";

  const cardBase = isDark
    ? "rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg backdrop-blur-md text-white"
    : "border-gray-200 bg-white";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* Goles Totales */}
      <Card className={cardBase}>
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <Eyebrow as="span" className={isDark ? "text-emerald-400" : undefined}>
              Goles Totales
            </Eyebrow>
            <Goal className="h-4 w-4 text-emerald-400" />
          </div>
          <p className={`mt-2 text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            {overview.totalGoals}
          </p>
          <p className={`mt-0.5 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {overview.goalsPerMatch} goles / partido
          </p>
        </CardContent>
      </Card>

      {/* Partidos Disputados */}
      <Card className={cardBase}>
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <Eyebrow as="span" className={isDark ? "text-teal-400" : undefined}>
              Partidos Jugados
            </Eyebrow>
            <Calendar className="h-4 w-4 text-teal-400" />
          </div>
          <p className={`mt-2 text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            {overview.completedMatches}
          </p>
          <p className={`mt-0.5 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            de {overview.totalMatches} programados
          </p>
        </CardContent>
      </Card>

      {/* Tarjetas Amarillas */}
      <Card className={cardBase}>
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <Eyebrow as="span" className={isDark ? "text-amber-400" : undefined}>
              Amonestaciones
            </Eyebrow>
            <span className="h-3.5 w-2.5 rounded-xs bg-amber-400 border border-amber-500 inline-block" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-amber-400">
            {overview.totalYellowCards}
          </p>
          <p className={`mt-0.5 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Tarjetas amarillas
          </p>
        </CardContent>
      </Card>

      {/* Tarjetas Rojas y Ratio */}
      <Card className={cardBase}>
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <Eyebrow as="span" className={isDark ? "text-rose-400" : undefined}>
              Expulsiones
            </Eyebrow>
            <div className="flex items-center gap-1">
              <span className="h-3.5 w-2.5 rounded-xs bg-rose-600 border border-rose-700 inline-block" />
              <ShieldAlert className="h-4 w-4 text-rose-500" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-rose-400">
            {overview.totalRedCards}
          </p>
          <p className={`mt-0.5 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {overview.cardsPerMatch} tarjetas / partido
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
