import { redirect } from "next/navigation";
import { LeagueCard } from "@/components/leagues/league-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Ligas</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Visualiza las ligas disponibles para tu usuario según las políticas RLS.
          </p>
        </div>
        <Button variant="secondary" disabled>
          Crear liga (próximamente)
        </Button>
      </div>

      {leagues.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Sin ligas disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              No tienes ligas visibles por ahora. Cuando tengas acceso, aparecerán aquí.
            </p>
          </CardContent>
        </Card>
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
