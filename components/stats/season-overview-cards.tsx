import { Card, CardContent } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Goal, Calendar, ShieldAlert } from "lucide-react";
import type { SeasonOverviewMetrics } from "@/lib/stats/get-season-stats";

interface SeasonOverviewCardsProps {
  overview: SeasonOverviewMetrics;
}

export function SeasonOverviewCards({ overview }: SeasonOverviewCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* Goles Totales */}
      <Card className="border-gray-200 bg-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Eyebrow as="span">Goles Totales</Eyebrow>
            <Goal className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {overview.totalGoals}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {overview.goalsPerMatch} goles / partido
          </p>
        </CardContent>
      </Card>

      {/* Partidos Disputados */}
      <Card className="border-gray-200 bg-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Eyebrow as="span">Partidos Jugados</Eyebrow>
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {overview.completedMatches}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            de {overview.totalMatches} programados
          </p>
        </CardContent>
      </Card>

      {/* Tarjetas Amarillas */}
      <Card className="border-gray-200 bg-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Eyebrow as="span">Amonestaciones</Eyebrow>
            <span className="h-3.5 w-2.5 rounded-xs bg-amber-400 border border-amber-500 inline-block" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-amber-700">
            {overview.totalYellowCards}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Tarjetas amarillas
          </p>
        </CardContent>
      </Card>

      {/* Tarjetas Rojas y Ratio */}
      <Card className="border-gray-200 bg-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Eyebrow as="span">Expulsiones</Eyebrow>
            <div className="flex items-center gap-1">
              <span className="h-3.5 w-2.5 rounded-xs bg-rose-600 border border-rose-700 inline-block" />
              <ShieldAlert className="h-4 w-4 text-rose-600" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-rose-700">
            {overview.totalRedCards}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {overview.cardsPerMatch} tarjetas / partido
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
