"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import { createAuditLog } from "@/lib/audit/create-audit-log";
import { createNotification } from "@/lib/notifications/create-notification";
import { MATCH_OFFICIAL_ROLE_LABELS, type MatchOfficialRole } from "@/types/database";

export type UpdateRefereeState = {
  success: boolean;
  message: string | null;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseOfficialId(value: FormDataEntryValue | null): string | null {
  const str = String(value ?? "").trim();
  if (str === "" || str === "none" || str === "null") return null;
  return str;
}

export async function updateMatchRefereeAction(
  leagueSlug: string,
  matchId: string,
  prevState: UpdateRefereeState,
  formData: FormData
): Promise<UpdateRefereeState> {
  void prevState;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: league, error: leagueError } = await supabase
    .from("leagues")
    .select("id")
    .eq("slug", leagueSlug)
    .maybeSingle();

  if (leagueError) {
    return { success: false, message: "Error al buscar la liga." };
  }

  if (!league) {
    return { success: false, message: "Liga no encontrada." };
  }

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

  if (!permissions.canAssignReferees) {
    return { success: false, message: "No tienes permisos para asignar árbitros." };
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, referee_id")
    .eq("id", matchId)
    .eq("league_id", league.id)
    .maybeSingle();

  if (matchError) {
    return { success: false, message: "Error al buscar el partido." };
  }

  if (!match) {
    return { success: false, message: "Partido no encontrado en esta liga." };
  }

  const previousRefereeId = match.referee_id ?? null;

  // Leer asignaciones del cuerpo arbitral
  const headRefereeId =
    parseOfficialId(formData.get("headRefereeId")) ??
    parseOfficialId(formData.get("refereeId"));
  const firstAssistantId = parseOfficialId(formData.get("firstAssistantId"));
  const secondAssistantId = parseOfficialId(formData.get("secondAssistantId"));
  const fourthOfficialId = parseOfficialId(formData.get("fourthOfficialId"));

  const assignedOfficials: Array<{ role: MatchOfficialRole; profileId: string }> = [];

  if (headRefereeId) assignedOfficials.push({ role: "head_referee", profileId: headRefereeId });
  if (firstAssistantId) assignedOfficials.push({ role: "first_assistant", profileId: firstAssistantId });
  if (secondAssistantId) assignedOfficials.push({ role: "second_assistant", profileId: secondAssistantId });
  if (fourthOfficialId) assignedOfficials.push({ role: "fourth_official", profileId: fourthOfficialId });

  // Validar formato UUID
  for (const official of assignedOfficials) {
    if (!UUID_REGEX.test(official.profileId)) {
      return { success: false, message: "ID de árbitro no válido." };
    }
  }

  // Validar que no haya duplicados (una persona no puede tener 2 roles en el mismo partido)
  const profileIds = assignedOfficials.map((o) => o.profileId);
  const uniqueProfileIds = new Set(profileIds);
  if (uniqueProfileIds.size !== profileIds.length) {
    return {
      success: false,
      message: "Un mismo árbitro no puede ser asignado a más de una posición en el mismo partido.",
    };
  }

  // Validar membresía y rol en la liga
  if (profileIds.length > 0) {
    const { data: members, error: membersError } = await supabase
      .from("league_members")
      .select("profile_id, role")
      .in("profile_id", profileIds)
      .eq("league_id", league.id);

    if (membersError) {
      return { success: false, message: "Error al verificar miembros asignados." };
    }

    const memberMap = new Map((members ?? []).map((m) => [m.profile_id, m.role]));
    for (const official of assignedOfficials) {
      const role = memberMap.get(official.profileId);
      if (!role) {
        return { success: false, message: "Uno de los usuarios seleccionados no es miembro de esta liga." };
      }
      if (!["referee", "league_admin"].includes(role)) {
        return {
          success: false,
          message: "Solo se puede asignar a miembros con rol referee o league_admin.",
        };
      }
    }
  }

  // Actualizar tabla match_officials
  // 1. Eliminar asignaciones actuales del partido
  const { error: deleteOfficialsError } = await supabase
    .from("match_officials")
    .delete()
    .eq("match_id", matchId);

  if (deleteOfficialsError) {
    if (
      deleteOfficialsError.code === "42501" ||
      deleteOfficialsError.message?.toLowerCase().includes("row-level security")
    ) {
      return { success: false, message: "No tienes permisos para actualizar el cuerpo arbitral." };
    }
    return { success: false, message: "Error al actualizar asignaciones previas." };
  }

  // 2. Insertar nuevas asignaciones si existen
  if (assignedOfficials.length > 0) {
    const rowsToInsert = assignedOfficials.map((o) => ({
      match_id: matchId,
      profile_id: o.profileId,
      role: o.role,
    }));

    const { error: insertOfficialsError } = await supabase
      .from("match_officials")
      .insert(rowsToInsert);

    if (insertOfficialsError) {
      return { success: false, message: "No se pudo registrar el cuerpo arbitral." };
    }
  }

  // 3. Sincronizar matches.referee_id (compatible con trigger y fallback manual)
  const { error: updateMatchError } = await supabase
    .from("matches")
    .update({ referee_id: headRefereeId })
    .eq("id", matchId)
    .eq("league_id", league.id);

  if (updateMatchError) {
    return { success: false, message: "No se pudo sincronizar el árbitro principal del partido." };
  }

  // 4. Notificaciones automáticas in-app a los árbitros designados
  for (const official of assignedOfficials) {
    if (official.profileId !== user.id) {
      const roleLabel = MATCH_OFFICIAL_ROLE_LABELS[official.role];
      await createNotification({
        supabase,
        userId: official.profileId,
        leagueId: league.id,
        type: "match_assignment",
        title: "Nueva designación arbitral",
        message: `Has sido asignado como ${roleLabel} para un encuentro de la liga ${leagueSlug}.`,
        linkUrl: `/dashboard/leagues/${leagueSlug}/matches/${matchId}`,
      });
    }
  }

  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches/${matchId}`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/matches/${matchId}/cedula`);
  revalidatePath("/dashboard/matches");
  revalidatePath("/dashboard");

  // Auditoría best-effort
  await createAuditLog({
    supabase,
    actorId: user.id,
    leagueId: league.id,
    action: assignedOfficials.length > 0 ? "match.officials_updated" : "match.referee_removed",
    entityType: "match",
    entityId: matchId,
    metadata: {
      league_slug: leagueSlug,
      previous_referee_id: previousRefereeId,
      head_referee_id: headRefereeId,
      first_assistant_id: firstAssistantId,
      second_assistant_id: secondAssistantId,
      fourth_official_id: fourthOfficialId,
      officials_count: assignedOfficials.length,
    },
  });

  return { success: true, message: "Cuerpo arbitral actualizado correctamente." };
}
