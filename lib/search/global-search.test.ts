import { describe, it, expect, vi } from "vitest";
import { performGlobalSearch } from "./global-search";

describe("performGlobalSearch", () => {
  it("returns empty results for empty or single char query without DB call", async () => {
    const mockSupabase = { from: vi.fn() } as any;
    const result = await performGlobalSearch(mockSupabase, " a ");
    expect(result).toEqual({ leagues: [], teams: [], players: [] });
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it("queries leagues, teams and players with ilike pattern and maps response correctly", async () => {
    const createQueryMock = (data: any[]) => {
      const mockQuery: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data, error: null }),
      };
      return mockQuery;
    };

    const leaguesData = [{ id: "l1", name: "Liga Premier", slug: "liga-premier", logo_url: "/logo.png" }];
    const teamsData = [
      {
        id: "t1",
        name: "Águilas",
        slug: "aguilas",
        logo_url: null,
        league: { name: "Liga Premier", slug: "liga-premier" },
      },
    ];
    const playersData = [
      {
        id: "p1",
        full_name: "Carlos Vela",
        preferred_position: "Delantero",
        league: { name: "Liga Premier", slug: "liga-premier" },
      },
    ];

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "leagues") return createQueryMock(leaguesData);
        if (table === "teams") return createQueryMock(teamsData);
        if (table === "players") return createQueryMock(playersData);
        return createQueryMock([]);
      }),
    } as any;

    const result = await performGlobalSearch(mockSupabase, "Carlos");

    expect(result.leagues).toHaveLength(1);
    expect(result.leagues[0].name).toBe("Liga Premier");
    expect(result.teams).toHaveLength(1);
    expect(result.teams[0].name).toBe("Águilas");
    expect(result.players).toHaveLength(1);
    expect(result.players[0].fullName).toBe("Carlos Vela");
  });
});
