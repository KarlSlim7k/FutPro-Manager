import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { createClient } from "@/lib/supabase/server";
import { parseAuditAction, parseAuditEntityType } from "@/lib/audit/audit-filters";
import { GlobalAuditFilters } from "@/components/audit/global-audit-filters";
import { GlobalAuditTable, type GlobalAuditRow } from "@/components/audit/global-audit-table";

interface GlobalAuditPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function buildExportHref(sp: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams();
  for (const key of ["action", "entityType", "actorId", "leagueId", "from", "to"]) {
    const v = sp[key];
    if (typeof v === "string" && v.trim() !== "") params.set(key, v.trim());
  }
  const qs = params.toString();
  return `/dashboard/audit/export${qs ? `?${qs}` : ""}`;
}

export default async function GlobalAuditPage({ searchParams }: GlobalAuditPageProps) {
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
          title="Auditoría global"
          description="Historial multi-liga (solo super_admin)"
        />
        <Card>
          <CardHeader>
            <CardTitle>Acceso restringido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Solo los super administradores pueden ver la auditoría global.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  const sp = await searchParams;
  const getString = (key: string) => {
    const v = sp[key];
    return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
  };

  const filterAction = parseAuditAction(getString("action"));
  const filterEntityType = parseAuditEntityType(getString("entityType"));

  const rawActorId = getString("actorId");
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const filterActorId = rawActorId && UUID_REGEX.test(rawActorId) ? rawActorId : undefined;

  const rawLeagueId = getString("leagueId");
  const filterLeagueId = rawLeagueId && UUID_REGEX.test(rawLeagueId) ? rawLeagueId : undefined;

  const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
  const rawFrom = getString("from");
  const rawTo = getString("to");
  const currentFrom = rawFrom && DATE_REGEX.test(rawFrom) ? rawFrom : undefined;
  const currentTo = rawTo && DATE_REGEX.test(rawTo) ? rawTo : undefined;

  let query = supabase
    .from("audit_logs")
    .select("id, league_id, actor_id, action, entity_type, entity_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (filterAction) query = query.eq("action", filterAction);
  if (filterEntityType) query = query.eq("entity_type", filterEntityType);
  if (filterActorId) query = query.eq("actor_id", filterActorId);
  if (filterLeagueId) query = query.eq("league_id", filterLeagueId);
  if (currentFrom) query = query.gte("created_at", `${currentFrom}T00:00:00Z`);
  if (currentTo) query = query.lte("created_at", `${currentTo}T23:59:59Z`);

  const { data: logsData, error: logsError } = await query;

  if (logsError) {
    return (
      <section className="space-y-6">
        <PageHeader
          backHref="/dashboard"
          backLabel="Volver al panel"
          title="Auditoría global"
          description="Historial multi-liga (solo super_admin)"
        />
        <EmptyState
          title="Error al cargar registros"
          description="No fue posible cargar los registros de auditoría. Intenta nuevamente."
        />
      </section>
    );
  }

  const logs = logsData ?? [];
  const actorIds = [...new Set(logs.map((l) => l.actor_id).filter((id): id is string => id !== null))];
  const leagueIds = [...new Set(logs.map((l) => l.league_id).filter((id): id is string => id !== null))];

  let profilesMap = new Map<string, { full_name: string | null; display_name: string | null }>();
  let leaguesMap = new Map<string, { name: string; slug: string }>();

  if (actorIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, display_name")
      .in("id", actorIds);
    if (profilesData) {
      profilesMap = new Map(profilesData.map((p) => [p.id, { full_name: p.full_name, display_name: p.display_name }]));
    }
  }

  if (leagueIds.length > 0) {
    const { data: leaguesData } = await supabase.from("leagues").select("id, name, slug").in("id", leagueIds);
    if (leaguesData) {
      leaguesMap = new Map(leaguesData.map((l) => [l.id, { name: l.name, slug: l.slug }]));
    }
  }

  const rows: GlobalAuditRow[] = logs.map((log) => {
    const profile = log.actor_id ? profilesMap.get(log.actor_id) : undefined;
    const league = log.league_id ? leaguesMap.get(log.league_id) : undefined;
    return {
      id: log.id,
      actor_id: log.actor_id,
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      metadata: (log.metadata as Record<string, unknown>) ?? {},
      created_at: log.created_at,
      actorDisplayName: profile?.full_name ?? profile?.display_name ?? null,
      leagueName: league?.name ?? null,
      leagueSlug: league?.slug ?? null,
    };
  });

  return (
    <section className="space-y-6">
      <PageHeader
        backHref="/dashboard"
        backLabel="Volver al panel"
        title="Auditoría global"
        description="Historial multi-liga (solo super_admin)"
      />
      <GlobalAuditFilters
        currentAction={filterAction}
        currentEntityType={filterEntityType}
        currentActorId={filterActorId}
        currentLeagueId={filterLeagueId}
        currentFrom={currentFrom}
        currentTo={currentTo}
      />
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {rows.length === 200
            ? "Mostrando los primeros 200 registros. Aplica filtros para acotar."
            : `${rows.length} registro(s).`}
        </p>
        <TextLink href={buildExportHref(sp)}>Exportar CSV</TextLink>
      </div>
      {rows.length === 0 ? (
        <EmptyState
          title="Sin registros"
          description="No hay registros de auditoría que coincidan con los filtros seleccionados."
        />
      ) : (
        <GlobalAuditTable logs={rows} />
      )}
    </section>
  );
}
