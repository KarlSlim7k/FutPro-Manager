import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppRole } from "@/types/database";
import type { LeaguePermissions } from "@/lib/permissions/league-permissions";

export const ALL_APP_ROLES: readonly AppRole[] = [
  "super_admin",
  "league_admin",
  "team_admin",
  "coach",
  "referee",
  "viewer",
] as const;

export const APP_ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  league_admin: "Admin de Liga",
  team_admin: "Admin de Equipo",
  coach: "Entrenador / Coach",
  referee: "Árbitro",
  viewer: "General / Viewer",
};

export const ALLOWED_TUTORIAL_TAGS: readonly string[] = [
  "general",
  "liga",
  "temporadas",
  "partidos",
  "arbitraje",
  "equipos",
  "plantilla",
  "cedula",
  "resultados",
  "standings",
  "notificaciones",
  "publico",
] as const;

export function isValidAppRole(role: string): role is AppRole {
  return (ALL_APP_ROLES as readonly string[]).includes(role);
}

/**
 * Mapea LeaguePermissions al conjunto de roles de tutoriales visibles.
 * Fail-closed: si no hay permisos válidos, solo retorna ['viewer'].
 */
export function getVisibleRolesForUser(permissions?: Partial<LeaguePermissions> | null): AppRole[] {
  if (!permissions) {
    return ["viewer"];
  }

  if (permissions.globalRole === "super_admin") {
    return [...ALL_APP_ROLES];
  }

  const visible = new Set<AppRole>(["viewer"]);

  if (permissions.canManageLeague || permissions.leagueRole === "league_admin") {
    visible.add("league_admin");
    visible.add("team_admin");
    visible.add("coach");
    visible.add("referee");
    return Array.from(visible);
  }

  if (
    permissions.leagueRole === "referee" ||
    (permissions.assignedMatchIds && permissions.assignedMatchIds.length > 0) ||
    permissions.canUpdateResults
  ) {
    visible.add("referee");
  }

  if (permissions.managedTeamIds && permissions.managedTeamIds.length > 0) {
    visible.add("team_admin");
    visible.add("coach");
  } else if (permissions.staffTeamIds && permissions.staffTeamIds.length > 0) {
    visible.add("coach");
  }

  return Array.from(visible);
}

/**
 * Resuelve los roles visibles de un usuario en un contexto global (sin leagueId específico),
 * consultando sus membresías en la base de datos de manera fail-closed.
 */
export async function getGlobalVisibleRoles(
  supabase: SupabaseClient,
  userId: string
): Promise<AppRole[]> {
  try {
    const [
      { data: profileData, error: profileError },
      { data: leagueMembers, error: leagueMembersError },
      { data: teamMembers, error: teamMembersError },
      { data: refereeMatches },
    ] = await Promise.all([
      supabase.from("profiles").select("global_role").eq("id", userId).maybeSingle(),
      supabase.from("league_members").select("role").eq("profile_id", userId),
      supabase.from("team_members").select("role").eq("profile_id", userId),
      supabase.from("matches").select("id").eq("referee_id", userId).limit(1),
    ]);

    if (profileError || leagueMembersError || teamMembersError) {
      return ["viewer"];
    }

    const globalRole = (profileData?.global_role as AppRole | null) ?? null;
    if (globalRole === "super_admin") {
      return [...ALL_APP_ROLES];
    }

    const visible = new Set<AppRole>(["viewer"]);

    const hasLeagueAdmin = leagueMembers?.some((m) => m.role === "league_admin");
    if (hasLeagueAdmin) {
      visible.add("league_admin");
      visible.add("team_admin");
      visible.add("coach");
      visible.add("referee");
      return Array.from(visible);
    }

    const hasReferee =
      (refereeMatches && refereeMatches.length > 0) ||
      leagueMembers?.some((m) => m.role === "referee");
    if (hasReferee) {
      visible.add("referee");
    }

    const hasTeamAdmin = teamMembers?.some((m) => m.role === "team_admin");
    const hasCoach = teamMembers?.some((m) => m.role === "coach");

    if (hasTeamAdmin) {
      visible.add("team_admin");
      visible.add("coach");
    } else if (hasCoach) {
      visible.add("coach");
    }

    return Array.from(visible);
  } catch {
    return ["viewer"];
  }
}

/**
 * Verifica si un usuario con ciertos roles permitidos puede ver un tutorial con target_roles dado.
 */
export function canUserAccessTutorial(
  tutorial: { target_roles: AppRole[]; is_published?: boolean },
  allowedRoles: AppRole[]
): boolean {
  if (tutorial.is_published === false && !allowedRoles.includes("super_admin") && !allowedRoles.includes("league_admin")) {
    return false;
  }

  if (allowedRoles.includes("super_admin")) {
    return true;
  }

  // Si el tutorial está dirigido a 'viewer', cualquiera lo puede ver
  if (tutorial.target_roles.includes("viewer")) {
    return true;
  }

  // Intersección de target_roles con allowedRoles
  return tutorial.target_roles.some((targetRole) => allowedRoles.includes(targetRole));
}
