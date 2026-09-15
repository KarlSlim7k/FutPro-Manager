import { describe, it, expect } from "vitest";
import { parseAuditAction, parseAuditEntityType, AUDIT_ACTION_OPTIONS, AUDIT_ENTITY_TYPE_OPTIONS } from "./audit-filters";

describe("audit-filters", () => {
  describe("parseAuditAction", () => {
    it("returns undefined when value is empty or not provided", () => {
      expect(parseAuditAction()).toBeUndefined();
      expect(parseAuditAction("")).toBeUndefined();
    });

    it("returns valid action if present in AUDIT_ACTION_OPTIONS", () => {
      for (const action of AUDIT_ACTION_OPTIONS) {
        expect(parseAuditAction(action)).toBe(action);
      }
    });

    it("returns undefined for unknown or malicious action values", () => {
      expect(parseAuditAction("unknown_action")).toBeUndefined();
      expect(parseAuditAction("<script>alert(1)</script>")).toBeUndefined();
      expect(parseAuditAction("drop table audit_logs;")).toBeUndefined();
    });
  });

  describe("parseAuditEntityType", () => {
    it("returns undefined when value is empty or not provided", () => {
      expect(parseAuditEntityType()).toBeUndefined();
      expect(parseAuditEntityType("")).toBeUndefined();
    });

    it("returns valid entity type if present in AUDIT_ENTITY_TYPE_OPTIONS", () => {
      for (const entity of AUDIT_ENTITY_TYPE_OPTIONS) {
        expect(parseAuditEntityType(entity)).toBe(entity);
      }
    });

    it("returns undefined for unknown entity types", () => {
      expect(parseAuditEntityType("invalid_entity")).toBeUndefined();
    });
  });
});
