import { ImageResponse } from "next/og";
import { createPublicClient } from "@/lib/supabase/public";

export const runtime = "nodejs";
export const alt = "Jugador en FutPro Manager";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; playerId: string }>;
}) {
  const { slug, playerId } = await params;
  const supabase = createPublicClient();

  const [{ data: league }, { data: player }] = await Promise.all([
    supabase.from("leagues").select("id, name").eq("slug", slug).maybeSingle(),
    supabase
      .from("players")
      .select(`
        id,
        full_name,
        photo_url,
        dominant_foot
      `)
      .eq("id", playerId)
      .maybeSingle(),
  ]);

  const leagueName = league?.name ?? "Liga Oficial";
  const playerName = player?.full_name ?? "Jugador";
  const photoUrl = player?.photo_url ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#022c22",
          backgroundImage:
            "radial-gradient(circle at 70% 30%, #064e3b 0%, #022c22 80%, #011a14 100%)",
          padding: "60px 70px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Header */}
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
          </div>

          <div
            style={{
              padding: "6px 16px",
              borderRadius: "9999px",
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              fontSize: "13px",
              fontWeight: 600,
              textTransform: "uppercase",
              color: "#a7f3d0",
            }}
          >
            Ficha de Jugador
          </div>
        </div>

        {/* Centro */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "40px",
          }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={playerName}
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "9999px",
                objectFit: "cover",
                backgroundColor: "#065f46",
                border: "4px solid #10b981",
                boxShadow: "0 25px 30px -10px rgba(0, 0, 0, 0.5)",
              }}
            />
          ) : (
            <div
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "9999px",
                backgroundColor: "#059669",
                border: "4px solid #34d399",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "64px",
                fontWeight: 900,
                color: "#ffffff",
                boxShadow: "0 25px 30px -10px rgba(0, 0, 0, 0.5)",
              }}
            >
              {playerName.charAt(0).toUpperCase()}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <h1
              style={{
                fontSize: "54px",
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-1px",
                color: "#ffffff",
                margin: 0,
              }}
            >
              {playerName}
            </h1>
            <p
              style={{
                fontSize: "22px",
                color: "#a7f3d0",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Historial de partidos, estadísticas, goles y participación oficial.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.15)",
            fontSize: "16px",
            color: "#6ee7b7",
          }}
        >
          <span>Perfil deportivo oficial</span>
          <span style={{ color: "#ffffff", fontWeight: 700 }}>FutPro Manager</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
