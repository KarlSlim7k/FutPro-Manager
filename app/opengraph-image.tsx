import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "FutPro Manager - Plataforma de Gestión Deportiva";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
          backgroundImage: "radial-gradient(circle at 50% 20%, #064e3b 0%, #022c22 100%)",
          padding: "60px 70px",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: "#ffffff",
          position: "relative",
        }}
      >
        {/* Marca superior */}
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
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m4.93 4.93 4.24 4.24" />
                <path d="m14.83 9.17 4.24-4.24" />
                <path d="m14.83 14.83 4.24 4.24" />
                <path d="m9.17 14.83-4.24 4.24" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
            <span
              style={{
                fontSize: "28px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                color: "#f0fdf4",
              }}
            >
              FutPro Manager
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 16px",
              borderRadius: "9999px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              fontSize: "14px",
              fontWeight: 600,
              color: "#34d399",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            Gestión Deportiva Profesional
          </div>
        </div>

        {/* Mensaje central */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: "900px",
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
            La plataforma líder para organizar ligas y torneos de fútbol
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "#a7f3d0",
              lineHeight: 1.4,
              margin: 0,
              fontWeight: 400,
            }}
          >
            Resultados en vivo, tablas de posiciones automáticas, estadísticas de goleo,
            cédulas arbitrales y gestión integral de clubes.
          </p>
        </div>

        {/* Barra inferior de características */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span style={{ fontSize: "16px", color: "#e2e8f0", fontWeight: 500 }}>
              Tablas y Posiciones
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span style={{ fontSize: "16px", color: "#e2e8f0", fontWeight: 500 }}>
              Goleo y Estadísticas
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span style={{ fontSize: "16px", color: "#e2e8f0", fontWeight: 500 }}>
              Panel Arbitral y Cédula
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span style={{ fontSize: "16px", color: "#e2e8f0", fontWeight: 500 }}>
              Auditoría y RBAC
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
