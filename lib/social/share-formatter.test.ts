import { describe, it, expect } from "vitest";
import {
  formatMatchShareText,
  formatStandingsShareText,
  formatTopScorerShareText,
  formatTeamShareText,
  buildWhatsAppShareUrl,
  buildTwitterShareUrl,
} from "./share-formatter";

describe("share-formatter", () => {
  it("formats match share text for finished match with score", () => {
    const text = formatMatchShareText({
      leagueName: "Liga Premier Dominical",
      roundName: "Jornada 5",
      homeTeam: "Águilas FC",
      awayTeam: "Tigres del Norte",
      homeScore: 3,
      awayScore: 2,
      status: "completed",
      date: "Domingo 20 Septiembre, 10:00 AM",
      url: "https://futpro.app/liga/premier/matches/123",
    });

    expect(text).toContain("¡Resultado Final!");
    expect(text).toContain("Águilas FC* 3 - 2 *Tigres del Norte");
    expect(text).toContain("Jornada 5 • Domingo 20 Septiembre, 10:00 AM");
    expect(text).toContain("https://futpro.app/liga/premier/matches/123");
  });

  it("formats match share text for scheduled upcoming match", () => {
    const text = formatMatchShareText({
      leagueName: "Liga Premier Dominical",
      roundName: "Jornada 6",
      homeTeam: "Leones",
      awayTeam: "Pumas",
      status: "scheduled",
      date: "Domingo 27 Septiembre",
    });

    expect(text).toContain("Próximo Partido");
    expect(text).toContain("Leones* vs *Pumas");
  });

  it("formats standings share text with positions and points", () => {
    const text = formatStandingsShareText({
      leagueName: "Torneo de Verano",
      seasonName: "Apertura 2026",
      topTeams: [
        { position: 1, name: "Atlético San Pancho", points: 15 },
        { position: 2, name: "Real Betis Amateur", points: 12 },
        { position: 3, name: "Deportivo Azteca", points: 10 },
      ],
      url: "https://futpro.app/liga/verano/standings",
    });

    expect(text).toContain("Tabla de Posiciones — Torneo de Verano");
    expect(text).toContain("🥇 *Atlético San Pancho* — 15 pts");
    expect(text).toContain("🥈 *Real Betis Amateur* — 12 pts");
    expect(text).toContain("🥉 *Deportivo Azteca* — 10 pts");
  });

  it("formats top scorers share text", () => {
    const text = formatTopScorerShareText({
      leagueName: "Liga Premier",
      leaders: [
        { position: 1, name: "Carlos Hernández", teamName: "Águilas", goals: 11 },
        { position: 2, name: "Mateo Silva", teamName: "Tigres", goals: 9 },
      ],
    });

    expect(text).toContain("Tabla de Goleo — Liga Premier");
    expect(text).toContain("🥇 *Carlos Hernández* (Águilas) — 11 goles");
  });

  it("generates correct WhatsApp and Twitter share URLs", () => {
    const waUrl = buildWhatsAppShareUrl("Hola Mundo");
    expect(waUrl).toBe("https://wa.me/?text=Hola%20Mundo");

    const twUrl = buildTwitterShareUrl("Golazo", "https://futpro.app");
    expect(twUrl).toContain("https://twitter.com/intent/tweet?");
    expect(twUrl).toContain("text=Golazo");
    expect(twUrl).toContain("url=https%3A%2F%2Ffutpro.app");
  });
});
