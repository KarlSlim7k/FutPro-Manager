import { describe, it, expect } from "vitest";
import { generateIcsCalendar } from "./generate-ics";

describe("generateIcsCalendar", () => {
  it("generates a valid RFC 5545 VCALENDAR structure", () => {
    const ics = generateIcsCalendar({
      calendarName: "Liga Premier 2026",
      matches: [
        {
          id: "m-101",
          homeTeam: "Club Real",
          awayTeam: "Inter Azteca",
          scheduledAt: "2026-10-15T18:00:00.000Z",
          durationMinutes: 90,
          leagueName: "Liga Premier",
          roundName: "Jornada 1",
          venueName: "Estadio Central",
          venueAddress: "Av. Insurgentes 100",
          matchUrl: "https://futpro.app/liga/premier/matches/m-101",
        },
      ],
    });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("X-WR-CALNAME:Liga Premier 2026");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("UID:match-m-101@futpromanager.com");
    expect(ics).toContain("DTSTART:20261015T180000Z");
    expect(ics).toContain("DTEND:20261015T193000Z");
    expect(ics).toContain("SUMMARY:Club Real vs Inter Azteca");
    expect(ics).toContain("LOCATION:Estadio Central\\, Av. Insurgentes 100");
    expect(ics).toContain("STATUS:CONFIRMED");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("handles cancelled match status correctly", () => {
    const ics = generateIcsCalendar({
      calendarName: "Liga Torneo",
      matches: [
        {
          id: "m-102",
          homeTeam: "Tigres",
          awayTeam: "Pumas",
          scheduledAt: "2026-11-01T12:00:00.000Z",
          leagueName: "Liga Torneo",
          status: "cancelled",
        },
      ],
    });

    expect(ics).toContain("STATUS:CANCELLED");
  });

  it("escapes special characters such as commas, semicolons and newlines", () => {
    const ics = generateIcsCalendar({
      calendarName: "Torneo Especial, Edición 2026; Copa",
      matches: [
        {
          id: "m-103",
          homeTeam: "Equipo A, B",
          awayTeam: "Equipo C",
          scheduledAt: "2026-11-05T10:00:00.000Z",
          leagueName: "Liga, Copas",
          venueName: "Cancha 1; Zona Norte",
        },
      ],
    });

    expect(ics).toContain("X-WR-CALNAME:Torneo Especial\\, Edición 2026\\; Copa");
    expect(ics).toContain("SUMMARY:Equipo A\\, B vs Equipo C");
    expect(ics).toContain("LOCATION:Cancha 1\\; Zona Norte");
  });
});
