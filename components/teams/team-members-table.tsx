import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { RoleBadge } from "@/components/members/role-badge";
import { TeamMemberRoleForm } from "./team-member-role-form";
import type { AppRole } from "@/types/database";

export interface TeamMemberData {
  id: string;
  profileId: string;
  role: AppRole;
  createdAt: string;
  profileName: string | null;
  profileDisplayName: string | null;
}

interface TeamMembersTableProps {
  members: TeamMemberData[];
  canManage: boolean;
  leagueSlug: string;
  teamSlug: string;
}

function formatDateTime(dateStr: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
  }).format(new Date(dateStr));
}

export function TeamMembersTable({
  members,
  canManage,
  leagueSlug,
  teamSlug,
}: TeamMembersTableProps) {
  return (
    <div className="space-y-4">
      {/* Mobile view */}
      <div className="space-y-3 md:hidden">
        {members.map((member) => {
          const displayName =
            member.profileDisplayName ||
            member.profileName ||
            `Usuario ${member.profileId.slice(0, 8)}...`;

          return (
            <Card key={member.id}>
              <CardHeader className="space-y-2 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{displayName}</CardTitle>
                  <RoleBadge role={member.role} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <p className="text-xs text-gray-500">
                  Incorporado: {formatDateTime(member.createdAt)}
                </p>
                {canManage ? (
                  <div className="border-t border-gray-100 pt-3">
                    <TeamMemberRoleForm
                      leagueSlug={leagueSlug}
                      teamSlug={teamSlug}
                      memberId={member.id}
                      currentRole={member.role}
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop view */}
      <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white md:block">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th scope="col" className="px-4 py-3">
                <Eyebrow as="span">Nombre</Eyebrow>
              </th>
              <th scope="col" className="px-4 py-3">
                <Eyebrow as="span">Rol actual</Eyebrow>
              </th>
              <th scope="col" className="px-4 py-3">
                <Eyebrow as="span">Fecha de alta</Eyebrow>
              </th>
              {canManage ? (
                <th scope="col" className="px-4 py-3">
                  <Eyebrow as="span">Acciones</Eyebrow>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {members.map((member) => {
              const displayName =
                member.profileDisplayName ||
                member.profileName ||
                `Usuario ${member.profileId.slice(0, 8)}...`;

              return (
                <tr key={member.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {displayName}
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={member.role} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDateTime(member.createdAt)}
                  </td>
                  {canManage ? (
                    <td className="px-4 py-3">
                      <TeamMemberRoleForm
                        leagueSlug={leagueSlug}
                        teamSlug={teamSlug}
                        memberId={member.id}
                        currentRole={member.role}
                      />
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
