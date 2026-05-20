import Link from "next/link";
import { redirect } from "next/navigation";
import { LeagueCard } from "@/components/leagues/league-card";
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
          <Link
            href="/dashboard/leagues/new"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
          >
            Crear liga
          </Link>
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
