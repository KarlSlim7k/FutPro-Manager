import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { PublicLeagueHeader } from "@/components/public/public-league-header";
import { PublicNav } from "@/components/public/public-nav";
import { PublicBreadcrumbs } from "@/components/public/public-breadcrumbs";
import { createPublicClient } from "@/lib/supabase/public";
import { getPublicLeagueBySlug } from "@/lib/leagues/get-public-league";
import type { Team } from "@/types/database";

export const revalidate = 60;

type TeamItem = Pick<Team, "id" | "name" | "slug" | "status">;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const league = await getPublicLeagueBySlug(slug);
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
  const league = await getPublicLeagueBySlug(slug);

  if (!league) notFound();

  const supabase = createPublicClient();

  const { data: teamsData } = await supabase
    .from("teams")
    .select("id, name, slug, status")
    .eq("league_id", league.id)
    .order("name", { ascending: true });

  const teams = (teamsData ?? []) as TeamItem[];

  return (
    <main className="w-full">
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
                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-900/80 hover:shadow-emerald-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-emerald-400 font-bold group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-colors">
                    {team.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                    {team.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge variant={team.status === "active" ? "success" : "neutral"}>
                    {team.status === "active" ? "Activo" : "Inactivo"}
                  </StatusBadge>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
