import { redirect } from "next/navigation";
import { LeagueCard } from "@/components/leagues/league-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import type { League } from "@/types/database";

type LeagueListItem = Pick<
  League,
  "id" | "name" | "slug" | "region" | "city" | "state" | "country" | "status" | "is_public" | "created_at"
>;

export default async function LeaguesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("leagues")
    .select("id, name, slug, region, city, state, country, status, is_public, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const leagues = (data ?? []) as LeagueListItem[];

  return (
    <section className="space-y-6">
      <PageHeader
        title="Ligas"
        description="Visualiza las ligas disponibles para tu usuario según las políticas RLS."
        action={
          <Button variant="secondary" disabled>
            Crear liga (próximamente)
          </Button>
        }
      />

      {leagues.length === 0 ? (
        <EmptyState
          title="Sin ligas disponibles"
          description="No tienes ligas visibles por ahora. Cuando tengas acceso, aparecerán aquí."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {leagues.map((league) => (
            <LeagueCard key={league.id} league={league} />
          ))}
        </div>
      )}
    </section>
  );
}
