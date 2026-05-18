import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import { getLeaguePermissions } from "@/lib/permissions/league-permissions";
import { AuditLogFilters } from "@/components/audit/audit-log-filters";
import { parseAuditAction, parseAuditEntityType } from "@/lib/audit/audit-filters";
import { AuditLogTable, type AuditLogRow } from "@/components/audit/audit-log-table";

interface AuditPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AuditPage({ params, searchParams }: AuditPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: leagueData, error: leagueError } = await supabase
    .from("leagues")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (leagueError) {
    throw leagueError;
  }

  if (!leagueData) {
    notFound();
  }

  const league = leagueData;

  const permissions = await getLeaguePermissions({
    supabase,
    userId: user.id,
    leagueId: league.id,
  });

  if (!permissions.canViewAuditLogs) {
    return (
      <section className="space-y-6">
        <PageHeader
          backHref={`/dashboard/leagues/${league.slug}`}
          backLabel="Volver a la liga"
          title="Auditoria"
          description={`Auditoria de ${league.name}`}
        />
        <Card>
          <CardHeader>
            <CardTitle>Acceso restringido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Solo los administradores de la liga pueden ver los registros de auditoria.
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

  const rawAction = getString("action");
  const rawEntityType = getString("entityType");
  const filterAction = parseAuditAction(rawAction);
  const filterEntityType = parseAuditEntityType(rawEntityType);

  const rawActorId = getString("actorId");
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const filterActorId = rawActorId && UUID_REGEX.test(rawActorId) ? rawActorId : undefined;

  const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
  const rawFrom = getString("from");
  const rawTo = getString("to");
  const currentFrom = rawFrom && DATE_REGEX.test(rawFrom) ? rawFrom : undefined;
  const currentTo = rawTo && DATE_REGEX.test(rawTo) ? rawTo : undefined;
  const filterFrom = currentFrom ? `${currentFrom}T00:00:00Z` : undefined;
  const filterTo = currentTo ? `${currentTo}T23:59:59Z` : undefined;

  let query = supabase
    .from("audit_logs")
    .select("id, actor_id, action, entity_type, entity_id, metadata, created_at")
    .eq("league_id", league.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (filterAction) query = query.eq("action", filterAction);
  if (filterEntityType) query = query.eq("entity_type", filterEntityType);
  if (filterActorId) query = query.eq("actor_id", filterActorId);
  if (filterFrom) query = query.gte("created_at", filterFrom);
  if (filterTo) query = query.lte("created_at", filterTo);

  const { data: logsData, error: logsError } = await query;

  if (logsError) {
    return (
      <section className="space-y-6">
        <PageHeader
          backHref={`/dashboard/leagues/${league.slug}`}
          backLabel="Volver a la liga"
          title="Auditoria"
          description={`Historial de acciones administrativas de ${league.name}`}
        />
        <AuditLogFilters
          currentAction={filterAction}
          currentEntityType={filterEntityType}
          currentActorId={filterActorId}
          currentFrom={currentFrom}
          currentTo={currentTo}
          slug={league.slug}
        />
        <EmptyState
          title="Error al cargar registros"
          description="No fue posible cargar los registros de auditoria. Intenta nuevamente."
        />
      </section>
    );
  }

  const logs = logsData ?? [];
  const actorIds = [
    ...new Set(logs.map((l) => l.actor_id).filter((id): id is string => id !== null)),
  ];
  let profilesMap = new Map<string, { full_name: string | null; display_name: string | null }>();

  if (actorIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, display_name")
      .in("id", actorIds);
    if (profilesData) {
      profilesMap = new Map(
        profilesData.map((p) => [p.id, { full_name: p.full_name, display_name: p.display_name }])
      );
    }
  }

  const auditLogRows: AuditLogRow[] = logs.map((log) => {
    const profile = log.actor_id ? profilesMap.get(log.actor_id) : undefined;
    const actorDisplayName = profile?.full_name ?? profile?.display_name ?? null;
    return {
      id: log.id,
      actor_id: log.actor_id,
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      metadata: (log.metadata as Record<string, unknown>) ?? {},
      created_at: log.created_at,
      actorDisplayName,
    };
  });

  return (
    <section className="space-y-6">
      <PageHeader
        backHref={`/dashboard/leagues/${league.slug}`}
        backLabel="Volver a la liga"
        title="Auditoria"
        description={`Historial de acciones administrativas de ${league.name}`}
      />
      <AuditLogFilters
        currentAction={filterAction}
        currentEntityType={filterEntityType}
        currentActorId={filterActorId}
        currentFrom={currentFrom}
        currentTo={currentTo}
        slug={league.slug}
      />
      {logs.length === 100 && (
        <p className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700">
          Mostrando los primeros 100 registros. Aplica filtros para acotar los resultados.
        </p>
      )}
      {auditLogRows.length === 0 ? (
        <EmptyState
          title="Sin registros"
          description="No hay registros de auditoria que coincidan con los filtros seleccionados."
        />
      ) : (
        <AuditLogTable logs={auditLogRows} />
      )}
    </section>
  );
}
