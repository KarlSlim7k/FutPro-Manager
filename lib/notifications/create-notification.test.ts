import { describe, it, expect, vi } from "vitest";
import { createNotification } from "./create-notification";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("createNotification", () => {
  it("inserts notification into user_notifications successfully", async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    const supabase = {
      from: vi.fn().mockReturnValue({
        insert: insertMock,
      }),
    } as unknown as SupabaseClient;

    const result = await createNotification({
      supabase,
      userId: "user-123",
      leagueId: "league-456",
      type: "match_assignment",
      title: "Designación arbitral",
      message: "Has sido asignado a un partido.",
      linkUrl: "/dashboard/matches/match-789",
    });

    expect(result.success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith("user_notifications");
    expect(insertMock).toHaveBeenCalledWith({
      user_id: "user-123",
      league_id: "league-456",
      type: "match_assignment",
      title: "Designación arbitral",
      message: "Has sido asignado a un partido.",
      link_url: "/dashboard/matches/match-789",
    });
  });

  it("handles insert error gracefully without throwing", async () => {
    const insertMock = vi.fn().mockResolvedValue({
      error: { message: "Permission denied" },
    });
    const supabase = {
      from: vi.fn().mockReturnValue({
        insert: insertMock,
      }),
    } as unknown as SupabaseClient;

    const result = await createNotification({
      supabase,
      userId: "user-123",
      title: "Test",
      message: "Test message",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Permission denied");
  });
});
