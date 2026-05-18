import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LeagueMembersTable, type LeagueMemberData } from "@/components/members/league-members-table";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";

interface LeagueMembersPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LeagueMembersPage({ params }: LeagueMembersPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: league, error: leagueError } = await supabase
    .from("leagues")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (leagueError) {
    throw leagueError;
  }

  if (!league) {
    notFound();
  }

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

  const { data: membersData, error: membersError } = await supabase
    .from("league_members")
    .select("id, profile_id, role, created_at")
    .eq("league_id", league.id)
    .order("created_at", { ascending: true });

  if (membersError) {
    throw membersError;
  }

  const members = membersData ?? [];

  // Batch-fetch profile info for all members
  const profileIds = [...new Set(members.map((m) => m.profile_id))];
  let profilesMap = new Map<string, { full_name: string | null; display_name: string | null }>();

  if (profileIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, display_name")
      .in("id", profileIds);

    if (profilesData) {
      profilesMap = new Map(
        profilesData.map((p) => [p.id, { full_name: p.full_name, display_name: p.display_name }])
      );
    }
  }

  const membersList: LeagueMemberData[] = members.map((m) => {
    const profile = profilesMap.get(m.profile_id);
    return {
      id: m.id,
      profileId: m.profile_id,
      role: m.role,
      createdAt: m.created_at,
      profileName: profile?.full_name ?? null,
      profileDisplayName: profile?.display_name ?? null,
    };
  });

  return (
    <section className="space-y-6">
      <PageHeader
        backHref={`/dashboard/leagues/${league.slug}`}
        backLabel="Volver a la liga"
        title="Miembros"
        description={`Miembros de ${league.name}`}
      />

      {!permissions.canManageMembers && (
        <Card>
          <CardHeader>
            <CardTitle>Acceso restringido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Solo los administradores de la liga pueden gestionar roles y miembros.
              Puedes ver la lista de miembros a continuacion.
            </p>
          </CardContent>
        </Card>
      )}

      {membersList.length === 0 ? (
        <EmptyState
          title="Sin miembros"
          description="Esta liga aun no tiene miembros registrados."
        />
      ) : (
        <LeagueMembersTable
          members={membersList}
          permissions={permissions}
          leagueSlug={league.slug}
        />
      )}
    </section>
  );
}
