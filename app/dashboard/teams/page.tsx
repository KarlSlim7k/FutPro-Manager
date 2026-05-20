import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextLink } from "@/components/ui/text-link";
import { StatusBadge } from "@/components/ui/status-badge";
import { createClient } from "@/lib/supabase/server";
import type { League } from "@/types/database";

type LeagueItem = Pick<League, "id" | "name" | "slug" | "status">;

export default async function TeamsHubPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("leagues")
    .select("id, name, slug, status")
    .order("created_at", { ascending: false });

  if (error) throw error;
  const leagues = (data ?? []) as LeagueItem[];

  return (
    <section className="space-y-6">
      <PageHeader
        title="Equipos"
        description="Selecciona una liga para gestionar sus equipos."
        backHref="/dashboard"
        backLabel="← Dashboard"
      />
      {leagues.length === 0 ? (
        <EmptyState
          title="Sin ligas disponibles"
          description="Primero crea una liga para poder gestionar equipos."
          action={<TextLink href="/dashboard/leagues">Ir a Ligas</TextLink>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league) => (
            <Card key={league.id} className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-base">{league.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <StatusBadge variant={league.status === "active" ? "success" : "neutral"}>
                  {league.status}
                </StatusBadge>
                <div>
                  <Link
                    href={`/dashboard/leagues/${league.slug}/teams`}
                    className="inline-flex items-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                  >
                    Ver equipos
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
