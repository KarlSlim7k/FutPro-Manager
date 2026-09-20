export interface MatchShareData {
  leagueName: string;
  roundName?: string | null;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number | null;
  awayScore?: number | null;
  status: string;
  date?: string | null;
  url?: string;
}

export interface StandingsShareData {
  leagueName: string;
  seasonName?: string | null;
  topTeams: Array<{ position: number; name: string; points: number }>;
  url?: string;
}

export interface TopScorerShareData {
  leagueName: string;
  leaders: Array<{ position: number; name: string; teamName: string; goals: number }>;
  url?: string;
}

export interface TeamShareData {
  teamName: string;
  leagueName: string;
  url?: string;
}

export function formatMatchShareText(data: MatchShareData): string {
  const isFinished = data.status === "completed";
  const isInProgress = data.status === "in_progress";
  
  let header = `⚽ *${data.leagueName}*`;
  if (isFinished) {
    header += " — ¡Resultado Final!";
  } else if (isInProgress) {
    header += " — ¡En Vivo!";
  } else {
    header += " — Próximo Partido";
  }

  const scoreText = (isFinished || isInProgress) && data.homeScore !== null && data.awayScore !== null
    ? `${data.homeScore} - ${data.awayScore}`
    : "vs";

  const matchLine = `🟢 *${data.homeTeam}* ${scoreText} *${data.awayTeam}* 🔴`;
  const meta: string[] = [];
  if (data.roundName) meta.push(data.roundName);
  if (data.date) meta.push(data.date);

  const metaLine = meta.length > 0 ? `📅 ${meta.join(" • ")}` : "";
  const ctaLine = data.url ? `\n👉 Sigue el partido y estadísticas:\n${data.url}` : "";

  return [header, "", matchLine, ...(metaLine ? [metaLine] : []), ...(ctaLine ? [ctaLine] : [])].join("\n");
}

export function formatStandingsShareText(data: StandingsShareData): string {
  const header = `🏆 *Tabla de Posiciones — ${data.leagueName}*`;
  const sub = data.seasonName ? `Temporada: ${data.seasonName}\n` : "";

  const rows = data.topTeams.map((t) => {
    const medal = t.position === 1 ? "🥇" : t.position === 2 ? "🥈" : t.position === 3 ? "🥉" : `${t.position}.`;
    return `${medal} *${t.name}* — ${t.points} pts`;
  });

  const ctaLine = data.url ? `\n👉 Consulta la tabla completa:\n${data.url}` : "";

  return [header, ...(sub ? [sub] : [""]), ...rows, ...(ctaLine ? [ctaLine] : [])].join("\n");
}

export function formatTopScorerShareText(data: TopScorerShareData): string {
  const header = `👟 *Tabla de Goleo — ${data.leagueName}*`;

  const rows = data.leaders.map((p) => {
    const medal = p.position === 1 ? "🥇" : p.position === 2 ? "🥈" : p.position === 3 ? "🥉" : `${p.position}.`;
    return `${medal} *${p.name}* (${p.teamName}) — ${p.goals} goles`;
  });

  const ctaLine = data.url ? `\n👉 Ver tabla de goleadores completa:\n${data.url}` : "";

  return [header, "", ...rows, ...(ctaLine ? [ctaLine] : [])].join("\n");
}

export function formatTeamShareText(data: TeamShareData): string {
  const header = `🛡️ *${data.teamName}* en ${data.leagueName}`;
  const ctaLine = data.url ? `\n👉 Conoce la plantilla, calendario y estadísticas del equipo:\n${data.url}` : "";
  return [header, ...(ctaLine ? [ctaLine] : [])].join("\n");
}

export function buildWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildTwitterShareUrl(text: string, url?: string): string {
  const params = new URLSearchParams();
  params.set("text", text);
  if (url) params.set("url", url);
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}
