import { notFound } from "next/navigation";
import { Shield, CheckCircle2, AlertOctagon, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { generatePlayerQrSvg } from "@/lib/id-card/player-id-token";
import { PlayerCredentialCard } from "@/components/id-card/player-credential-card";

interface CredentialPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Validación de Credencial Digital · FutPro Manager",
  description: "Verificación oficial de identidad deportiva y habilitación disciplinaria de futbolistas.",
};

export default async function CredentialVerificationPage({ params }: CredentialPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Query registration by ID
  const { data: registration, error: regError } = await supabase
    .from("player_team_registrations")
    .select(`
      id,
      jersey_number,
      status,
      registered_at,
      players!inner (
        id,
        full_name,
        photo_url,
        preferred_position,
        dominant_foot,
        status
      ),
      teams!inner (
        id,
        name,
        logo_url,
        slug
      ),
      seasons!inner (
        id,
        name,
        slug
      ),
      leagues!inner (
        id,
        name,
        slug
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (regError || !registration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 text-zinc-100">
        <div className="max-w-md w-full rounded-2xl border border-red-800 bg-red-950/40 p-6 text-center shadow-xl">
          <AlertOctagon className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-white">Credencial No Válida</h1>
          <p className="text-sm text-red-200/90 mt-2">
            El código o folio escaneado no corresponde a ningún registro oficial activo en FutPro Manager.
          </p>
        </div>
      </div>
    );
  }

  const player = registration.players as any;
  const team = registration.teams as any;
  const season = registration.seasons as any;
  const league = registration.leagues as any;

  // Determine disciplinary status: player is active if both player and registration are active
  const isSuspended = registration.status === "suspended" || player.status === "suspended";
  const displayStatus = isSuspended ? "suspended" : (registration.status as any);

  const verificationUrl = `https://futpromanager.com/credencial/${registration.id}`;
  const qrSvg = await generatePlayerQrSvg(verificationUrl);

  const folioNumber = `FUT-${registration.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4 text-zinc-100 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Anti-fraud live verification indicator */}
        <div
          className={`rounded-xl p-4 border text-center ${
            !isSuspended
              ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-200"
              : "bg-red-950/60 border-red-500/50 text-red-200"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            {!isSuspended ? (
              <>
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                <span className="font-black text-lg tracking-wide uppercase">
                  ✓ Habilitado para Jugar
                </span>
              </>
            ) : (
              <>
                <AlertOctagon className="h-6 w-6 text-red-400" />
                <span className="font-black text-lg tracking-wide uppercase">
                  ⛔ Inhabilitado / Suspendido
                </span>
              </>
            )}
          </div>
          <p className="text-xs mt-1 text-zinc-400">
            Verificado en tiempo real con el servidor de la liga.
          </p>
        </div>

        {/* Digital ID Card */}
        <PlayerCredentialCard
          leagueName={league.name}
          seasonName={season.name}
          playerName={player.full_name}
          playerPhotoUrl={player.photo_url}
          teamName={team.name}
          teamLogoUrl={team.logo_url}
          jerseyNumber={registration.jersey_number}
          position={player.preferred_position}
          dominantFoot={player.dominant_foot}
          status={displayStatus}
          qrSvg={qrSvg}
          folioNumber={folioNumber}
        />
      </div>
    </div>
  );
}
