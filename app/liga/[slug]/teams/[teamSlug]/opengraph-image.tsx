import { ImageResponse } from "next/og";
import { createPublicClient } from "@/lib/supabase/public";

export const runtime = "nodejs";
export const alt = "Equipo en FutPro Manager";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; teamSlug: string }>;
}) {
  const { slug, teamSlug } = await params;
  const supabase = createPublicClient();

  const [{ data: league }, { data: team }] = await Promise.all([
    supabase.from("leagues").select("id, name").eq("slug", slug).maybeSingle(),
    supabase
      .from("teams")
      .select("name, slug, logo_url")
      .eq("slug", teamSlug)
      .maybeSingle(),
  ]);

  const leagueName = league?.name ?? "Liga Deportiva";
  const teamName = team?.name ?? "Equipo";
  const teamLogo = team?.logo_url ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#064e3b",
          backgroundImage:
            "radial-gradient(circle at 80% 20%, #047857 0%, #064e3b 60%, #022c22 100%)",
          padding: "60px 70px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Cabecera */}
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
            Club Oficial
          </div>
        </div>

        {/* Centro: Escudo y Nombre */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "40px",
          }}
        >
          {teamLogo ? (
            <img
              src={teamLogo}
              alt={teamName}
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "28px",
                objectFit: "contain",
                backgroundColor: "#ffffff",
                padding: "16px",
                boxShadow: "0 25px 30px -10px rgba(0, 0, 0, 0.5)",
              }}
            />
          ) : (
            <div
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "28px",
                backgroundColor: "#059669",
                border: "2px solid #34d399",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "72px",
                fontWeight: 900,
                color: "#ffffff",
                boxShadow: "0 25px 30px -10px rgba(0, 0, 0, 0.5)",
              }}
            >
              {teamName.charAt(0).toUpperCase()}
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
                fontSize: "58px",
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-1.5px",
                color: "#ffffff",
                margin: 0,
              }}
            >
              {teamName}
            </h1>
            <p
              style={{
                fontSize: "22px",
                color: "#a7f3d0",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Plantilla de jugadores, estadísticas, partidos y posiciones.
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
          <span>Ficha oficial de club deportivo</span>
          <span style={{ color: "#ffffff", fontWeight: 700 }}>FutPro Manager</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
