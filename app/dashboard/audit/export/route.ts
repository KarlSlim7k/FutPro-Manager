import { createClient } from "@/lib/supabase/server";
import { parseAuditAction, parseAuditEntityType } from "@/lib/audit/audit-filters";
import { filterAuditLogsByQuery } from "@/lib/audit/audit-search";

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("No autorizado", { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("global_role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.global_role !== "super_admin") {
    return new Response("Prohibido", { status: 403 });
  }

  const url = new URL(request.url);
  const get = (k: string) => {
    const v = url.searchParams.get(k)?.trim();
    return v ? v : undefined;
  };

  const action = parseAuditAction(get("action"));
  const entityType = parseAuditEntityType(get("entityType"));
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const actorId = get("actorId");
  const leagueId = get("leagueId");
  const from = get("from");
  const to = get("to");
  const searchQuery = get("q");
  const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

  let query = supabase
    .from("audit_logs")
    .select("id, league_id, actor_id, action, entity_type, entity_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (action) query = query.eq("action", action);
  if (entityType) query = query.eq("entity_type", entityType);
  if (actorId && UUID_REGEX.test(actorId)) query = query.eq("actor_id", actorId);
  if (leagueId && UUID_REGEX.test(leagueId)) query = query.eq("league_id", leagueId);
  if (from && DATE_REGEX.test(from)) query = query.gte("created_at", `${from}T00:00:00Z`);
  if (to && DATE_REGEX.test(to)) query = query.lte("created_at", `${to}T23:59:59Z`);

  const { data, error } = await query;
  if (error) {
    return new Response("Error al generar CSV", { status: 500 });
  }

  const header = ["id", "created_at", "league_id", "actor_id", "action", "entity_type", "entity_id", "metadata"];
  const lines = [header.join(",")];
  const filtered = filterAuditLogsByQuery(
    (data ?? []).map((row) => ({
      ...row,
      metadata: (row.metadata ?? {}) as Record<string, unknown>,
    })),
    searchQuery
  );
  for (const row of filtered) {
    lines.push(
      [
        csvEscape(row.id),
        csvEscape(row.created_at),
        csvEscape(row.league_id),
        csvEscape(row.actor_id),
        csvEscape(row.action),
        csvEscape(row.entity_type),
        csvEscape(row.entity_id),
        csvEscape(JSON.stringify(row.metadata ?? {})),
      ].join(",")
    );
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="auditoria-global-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
