import { describe, it, expect } from "vitest";
import { filterAuditLogsByQuery } from "./audit-search";

const logs = [
  { action: "match.created", entity_type: "match", metadata: { league_slug: "liga-mx" } },
  { action: "player.created", entity_type: "player", metadata: { full_name: "Juan Pérez" } },
  { action: "audit.purged", entity_type: "league", metadata: { deleted_count: 5 } },
];

describe("filterAuditLogsByQuery", () => {
  it("returns all logs without query", () => {
    expect(filterAuditLogsByQuery(logs, undefined)).toHaveLength(3);
    expect(filterAuditLogsByQuery(logs, "  ")).toHaveLength(3);
  });

  it("matches by action", () => {
    expect(filterAuditLogsByQuery(logs, "player")).toHaveLength(1);
  });

  it("matches by metadata content case-insensitively", () => {
    expect(filterAuditLogsByQuery(logs, "JUAN")).toHaveLength(1);
    expect(filterAuditLogsByQuery(logs, "liga-mx")).toHaveLength(1);
  });

  it("returns empty when nothing matches", () => {
    expect(filterAuditLogsByQuery(logs, "zzz")).toHaveLength(0);
  });
});
