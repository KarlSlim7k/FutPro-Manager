import Image from "next/image";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";
import { EmptyState } from "@/components/ui/empty-state";
import { Trophy, CheckCircle2 } from "lucide-react";
import type { PlayoffBracketData, PlayoffSeries, PlayoffTeam } from "@/lib/playoffs/playoff-utils";

interface PlayoffBracketProps {
  bracket: PlayoffBracketData;
  leagueSlug: string;
  basePath?: string;
}

function TeamRow({
  team,
  score,
  penalties,
  isWinner,
  leagueSlug,
  basePath,
}: {
  team: PlayoffTeam;
  score: number;
  penalties: number | null;
  isWinner: boolean;
  leagueSlug: string;
  basePath: string;
}) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 transition-colors ${
        isWinner ? "bg-emerald-50/80 font-bold text-gray-900" : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <div className="relative h-6 w-6 overflow-hidden rounded-full bg-gray-100 border border-gray-200 shrink-0">
          {team.logo_url ? (
            <Image src={team.logo_url} alt={team.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-gray-500">
              {team.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <TextLink
          href={`${basePath}/${leagueSlug}/teams/${team.slug}`}
          className={`truncate text-xs sm:text-sm ${isWinner ? "text-emerald-950 font-semibold" : "text-gray-800"}`}
        >
          {team.name}
        </TextLink>
        {isWinner && (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-label="Ganador" />
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0 text-right">
        {penalties !== null && (
          <span className="rounded-xs bg-gray-100 px-1 py-0.5 text-[10px] font-normal text-gray-500" title="Penales">
            ({penalties}p)
          </span>
        )}
        <span className={`min-w-6 text-center text-sm ${isWinner ? "font-black text-emerald-700" : "font-semibold text-gray-600"}`}>
          {score}
        </span>
      </div>
    </div>
  );
}

function MatchSeriesCard({
  series,
  leagueSlug,
  basePath,
  isFinal = false,
}: {
  series: PlayoffSeries;
  leagueSlug: string;
  basePath: string;
  isFinal?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-white shadow-xs overflow-hidden transition hover:shadow-md ${
        isFinal ? "border-amber-400 ring-2 ring-amber-300/30" : "border-gray-200"
      }`}
    >
      <div className={`px-3 py-1.5 text-[11px] font-medium border-b flex items-center justify-between ${
        isFinal ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-gray-50 text-gray-500 border-gray-100"
      }`}>
        <span className="flex items-center gap-1 font-semibold uppercase tracking-wider">
          {isFinal && <Trophy className="h-3.5 w-3.5 text-amber-600" />}
          {isFinal ? "Gran Final" : series.stage.replace(/_/g, " ")}
        </span>
        <span className="text-[10px] text-gray-400">
          {series.format === "two_legged" ? "Ida y Vuelta (Global)" : "Partido Único"}
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        <TeamRow
          team={series.teamA}
          score={series.teamAScore}
          penalties={series.teamAPenalties}
          isWinner={series.winnerId === series.teamA.id}
          leagueSlug={leagueSlug}
          basePath={basePath}
        />
        <TeamRow
          team={series.teamB}
          score={series.teamBScore}
          penalties={series.teamBPenalties}
          isWinner={series.winnerId === series.teamB.id}
          leagueSlug={leagueSlug}
          basePath={basePath}
        />
      </div>

      {/* Partidos individuales de la serie */}
      {series.matches.length > 0 && (
        <div className="bg-gray-50/70 px-3 py-1.5 border-t border-gray-100 text-[11px] text-gray-500 flex flex-wrap gap-2 justify-between">
          {series.matches.map((m, idx) => (
            <TextLink
              key={m.id}
              href={`${basePath}/${leagueSlug}/matches/${m.id}`}
              className="text-gray-500 hover:text-emerald-700"
            >
              {series.format === "two_legged" ? (idx === 0 ? "Ida: " : "Vuelta: ") : "Detalle: "}
              <span className="font-semibold text-gray-700">
                {m.home_score} - {m.away_score}
              </span>
              {m.status !== "completed" && <span className="text-amber-600 ml-1">({m.status})</span>}
            </TextLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function PlayoffBracket({
  bracket,
  leagueSlug,
  basePath = "/liga",
}: PlayoffBracketProps) {
  if (!bracket.hasPlayoffs) {
    return (
      <EmptyState
        title="Sin fase final programada"
        description="Aún no se han programado partidos de liguilla o eliminación directa (cuartos, semifinales o final) para esta temporada."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[720px] grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Columna 1: Cuartos de Final (o Semifinales si no hay cuartos) */}
          {bracket.quarterFinals.length > 0 ? (
            <div className="space-y-4">
              <div className="text-center pb-1 border-b border-gray-200">
                <Eyebrow as="div">Cuartos de Final</Eyebrow>
              </div>
              <div className="space-y-4">
                {bracket.quarterFinals.map((series) => (
                  <MatchSeriesCard
                    key={series.id}
                    series={series}
                    leagueSlug={leagueSlug}
                    basePath={basePath}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* Columna 2: Semifinales */}
          {bracket.semiFinals.length > 0 ? (
            <div className="space-y-4">
              <div className="text-center pb-1 border-b border-gray-200">
                <Eyebrow as="div">Semifinales</Eyebrow>
              </div>
              <div className="space-y-6">
                {bracket.semiFinals.map((series) => (
                  <MatchSeriesCard
                    key={series.id}
                    series={series}
                    leagueSlug={leagueSlug}
                    basePath={basePath}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* Columna 3: Gran Final & Tercer Lugar */}
          <div className="space-y-6">
            {bracket.final && (
              <div className="space-y-2">
                <div className="text-center pb-1 border-b border-amber-300">
                  <Eyebrow as="div" className="inline-flex items-center gap-1.5 text-amber-800 font-bold"><Trophy className="h-3.5 w-3.5" aria-hidden /> Gran Final</Eyebrow>
                </div>
                <MatchSeriesCard
                  series={bracket.final}
                  leagueSlug={leagueSlug}
                  basePath={basePath}
                  isFinal
                />
              </div>
            )}

            {bracket.thirdPlace && (
              <div className="space-y-2 pt-2">
                <div className="text-center pb-1 border-b border-gray-200">
                  <Eyebrow as="div">Tercer Lugar</Eyebrow>
                </div>
                <MatchSeriesCard
                  series={bracket.thirdPlace}
                  leagueSlug={leagueSlug}
                  basePath={basePath}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
