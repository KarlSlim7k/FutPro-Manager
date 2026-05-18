import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RefereeAssignmentCardProps {
  refereeName: string | null;
  refereeId: string | null;
  canAssign: boolean;
  assignmentForm: React.ReactNode | null;
}

export function RefereeAssignmentCard({
  refereeName,
  refereeId,
  canAssign,
  assignmentForm,
}: RefereeAssignmentCardProps) {
  const displayName = refereeName
    ? refereeName
    : refereeId
      ? `Usuario ${refereeId.slice(0, 8)}...`
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Arbitro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayName ? (
          <p className="text-sm text-gray-900">{displayName}</p>
        ) : (
          <p className="text-sm text-gray-500">Sin arbitro asignado</p>
        )}
        {canAssign && assignmentForm}
      </CardContent>
    </Card>
  );
}
