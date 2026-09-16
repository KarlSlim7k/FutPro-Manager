import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { RoleBadge } from "@/components/members/role-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, League, Team } from "@/types/database";

type LeagueItem = Pick<League, "id" | "name" | "slug" | "status">;

interface MyTeamItem {
  id: string;
  name: string;
  slug: string;
  status: Team["status"];
  logo_url: string | null;
  role: AppRole;
  leagueName: string;
  leagueSlug: string;
}

export default async function TeamsHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch user's team memberships ("Mis equipos")
  let myTeams: MyTeamItem[] = [];
  const { data: memberRows } = await supabase
    .from("team_members")
    .select("team_id, role")
    .eq("profile_id", user.id);

  if (memberRows && memberRows.length > 0) {
    const teamIds = memberRows.map((m) => m.team_id);
    const { data: teamData } = await supabase
      .from("teams")
      .select("id, name, slug, status, logo_url, league_id, leagues(name, slug)")
      .in("id", teamIds);

    if (teamData) {
      const roleMap = new Map(memberRows.map((m) => [m.team_id, m.role as AppRole]));
      myTeams = teamData.map((t) => {
        const leagueInfo = t.leagues as unknown as { name: string; slug: string } | null;
        return {
          id: t.id,
          name: t.name,
          slug: t.slug,
          status: t.status,
          logo_url: t.logo_url,
          role: roleMap.get(t.id) ?? "viewer",
          leagueName: leagueInfo?.name ?? "Liga",
          leagueSlug: leagueInfo?.slug ?? "",
        };
      });
    }
  }

  // 2. Fetch all leagues for catalog navigation
  const { data: leaguesData, error: leaguesError } = await supabase
    .from("leagues")
    .select("id, name, slug, status")
    .order("created_at", { ascending: false });

  if (leaguesError) {
    throw leaguesError;
  }

  const leagues = (leaguesData ?? []) as LeagueItem[];

  return (
    <section className="space-y-8">
      <PageHeader
        title="Equipos"
        description="Administra los equipos a tu cargo o navega por liga."
        backHref="/dashboard"
        backLabel="Dashboard"
      />

      {/* Sección Mis Equipos */}
      {myTeams.length > 0 ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Mis equipos</h2>
            <p className="text-sm text-gray-600">
              Equipos donde participas como administrador o cuerpo técnico.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myTeams.map((team) => (
              <Card key={team.id} className="flex flex-col justify-between">
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="line-clamp-2 text-base">{team.name}</CardTitle>
                      <p className="text-xs text-gray-500">{team.leagueName}</p>
                    </div>
                    <RoleBadge role={team.role} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <StatusBadge variant={team.status === "active" ? "success" : "neutral"}>
                      {team.status}
                    </StatusBadge>
                  </div>
                  <ToolbarActions>
                    <TextLink href={`/dashboard/leagues/${team.leagueSlug}/teams/${team.slug}`}>
                      Detalle
                    </TextLink>
                    <TextLink href={`/dashboard/leagues/${team.leagueSlug}/teams/${team.slug}/roster`}>
                      Plantilla
                    </TextLink>
                    <TextLink href={`/dashboard/leagues/${team.leagueSlug}/teams/${team.slug}/staff`}>
                      Staff
                    </TextLink>
                    {team.role === "team_admin" ? (
                      <TextLink
                        href={`/dashboard/leagues/${team.leagueSlug}/teams/${team.slug}/edit`}
                        variant="muted"
                      >
                        Editar
                      </TextLink>
                    ) : null}
                  </ToolbarActions>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      {/* Sección Explorar por Liga */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {myTeams.length > 0 ? "Explorar por liga" : "Ligas disponibles"}
          </h2>
          <p className="text-sm text-gray-600">
            Selecciona una liga para gestionar o consultar sus equipos.
          </p>
        </div>

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
      </div>
    </section>
  );
}
