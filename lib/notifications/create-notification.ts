import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserNotificationType } from "@/types/database";

export interface CreateNotificationParams {
  supabase: SupabaseClient;
  userId: string;
  leagueId?: string | null;
  type?: UserNotificationType;
  title: string;
  message: string;
  linkUrl?: string | null;
}

export async function createNotification({
  supabase,
  userId,
  leagueId = null,
  type = "match_assignment",
  title,
  message,
  linkUrl = null,
}: CreateNotificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("user_notifications").insert({
      user_id: userId,
      league_id: leagueId,
      type,
      title,
      message,
      link_url: linkUrl,
    });

    if (error) {
      console.error("[createNotification] Error inserting notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("[createNotification] Unexpected error:", err);
    return { success: false, error: String(err) };
  }
}
