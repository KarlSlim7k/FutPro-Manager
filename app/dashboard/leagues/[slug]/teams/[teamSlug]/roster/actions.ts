"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  PLAYER_REGISTRATION_STATUS_VALUES,
  type PlayerRegistrationStatus,
} from "@/types/database";

type CreatePlayerRegistrationField = "season_id" | "player_id" | "jersey_number" | "status";

type CreatePlayerRegistrationActionState = {
  values: {
    season_id: string;
    player_id: string;
    jersey_number: string;
    status: string;
  };
  fieldErrors: Partial<Record<CreatePlayerRegistrationField, string>>;
  formError: string | null;
};

function mapInsertErrorMessage(code?: string, message?: string | null, details?: string | null) {
  const normalizedErrorText = `${message ?? ""} ${details ?? ""}`.toLowerCase();

  if (code === "42501") {
    return "RLS bloqueó el registro: no tienes permisos para registrar jugadores en este equipo.";
  }

  if (code === "23505") {
    if (
      normalizedErrorText.includes("idx_player_team_registrations_team_season_jersey") ||
      normalizedErrorText.includes("team_id, season_id, jersey_number")
    ) {
      return "El número de camiseta ya está en uso para este equipo en la temporada seleccionada.";
    }

    return "El jugador ya está registrado en este equipo para la temporada seleccionada.";
  }

  if (code === "22P02" || code === "23514") {
    return "Los datos enviados no cumplen con las reglas del sistema.";
  }

  if (
    normalizedErrorText.includes("row-level security") ||
    normalizedErrorText.includes("permission denied")
  ) {
    return "No tienes permisos para crear este registro.";
  }

  if (
    normalizedErrorText.includes("player, team and season must belong to the same league") ||
    normalizedErrorText.includes("player, team and season must exist")
  ) {
    return "El jugador, equipo y temporada deben pertenecer a la misma liga.";
  }

  return "No se pudo crear el registro del jugador. Inténtalo nuevamente.";
}

export async function createPlayerRegistrationAction(
  leagueSlug: string,
  teamSlug: string,
  _prevState: CreatePlayerRegistrationActionState,
  formData: FormData
): Promise<CreatePlayerRegistrationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const values = {
    season_id: String(formData.get("season_id") ?? "").trim(),
    player_id: String(formData.get("player_id") ?? "").trim(),
    jersey_number: String(formData.get("jersey_number") ?? "").trim(),
    status: String(formData.get("status") ?? "").trim(),
  };

  const fieldErrors: Partial<Record<CreatePlayerRegistrationField, string>> = {};

  if (!values.season_id) {
    fieldErrors.season_id = "Selecciona una temporada.";
  }

  if (!values.player_id) {
    fieldErrors.player_id = "Selecciona un jugador.";
  }

  let jerseyNumber: number | null = null;
  if (values.jersey_number) {
    const parsedJerseyNumber = Number(values.jersey_number);

    if (!Number.isInteger(parsedJerseyNumber)) {
      fieldErrors.jersey_number = "El número de camiseta debe ser un entero.";
    } else if (parsedJerseyNumber < 0 || parsedJerseyNumber > 99) {
      fieldErrors.jersey_number = "El número de camiseta debe estar entre 0 y 99.";
    } else {
      jerseyNumber = parsedJerseyNumber;
    }
  }

  if (!PLAYER_REGISTRATION_STATUS_VALUES.includes(values.status as PlayerRegistrationStatus)) {
    fieldErrors.status = "Selecciona un estado válido.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      values,
      fieldErrors,
      formError: null,
    };
  }

  const { data: league, error: leagueError } = await supabase
    .from("leagues")
    .select("id")
    .eq("slug", leagueSlug)
    .maybeSingle();

  if (leagueError) {
    throw leagueError;
  }

  if (!league) {
    return {
      values,
      fieldErrors: {},
      formError: "Liga no encontrada o sin acceso para registrar jugadores.",
    };
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id")
    .eq("league_id", league.id)
    .eq("slug", teamSlug)
    .maybeSingle();

  if (teamError) {
    throw teamError;
  }

  if (!team) {
    return {
      values,
      fieldErrors: {},
      formError: "Equipo no encontrado o sin acceso para registrar jugadores.",
    };
  }

  const { data: season, error: seasonError } = await supabase
    .from("seasons")
    .select("id")
    .eq("league_id", league.id)
    .eq("id", values.season_id)
    .maybeSingle();

  if (seasonError) {
    throw seasonError;
  }

  if (!season) {
    return {
      values,
      fieldErrors: {
        season_id: "Selecciona una temporada válida de esta liga.",
      },
      formError: null,
    };
  }

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("id")
    .eq("league_id", league.id)
    .eq("id", values.player_id)
    .maybeSingle();

  if (playerError) {
    throw playerError;
  }

  if (!player) {
    return {
      values,
      fieldErrors: {
        player_id: "Selecciona un jugador válido de esta liga.",
      },
      formError: null,
    };
  }

  const { error: insertError } = await supabase.from("player_team_registrations").insert({
    player_id: player.id,
    team_id: team.id,
    season_id: season.id,
    jersey_number: jerseyNumber,
    status: values.status as PlayerRegistrationStatus,
  });

  if (insertError) {
    return {
      values,
      fieldErrors: {},
      formError: mapInsertErrorMessage(insertError.code, insertError.message, insertError.details),
    };
  }

  revalidatePath(`/dashboard/leagues/${leagueSlug}/teams/${teamSlug}/roster`);
  revalidatePath(`/dashboard/leagues/${leagueSlug}/players/${values.player_id}/registrations`);
  redirect(`/dashboard/leagues/${leagueSlug}/teams/${teamSlug}/roster`);
}
