"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { RefereeAvailabilityStatus } from "@/types/database";

export interface AvailabilityFormState {
  success: boolean;
  message: string | null;
}

export async function saveRefereeAvailabilityAction(
  prevState: AvailabilityFormState,
  formData: FormData
): Promise<AvailabilityFormState> {
  void prevState;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Debes iniciar sesión para registrar tu disponibilidad." };
  }

  const leagueId = String(formData.get("leagueId") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const status = (String(formData.get("status") ?? "unavailable").trim()) as RefereeAvailabilityStatus;
  const startTimeRaw = String(formData.get("startTime") ?? "").trim();
  const endTimeRaw = String(formData.get("endTime") ?? "").trim();
  const notesRaw = String(formData.get("notes") ?? "").trim();

  if (!leagueId) {
    return { success: false, message: "Debes seleccionar una liga." };
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { success: false, message: "Debes proporcionar una fecha válida (AAAA-MM-DD)." };
  }

  const validStatuses: RefereeAvailabilityStatus[] = ["available", "unavailable", "tentative"];
  if (!validStatuses.includes(status)) {
    return { success: false, message: "Estado de disponibilidad no válido." };
  }

  // Verificar membresía en la liga
  const { data: membership } = await supabase
    .from("league_members")
    .select("role")
    .eq("league_id", leagueId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!membership) {
    return { success: false, message: "No eres miembro de la liga seleccionada." };
  }

  const startTime = startTimeRaw || null;
  const endTime = endTimeRaw || null;
  const notes = notesRaw || null;

  const { error } = await supabase
    .from("referee_availabilities")
    .upsert(
      {
        profile_id: user.id,
        league_id: leagueId,
        date,
        start_time: startTime,
        end_time: endTime,
        status,
        notes,
      },
      { onConflict: "profile_id, league_id, date" }
    );

  if (error) {
    console.error("[saveRefereeAvailabilityAction] Error:", error);
    return { success: false, message: "Error al guardar disponibilidad: " + error.message };
  }

  revalidatePath("/dashboard/matches");
  return { success: true, message: "Disponibilidad registrada correctamente." };
}

export async function deleteRefereeAvailabilityAction(
  availabilityId: string
): Promise<{ success: boolean; message: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "No autenticado." };
  }

  const { error } = await supabase
    .from("referee_availabilities")
    .delete()
    .eq("id", availabilityId);

  if (error) {
    return { success: false, message: "No se pudo eliminar el registro." };
  }

  revalidatePath("/dashboard/matches");
  return { success: true, message: "Registro de disponibilidad eliminado." };
}
