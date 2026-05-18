import { Card, CardContent } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LeagueMemberRoleForm } from "@/components/members/league-member-role-form";
import { RoleBadge } from "@/components/members/role-badge";
import type { AppRole } from "@/types/database";
import type { LeaguePermissions } from "@/lib/permissions/league-permissions";

export interface LeagueMemberData {
  id: string;
  profileId: string;
  role: AppRole;
  createdAt: string;
  profileName: string | null;
  profileDisplayName: string | null;
}

interface LeagueMembersTableProps {
  members: LeagueMemberData[];
  permissions: LeaguePermissions;
  leagueSlug: string;
}

function getMemberDisplayName(member: LeagueMemberData): string {
  if (member.profileName) return member.profileName;
  if (member.profileDisplayName) return member.profileDisplayName;
  return `Usuario ${member.profileId.slice(0, 8)}`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function LeagueMembersTable({
  members,
  permissions,
  leagueSlug,
}: LeagueMembersTableProps) {
  return (
    <>
      {/* Mobile card layout */}
      <div className="space-y-3 md:hidden">
        {members.map((member) => (
          <Card key={member.id}>
            <CardContent className="space-y-2 p-4 text-sm text-gray-700">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-gray-900">
                  {getMemberDisplayName(member)}
                </p>
                <RoleBadge role={member.role} />
              </div>
              <p>Miembro desde: {formatDate(member.createdAt)}</p>
              {permissions.canManageMembers && (
                <LeagueMemberRoleForm
                  key={member.id + member.role}
                  memberId={member.id}
                  currentRole={member.role}
                  leagueSlug={leagueSlug}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop table layout */}
      <div className="hidden overflow-x-auto rounded-lg border border-gray-200 md:block">
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3">
                <Eyebrow as="span">Nombre</Eyebrow>
              </th>
              <th className="px-4 py-3">
                <Eyebrow as="span">Rol</Eyebrow>
              </th>
              <th className="px-4 py-3">
                <Eyebrow as="span">Miembro desde</Eyebrow>
              </th>
              {permissions.canManageMembers && (
                <th className="px-4 py-3">
                  <Eyebrow as="span">Cambiar rol</Eyebrow>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {getMemberDisplayName(member)}
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={member.role} />
                </td>
                <td className="px-4 py-3">{formatDate(member.createdAt)}</td>
                {permissions.canManageMembers && (
                  <td className="px-4 py-3">
                    <LeagueMemberRoleForm
                      key={member.id + member.role}
                      memberId={member.id}
                      currentRole={member.role}
                      leagueSlug={leagueSlug}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
