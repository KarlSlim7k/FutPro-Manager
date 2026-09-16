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
  theme?: "light" | "dark";
}

function TeamRow({
  team,
  score,
  penalties,
  isWinner,
  leagueSlug,
  basePath,
  isDark = false,
}: {
  team: PlayoffTeam;
  score: number;
  penalties: number | null;
  isWinner: boolean;
  leagueSlug: string;
  basePath: string;
  isDark?: boolean;
}) {
  const winnerBg = isDark ? "bg-emerald-500/15 font-bold text-white" : "bg-emerald-50/80 font-bold text-gray-900";
  const regularBg = isDark ? "text-gray-300 hover:bg-white/5" : "text-gray-700 hover:bg-gray-50";

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 transition-colors ${
        isWinner ? winnerBg : regularBg
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <div className={`relative h-6 w-6 overflow-hidden rounded-full shrink-0 border ${
          isDark ? "bg-slate-800 border-white/10" : "bg-gray-100 border-gray-200"
        }`}>
          {team.logo_url ? (
            <Image src={team.logo_url} alt={team.name} fill className="object-cover" />
          ) : (
            <div className={`flex h-full w-full items-center justify-center text-[10px] font-semibold ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}>
              {team.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <TextLink
          href={`${basePath}/${leagueSlug}/teams/${team.slug}`}
          className={`truncate text-xs sm:text-sm ${
            isWinner
              ? isDark ? "text-emerald-300 font-semibold" : "text-emerald-950 font-semibold"
              : isDark ? "text-gray-200 hover:text-emerald-400" : "text-gray-800"
          }`}
        >
          {team.name}
        </TextLink>
        {isWinner && (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" aria-label="Ganador" />
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0 text-right">
        {penalties !== null && (
          <span className={`rounded-xs px-1 py-0.5 text-[10px] font-normal ${
            isDark ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-500"
          }`} title="Penales">
            ({penalties}p)
          </span>
        )}
        <span className={`min-w-6 text-center text-sm ${
          isWinner
            ? isDark ? "font-black text-emerald-400" : "font-black text-emerald-700"
            : isDark ? "font-semibold text-gray-300" : "font-semibold text-gray-600"
        }`}>
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
  isDark = false,
}: {
  series: PlayoffSeries;
  leagueSlug: string;
  basePath: string;
  isFinal?: boolean;
  isDark?: boolean;
}) {
  const cardBorder = isFinal
    ? "border-amber-400/60 ring-2 ring-amber-400/20"
    : isDark ? "border-white/10" : "border-gray-200";

  const cardBg = isDark ? "bg-slate-900/60 backdrop-blur-md" : "bg-white";

  const headerBg = isFinal
    ? isDark ? "bg-amber-950/40 text-amber-300 border-amber-500/20" : "bg-amber-50 text-amber-800 border-amber-200"
    : isDark ? "bg-white/5 text-gray-300 border-white/10" : "bg-gray-50 text-gray-500 border-gray-100";

  return (
    <div
      className={`rounded-xl border shadow-sm overflow-hidden transition hover:shadow-md ${cardBorder} ${cardBg}`}
    >
      <div className={`px-3 py-1.5 text-[11px] font-medium border-b flex items-center justify-between ${headerBg}`}>
        <span className="flex items-center gap-1 font-semibold uppercase tracking-wider">
          {isFinal && <Trophy className="h-3.5 w-3.5 text-amber-400" />}
          {isFinal ? "Gran Final" : series.stage.replace(/_/g, " ")}
        </span>
        <span className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-400"}`}>
          {series.format === "two_legged" ? "Ida y Vuelta (Global)" : "Partido Único"}
        </span>
      </div>

      <div className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
        <TeamRow
          team={series.teamA}
          score={series.teamAScore}
          penalties={series.teamAPenalties}
          isWinner={series.winnerId === series.teamA.id}
          leagueSlug={leagueSlug}
          basePath={basePath}
          isDark={isDark}
        />
        <TeamRow
          team={series.teamB}
          score={series.teamBScore}
          penalties={series.teamBPenalties}
          isWinner={series.winnerId === series.teamB.id}
          leagueSlug={leagueSlug}
          basePath={basePath}
          isDark={isDark}
        />
      </div>

      {/* Partidos individuales de la serie */}
      {series.matches.length > 0 && (
        <div className={`px-3 py-1.5 border-t text-[11px] flex flex-wrap gap-2 justify-between ${
          isDark ? "bg-white/5 border-white/10 text-gray-400" : "bg-gray-50/70 border-gray-100 text-gray-500"
        }`}>
          {series.matches.map((m, idx) => (
            <TextLink
              key={m.id}
              href={`${basePath}/${leagueSlug}/matches/${m.id}`}
              className={isDark ? "text-gray-400 hover:text-emerald-400" : "text-gray-500 hover:text-emerald-700"}
            >
              {series.format === "two_legged" ? (idx === 0 ? "Ida: " : "Vuelta: ") : "Detalle: "}
              <span className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                {m.home_score} - {m.away_score}
              </span>
              {m.status !== "completed" && <span className="text-amber-400 ml-1">({m.status})</span>}
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
  theme,
}: PlayoffBracketProps) {
  const isDark = theme === "dark" || (theme === undefined && basePath.startsWith("/liga"));
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
              <div className={`text-center pb-1 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
                <Eyebrow as="div" className={isDark ? "text-gray-300 font-semibold" : undefined}>Cuartos de Final</Eyebrow>
              </div>
              <div className="space-y-4">
                {bracket.quarterFinals.map((series) => (
                  <MatchSeriesCard
                    key={series.id}
                    series={series}
                    leagueSlug={leagueSlug}
                    basePath={basePath}
                    isDark={isDark}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* Columna 2: Semifinales */}
          {bracket.semiFinals.length > 0 ? (
            <div className="space-y-4">
              <div className={`text-center pb-1 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
                <Eyebrow as="div" className={isDark ? "text-gray-300 font-semibold" : undefined}>Semifinales</Eyebrow>
              </div>
              <div className="space-y-6">
                {bracket.semiFinals.map((series) => (
                  <MatchSeriesCard
                    key={series.id}
                    series={series}
                    leagueSlug={leagueSlug}
                    basePath={basePath}
                    isDark={isDark}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* Columna 3: Gran Final & Tercer Lugar */}
          <div className="space-y-6">
            {bracket.final && (
              <div className="space-y-2">
                <div className={`text-center pb-1 border-b ${isDark ? "border-amber-500/30" : "border-amber-300"}`}>
                  <Eyebrow as="div" className={`inline-flex items-center gap-1.5 font-bold ${isDark ? "text-amber-400" : "text-amber-800"}`}>
                    <Trophy className="h-3.5 w-3.5" aria-hidden /> Gran Final
                  </Eyebrow>
                </div>
                <MatchSeriesCard
                  series={bracket.final}
                  leagueSlug={leagueSlug}
                  basePath={basePath}
                  isFinal
                  isDark={isDark}
                />
              </div>
            )}

            {bracket.thirdPlace && (
              <div className="space-y-2 pt-2">
                <div className={`text-center pb-1 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
                  <Eyebrow as="div" className={isDark ? "text-gray-300 font-semibold" : undefined}>Tercer Lugar</Eyebrow>
                </div>
                <MatchSeriesCard
                  series={bracket.thirdPlace}
                  leagueSlug={leagueSlug}
                  basePath={basePath}
                  isDark={isDark}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
