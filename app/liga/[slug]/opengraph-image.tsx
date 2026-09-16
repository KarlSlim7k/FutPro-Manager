import { ImageResponse } from "next/og";
import { createPublicClient } from "@/lib/supabase/public";

export const runtime = "nodejs";
export const alt = "Liga en FutPro Manager";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: league } = await supabase
    .from("leagues")
    .select("name, slug, description, city, state, country, logo_url")
    .eq("slug", slug)
    .maybeSingle();

  const name = league?.name ?? "Liga Deportiva";
  const location = [league?.city, league?.state, league?.country]
    .filter(Boolean)
    .join(", ");
  const description =
    league?.description ?? "Resultados, tabla de posiciones, estadísticas y partidos oficiales.";

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
            "radial-gradient(circle at 10% 20%, #047857 0%, #064e3b 60%, #022c22 100%)",
          padding: "60px 70px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Header superior con branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m4.93 4.93 4.24 4.24" />
                <path d="m14.83 9.17 4.24-4.24" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
            <span style={{ fontSize: "22px", fontWeight: 700, color: "#ecfdf5" }}>
              FutPro Manager
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "9999px",
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              color: "#a7f3d0",
            }}
          >
            Portal Oficial de Liga
          </div>
        </div>

        {/* Cuerpo central */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "36px",
            width: "100%",
          }}
        >
          {league?.logo_url ? (
            <img
              src={league.logo_url}
              alt={name}
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "24px",
                objectFit: "contain",
                backgroundColor: "#ffffff",
                padding: "12px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)",
              }}
            />
          ) : (
            <div
              style={{
                width: "130px",
                height: "130px",
                borderRadius: "24px",
                backgroundColor: "#059669",
                border: "2px solid #34d399",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "64px",
                fontWeight: 900,
                color: "#ffffff",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)",
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              flex: 1,
            }}
          >
            <h1
              style={{
                fontSize: "52px",
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-1px",
                color: "#ffffff",
                margin: 0,
              }}
            >
              {name}
            </h1>
            {location ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "18px",
                  color: "#6ee7b7",
                  fontWeight: 600,
                }}
              >
                <span>{location}</span>
              </div>
            ) : null}
            <p
              style={{
                fontSize: "20px",
                color: "#d1fae5",
                lineHeight: 1.35,
                margin: 0,
                maxHeight: "60px",
                overflow: "hidden",
              }}
            >
              {description}
            </p>
          </div>
        </div>

        {/* Footer con módulos disponibles */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.15)",
            fontSize: "16px",
            color: "#a7f3d0",
            fontWeight: 500,
          }}
        >
          <div style={{ display: "flex", gap: "28px" }}>
            <span>Tabla de Posiciones</span>
            <span>Calendario y Resultados</span>
            <span>Estadísticas de Goleo</span>
            <span>Equipos y Plantillas</span>
          </div>
          <span style={{ color: "#ffffff", fontWeight: 700 }}>futpro.app</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
