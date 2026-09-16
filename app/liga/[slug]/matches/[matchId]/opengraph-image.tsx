import { ImageResponse } from "next/og";
import { createPublicClient } from "@/lib/supabase/public";

export const runtime = "nodejs";
export const alt = "Partido en FutPro Manager";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; matchId: string }>;
}) {
  const { slug, matchId } = await params;
  const supabase = createPublicClient();

  const [{ data: league }, { data: match }] = await Promise.all([
    supabase
      .from("leagues")
      .select("id, name")
      .eq("slug", slug)
      .maybeSingle(),
    supabase
      .from("matches")
      .select(`
        id,
        scheduled_at,
        status,
        home_score,
        away_score,
        round_name,
        home_team:teams!matches_home_team_id_fkey(id, name, logo_url),
        away_team:teams!matches_away_team_id_fkey(id, name, logo_url)
      `)
      .eq("id", matchId)
      .maybeSingle(),
  ]);

  const leagueName = league?.name ?? "Liga Oficial";
  // Extraer información de equipos
  const homeTeamRaw = match?.home_team as unknown as { name?: string; logo_url?: string | null } | null;
  const awayTeamRaw = match?.away_team as unknown as { name?: string; logo_url?: string | null } | null;

  const homeName = homeTeamRaw?.name ?? "Local";
  const awayName = awayTeamRaw?.name ?? "Visitante";
  const homeLogo = homeTeamRaw?.logo_url ?? null;
  const awayLogo = awayTeamRaw?.logo_url ?? null;

  const isCompleted = match?.status === "completed";
  const isInProgress = match?.status === "in_progress";
  const roundName = match?.round_name ?? "Partido Oficial";

  let statusText = "PROGRAMADO";
  let statusBg = "rgba(59, 130, 246, 0.2)";
  let statusBorder = "#3b82f6";
  let statusColor = "#93c5fd";

  if (isCompleted) {
    statusText = "FINALIZADO";
    statusBg = "rgba(16, 185, 129, 0.2)";
    statusBorder = "#10b981";
    statusColor = "#a7f3d0";
  } else if (isInProgress) {
    statusText = "EN VIVO";
    statusBg = "rgba(239, 68, 68, 0.25)";
    statusBorder = "#ef4444";
    statusColor = "#fca5a5";
  }

  let formattedDate = "";
  if (match?.scheduled_at) {
    try {
      formattedDate = new Intl.DateTimeFormat("es-MX", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(match.scheduled_at));
    } catch {
      formattedDate = "";
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#091e17",
          backgroundImage:
            "radial-gradient(circle at 50% 10%, #064e3b 0%, #031e16 80%, #02120e 100%)",
          padding: "50px 70px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Cabecera del encuentro */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "#34d399" }}>
              {leagueName}
            </span>
            <span style={{ color: "#6ee7b7", fontSize: "16px" }}>•</span>
            <span style={{ fontSize: "16px", color: "#a7f3d0", fontWeight: 500 }}>
              {roundName}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 16px",
              borderRadius: "9999px",
              backgroundColor: statusBg,
              border: `1px solid ${statusBorder}`,
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "1px",
              color: statusColor,
            }}
          >
            {statusText}
          </div>
        </div>

        {/* Sección del Marcador y Equipos */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "0 20px",
          }}
        >
          {/* Equipo Local */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              width: "360px",
              textAlign: "center",
            }}
          >
            {homeLogo ? (
              <img
                src={homeLogo}
                alt={homeName}
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "24px",
                  objectFit: "contain",
                  backgroundColor: "#ffffff",
                  padding: "10px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "24px",
                  backgroundColor: "#065f46",
                  border: "2px solid #10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "48px",
                  fontWeight: 900,
                }}
              >
                {homeName.charAt(0).toUpperCase()}
              </div>
            )}
            <span
              style={{
                fontSize: "30px",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.15,
                maxHeight: "72px",
                overflow: "hidden",
              }}
            >
              {homeName}
            </span>
          </div>

          {/* Centro: Marcador o VS */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "0 20px",
            }}
          >
            {isCompleted || isInProgress ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  padding: "16px 36px",
                  borderRadius: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                <span style={{ fontSize: "72px", fontWeight: 900, color: "#ffffff" }}>
                  {match?.home_score ?? 0}
                </span>
                <span style={{ fontSize: "40px", color: "#6ee7b7", fontWeight: 300 }}>
                  :
                </span>
                <span style={{ fontSize: "72px", fontWeight: 900, color: "#ffffff" }}>
                  {match?.away_score ?? 0}
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "44px",
                    fontWeight: 900,
                    letterSpacing: "4px",
                    color: "#34d399",
                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                    padding: "12px 32px",
                    borderRadius: "16px",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                  }}
                >
                  VS
                </div>
                {formattedDate ? (
                  <span style={{ fontSize: "17px", color: "#cbd5e1", fontWeight: 500 }}>
                    {formattedDate}
                  </span>
                ) : null}
              </div>
            )}
          </div>

          {/* Equipo Visitante */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              width: "360px",
              textAlign: "center",
            }}
          >
            {awayLogo ? (
              <img
                src={awayLogo}
                alt={awayName}
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "24px",
                  objectFit: "contain",
                  backgroundColor: "#ffffff",
                  padding: "10px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "24px",
                  backgroundColor: "#065f46",
                  border: "2px solid #10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "48px",
                  fontWeight: 900,
                }}
              >
                {awayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span
              style={{
                fontSize: "30px",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.15,
                maxHeight: "72px",
                overflow: "hidden",
              }}
            >
              {awayName}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            fontSize: "15px",
            color: "#94a3b8",
          }}
        >
          <span>Cédula oficial, incidencias y eventos en tiempo real</span>
          <span style={{ color: "#34d399", fontWeight: 700 }}>FutPro Manager</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
