export interface IcsMatchItem {
  id: string;
  homeTeam: string;
  awayTeam: string;
  scheduledAt: string; // ISO date string
  durationMinutes?: number;
  leagueName: string;
  roundName?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  status?: string;
  matchUrl?: string;
}

export interface GenerateIcsOptions {
  calendarName: string;
  matches: IcsMatchItem[];
  leagueSlug?: string;
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function formatIcsDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

export function generateIcsCalendar(options: GenerateIcsOptions): string {
  const { calendarName, matches } = options;
  const now = new Date();
  const dtStamp = formatIcsDateTime(now);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FutPro Manager//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    "X-WR-TIMEZONE:America/Mexico_City",
  ];

  for (const match of matches) {
    const startDate = new Date(match.scheduledAt);
    if (isNaN(startDate.getTime())) continue;

    const durationMs = (match.durationMinutes ?? 90) * 60 * 1000;
    const endDate = new Date(startDate.getTime() + durationMs);

    const summary = `${match.homeTeam} vs ${match.awayTeam}`;
    const descParts: string[] = [
      `${match.leagueName}${match.roundName ? ` - ${match.roundName}` : ""}`,
    ];
    if (match.matchUrl) {
      descParts.push(`Ver detalles y marcador en vivo: ${match.matchUrl}`);
    }
    const description = descParts.join("\n");

    const locationParts: string[] = [];
    if (match.venueName) locationParts.push(match.venueName);
    if (match.venueAddress) locationParts.push(match.venueAddress);
    const location = locationParts.join(", ");

    const statusValue = match.status === "cancelled" ? "CANCELLED" : "CONFIRMED";

    lines.push(
      "BEGIN:VEVENT",
      `UID:match-${match.id}@futpromanager.com`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${formatIcsDateTime(startDate)}`,
      `DTEND:${formatIcsDateTime(endDate)}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      ...(location ? [`LOCATION:${escapeIcsText(location)}`] : []),
      `STATUS:${statusValue}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");

  return lines.join("\r\n") + "\r\n";
}
