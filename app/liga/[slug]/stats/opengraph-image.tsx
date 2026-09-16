import { ImageResponse } from "next/og";
import { createPublicClient } from "@/lib/supabase/public";

export const runtime = "nodejs";
export const alt = "Estadísticas y Líderes en FutPro Manager";
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
    .select("name, logo_url")
    .eq("slug", slug)
    .maybeSingle();

  const leagueName = league?.name ?? "Liga Deportiva";

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
            "radial-gradient(circle at 20% 80%, #047857 0%, #064e3b 60%, #022c22 100%)",
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "22px", fontWeight: 700, color: "#34d399" }}>
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
            Líderes y Estadísticas
          </div>
        </div>

        {/* Centro */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              color: "#ffffff",
              margin: 0,
            }}
          >
            Tabla de Goleo, Asistencias y Fair Play
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "#d1fae5",
              lineHeight: 1.35,
              margin: 0,
              fontWeight: 400,
            }}
          >
            Sigue de cerca a los máximos anotadores, arqueros con vallas invictas y el balance
            disciplinario oficial en {leagueName}.
          </p>
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
          <div style={{ display: "flex", gap: "24px" }}>
            <span>Goleo Individual</span>
            <span>Asistencias</span>
            <span>Vallas Invictas</span>
            <span>Fair Play</span>
          </div>
          <span style={{ color: "#ffffff", fontWeight: 700 }}>FutPro Manager</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
