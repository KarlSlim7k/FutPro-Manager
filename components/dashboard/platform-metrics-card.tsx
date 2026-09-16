import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlatformMetricsCardProps {
  metrics: {
    totalUsers: number;
    totalLeagues: number;
    activeLeagues: number;
    totalTeams: number;
    totalPlayers: number;
    matchesLast7Days: number;
    matchesCompletedLast7Days: number;
  };
}

interface MetricItem {
  label: string;
  value: number;
  href: string;
  accent?: boolean;
}

export function PlatformMetricsCard({ metrics }: PlatformMetricsCardProps) {
  const items: MetricItem[] = [
    { label: "Usuarios registrados", value: metrics.totalUsers, href: "/dashboard/users", accent: true },
    { label: "Ligas totales", value: metrics.totalLeagues, href: "/dashboard/leagues/admin" },
    { label: "Ligas activas", value: metrics.activeLeagues, href: "/dashboard/leagues/admin" },
    { label: "Equipos", value: metrics.totalTeams, href: "/dashboard/teams" },
    { label: "Jugadores", value: metrics.totalPlayers, href: "/dashboard/players" },
    {
      label: "Partidos (7 días)",
      value: metrics.matchesLast7Days,
      href: "/dashboard/matches",
    },
    {
      label: "Finalizados (7 días)",
      value: metrics.matchesCompletedLast7Days,
      href: "/dashboard/matches",
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Métricas de plataforma</CardTitle>
          <p className="mt-1 text-xs text-gray-500">
            Vista global de toda la instancia (solo super_admin).
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group rounded-lg border border-gray-200 bg-white p-3 transition hover:border-emerald-300 hover:shadow-sm"
            >
              <span
                className={`block text-xl font-black ${
                  item.accent ? "text-emerald-700" : "text-gray-900"
                }`}
              >
                {item.value.toLocaleString("es-MX")}
              </span>
              <span className="text-xs text-gray-500 group-hover:text-gray-700">{item.label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
