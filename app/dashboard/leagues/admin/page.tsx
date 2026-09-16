import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { LeagueStatusControl } from "@/components/leagues/league-status-control";
import { createClient } from "@/lib/supabase/server";
import type { League } from "@/types/database";

type AdminLeague = Pick<
  League,
  "id" | "name" | "slug" | "region" | "city" | "state" | "country" | "status" | "is_public" | "created_at"
>;

const LEAGUE_STATUS_VARIANTS: Record<League["status"], "success" | "warning" | "neutral" | "danger"> = {
  active: "success",
  draft: "warning",
  inactive: "neutral",
  archived: "danger",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(date));
}

function getLocation(league: AdminLeague) {
  return [league.city, league.state, league.region, league.country]
    .filter((value): value is string => Boolean(value))
    .join(", ");
}

export default async function LeaguesAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("global_role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.global_role !== "super_admin") {
    return (
      <section className="space-y-6">
        <PageHeader
          backHref="/dashboard"
          backLabel="Volver al panel"
          title="Administración de ligas"
          description="Vista global de todas las ligas (solo super_admin)"
        />
        <EmptyState
          title="Acceso restringido"
          description="Solo los super administradores pueden administrar el ciclo de vida de las ligas."
        />
      </section>
    );
  }

  const { data, error } = await supabase
    .from("leagues")
    .select("id, name, slug, region, city, state, country, status, is_public, created_at")
    .order("created_at", { ascending: false });

  const leagues = (error ? [] : (data ?? [])) as AdminLeague[];

  const counts = {
    active: leagues.filter((l) => l.status === "active").length,
    draft: leagues.filter((l) => l.status === "draft").length,
    inactive: leagues.filter((l) => l.status === "inactive").length,
    archived: leagues.filter((l) => l.status === "archived").length,
  };

  return (
    <section className="space-y-6">
      <PageHeader
        backHref="/dashboard"
        backLabel="Volver al panel"
        title="Administración de ligas"
        description="Vista global del ciclo de vida de todas las ligas (solo super_admin)."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <span className="block text-2xl font-black text-gray-900">{leagues.length}</span>
          <span className="text-xs text-gray-500">Total de ligas</span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <span className="block text-2xl font-black text-emerald-700">{counts.active}</span>
          <span className="text-xs text-gray-500">Activas</span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <span className="block text-2xl font-black text-amber-700">{counts.draft}</span>
          <span className="text-xs text-gray-500">Borrador</span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <span className="block text-2xl font-black text-gray-500">
            {counts.inactive + counts.archived}
          </span>
          <span className="text-xs text-gray-500">Inactivas / Archivadas</span>
        </div>
      </div>

      {leagues.length === 0 ? (
        <EmptyState
          title="Sin ligas"
          description="Aún no hay ligas registradas en la plataforma."
        />
      ) : (
        <>
          {/* Mobile Cards (< md) */}
          <div className="space-y-2.5 md:hidden">
            {leagues.map((league) => (
              <div key={league.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="block truncate font-bold text-gray-900">{league.name}</span>
                    <span className="text-xs text-gray-400">/{league.slug}</span>
                  </div>
                  <StatusBadge variant={LEAGUE_STATUS_VARIANTS[league.status]}>
                    {league.status}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-xs text-gray-500">{getLocation(league) || "Sin ubicación"}</p>
                <p className="mt-0.5 text-[11px] text-gray-400">Creada: {formatDate(league.created_at)}</p>
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <LeagueStatusControl leagueId={league.id} status={league.status} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (md+) */}
          <div className="hidden overflow-x-auto rounded-lg border border-gray-200 md:block">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Liga</th>
                  <th className="px-4 py-3">Ubicación</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Visibilidad</th>
                  <th className="px-4 py-3">Creada</th>
                  <th className="px-4 py-3 text-right">Ciclo de vida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {leagues.map((league) => (
                  <tr key={league.id}>
                    <td className="px-4 py-3">
                      <span className="block font-medium text-gray-900">{league.name}</span>
                      <span className="block font-mono text-[11px] text-gray-400">/{league.slug}</span>
                    </td>
                    <td className="px-4 py-3">{getLocation(league) || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={LEAGUE_STATUS_VARIANTS[league.status]}>
                        {league.status}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={league.is_public ? "success" : "info"}>
                        {league.is_public ? "Pública" : "Privada"}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3">{formatDate(league.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <LeagueStatusControl leagueId={league.id} status={league.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
