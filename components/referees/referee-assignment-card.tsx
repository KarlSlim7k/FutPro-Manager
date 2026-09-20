import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextLink } from "@/components/ui/text-link";
import { MATCH_OFFICIAL_ROLE_LABELS, type MatchOfficialRole } from "@/types/database";

export interface OfficialItem {
  role: MatchOfficialRole;
  profileId: string;
  name: string | null;
}

interface RefereeAssignmentCardProps {
  refereeName?: string | null;
  refereeId?: string | null;
  officials?: OfficialItem[];
  currentUserId?: string | null;
  canAssign: boolean;
  assignmentForm: React.ReactNode | null;
}

const ORDERED_ROLES: MatchOfficialRole[] = [
  "head_referee",
  "first_assistant",
  "second_assistant",
  "fourth_official",
];

export function RefereeAssignmentCard({
  refereeName,
  refereeId,
  officials,
  currentUserId,
  canAssign,
  assignmentForm,
}: RefereeAssignmentCardProps) {
  const hasOfficialsList = officials && officials.length > 0;

  // Build a map of assigned roles
  const officialByRole = new Map<MatchOfficialRole, OfficialItem>();
  if (officials) {
    for (const off of officials) {
      officialByRole.set(off.role, off);
    }
  }

  // Fallback single referee name
  const singleDisplayName = refereeName
    ? refereeName
    : refereeId
      ? `Usuario ${refereeId.slice(0, 8)}...`
      : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Cuerpo arbitral</CardTitle>
        <TextLink href="/dashboard/ayuda/liga-asignar-arbitro" className="text-xs font-normal">
          Guía
        </TextLink>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasOfficialsList ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ORDERED_ROLES.map((role) => {
              const assigned = officialByRole.get(role);
              const label = MATCH_OFFICIAL_ROLE_LABELS[role];
              const isCurrentUser = Boolean(
                currentUserId && assigned && assigned.profileId === currentUserId
              );

              return (
                <div
                  key={role}
                  className="rounded-lg border border-gray-100 bg-gray-50/70 p-2.5 text-xs"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 block mb-0.5">
                    {label}
                  </span>
                  {assigned ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm">
                        {assigned.name || `Usuario ${assigned.profileId.slice(0, 8)}...`}
                      </span>
                      {isCurrentUser && (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          Tú / Designado
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Sin asignar</span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            {singleDisplayName ? (
              <p className="text-sm text-gray-900">{singleDisplayName}</p>
            ) : (
              <p className="text-sm text-gray-500">Sin árbitro asignado</p>
            )}
          </div>
        )}

        {canAssign && assignmentForm && (
          <div className="border-t border-gray-100 pt-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Asignar o modificar cuerpo arbitral
            </h4>
            {assignmentForm}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
