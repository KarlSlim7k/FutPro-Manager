import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { PublicLeagueHeader } from "@/components/public/public-league-header";
import { PublicNav } from "@/components/public/public-nav";
import { PublicBreadcrumbs } from "@/components/public/public-breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import type { League, Team } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug" | "description" | "status" | "logo_url">;
type TeamItem = Pick<Team, "id" | "name" | "slug" | "status">;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: league } = await supabase
    .from("leagues")
    .select("name")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("status", "active")
    .maybeSingle();
  if (!league) return { title: "No encontrado | FutPro Manager" };
  const title = `Equipos - ${league.name} | FutPro Manager`;
  const description = `Listado de equipos de ${league.name}.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_MX",
      siteName: "FutPro Manager",
      images: [{ url: "/og/futpro-manager.jpg", width: 640, height: 640 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/futpro-manager.jpg"],
    },
  };
}

export default async function PublicTeamsPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: leagueData } = await supabase
    .from("leagues")
    .select("id, name, slug, description, status, logo_url")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("status", "active")
    .maybeSingle();

  if (!leagueData) notFound();
  const league = leagueData as LeagueSummary;

  const { data: teamsData } = await supabase
    .from("teams")
    .select("id, name, slug, status")
    .eq("league_id", league.id)
    .order("name", { ascending: true });

  const teams = (teamsData ?? []) as TeamItem[];

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-100">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <PublicLeagueHeader league={league} />
        <PublicNav leagueSlug={league.slug} />
        <PublicBreadcrumbs
          items={[
            { label: league.name, href: `/liga/${league.slug}` },
            { label: "Equipos" },
          ]}
        />

        {teams.length === 0 ? (
          <EmptyState
            title="Sin equipos registrados"
            description="Esta liga aún no tiene equipos públicos disponibles."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <Link
                key={team.id}
                href={`/liga/${league.slug}/teams/${team.slug}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                <span className="font-medium text-gray-900">{team.name}</span>
                <StatusBadge variant={team.status === "active" ? "success" : "neutral"}>
                  {team.status === "active" ? "Activo" : "Inactivo"}
                </StatusBadge>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
