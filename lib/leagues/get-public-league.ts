import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { League } from "@/types/database";

export type PublicLeague = Pick<
  League,
  "id" | "name" | "slug" | "description" | "status" | "logo_url"
>;

/**
 * Consulta y devuelve una liga pública activa por su slug.
 * Deduplicada a nivel de request mediante React cache() para evitar
 * consultas repetidas entre generateMetadata y el Server Component de la página.
 */
export const getPublicLeagueBySlug = cache(
  async (slug: string): Promise<PublicLeague | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("leagues")
      .select("id, name, slug, description, status, logo_url")
      .eq("slug", slug)
      .eq("is_public", true)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as PublicLeague | null) ?? null;
  }
);
