import { notFound, redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormSectionCard } from "@/components/ui/form-section-card";
import { PageHeader } from "@/components/ui/page-header";
import { canManageTeam, getLeaguePermissions } from "@/lib/permissions/league-permissions";
import { createClient } from "@/lib/supabase/server";
import {
  TeamMembersTable,
  type TeamMemberData,
} from "@/components/teams/team-members-table";
import {
  AddTeamMemberForm,
  type AvailableProfileOption,
} from "@/components/teams/add-team-member-form";
import type { AppRole, League, Team } from "@/types/database";

type LeagueSummary = Pick<League, "id" | "name" | "slug">;
type TeamSummary = Pick<Team, "id" | "name" | "slug">;

interface TeamStaffPageProps {
  params: Promise<{ slug: string; teamSlug: string }>;
}

export default async function TeamStaffPage({ params }: TeamStaffPageProps) {
  const { slug, teamSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: leagueData, error: leagueError } = await supabase
    .from("leagues")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (leagueError || !leagueData) {
    notFound();
  }

  const league = leagueData as LeagueSummary;

  const { data: teamData, error: teamError } = await supabase
    .from("teams")
    .select("id, name, slug")
    .eq("league_id", league.id)
    .eq("slug", teamSlug)
    .maybeSingle();

  if (teamError || !teamData) {
    notFound();
  }

  const team = teamData as TeamSummary;

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

  const canManage = canManageTeam(permissions, team.id);

  // Fetch team_members
  const { data: teamMembersData, error: membersError } = await supabase
    .from("team_members")
    .select("id, profile_id, role, created_at")
    .eq("team_id", team.id)
    .order("created_at", { ascending: true });

  if (membersError) {
    throw membersError;
  }

  const teamMembers = (teamMembersData ?? []) as Array<{
    id: string;
    profile_id: string;
    role: AppRole;
    created_at: string;
  }>;

  const profileIds = [...new Set(teamMembers.map((m) => m.profile_id))];
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

  const membersList: TeamMemberData[] = teamMembers.map((m) => {
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

  // Fetch available profiles in league to add to staff
  let availableProfiles: AvailableProfileOption[] = [];
  if (canManage) {
    const existingProfileIds = new Set(teamMembers.map((m) => m.profile_id));
    const { data: leagueMembersData } = await supabase
      .from("league_members")
      .select("profile_id")
      .eq("league_id", league.id);

    const leagueMemberProfileIds = (leagueMembersData ?? [])
      .map((lm) => lm.profile_id)
      .filter((id) => !existingProfileIds.has(id));

    if (leagueMemberProfileIds.length > 0) {
      const { data: candidateProfiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name")
        .in("id", leagueMemberProfileIds);

      if (candidateProfiles) {
        availableProfiles = candidateProfiles.map((p) => ({
          id: p.id,
          fullName: p.full_name || `Usuario ${p.id.slice(0, 8)}...`,
          displayName: p.display_name,
        }));
      }
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        backHref={`/dashboard/leagues/${league.slug}/teams/${team.slug}`}
        backLabel="Volver al equipo"
        title={`Staff de ${team.name}`}
        description={`Administra el cuerpo técnico y administradores de ${team.name} en ${league.name}.`}
      />

      {canManage ? (
        <FormSectionCard title="Agregar miembro al staff">
          <AddTeamMemberForm
            leagueSlug={league.slug}
            teamSlug={team.slug}
            availableProfiles={availableProfiles}
          />
        </FormSectionCard>
      ) : (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-gray-600">
              Tienes acceso de consulta al staff de este equipo. La gestión está disponible para administradores de equipo y de liga.
            </p>
          </CardContent>
        </Card>
      )}

      {membersList.length === 0 ? (
        <EmptyState
          title="Sin miembros en el staff"
          description="Este equipo aún no tiene miembros registrados en su cuerpo técnico o administración."
        />
      ) : (
        <TeamMembersTable
          members={membersList}
          canManage={canManage}
          leagueSlug={league.slug}
          teamSlug={team.slug}
        />
      )}
    </section>
  );
}
