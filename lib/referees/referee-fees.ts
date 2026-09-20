import type { MatchOfficialRole } from "@/types/database";

export type OfficialFeeTariff = Record<MatchOfficialRole, number>;

export const DEFAULT_REFEREE_TARIFF: OfficialFeeTariff = {
  head_referee: 400, // $400 MXN
  first_assistant: 250, // $250 MXN
  second_assistant: 250, // $250 MXN
  fourth_official: 150, // $150 MXN
};

export type RefereeMatchAssignment = {
  matchId: string;
  roundName?: string | null;
  scheduledAt: string;
  status: string;
  role: MatchOfficialRole;
  homeTeamName: string;
  awayTeamName: string;
  feeAmount: number;
  isPaid: boolean;
};

export type RefereeEarningsSummary = {
  totalMatches: number;
  totalEarned: number;
  totalPaid: number;
  totalPending: number;
  assignments: RefereeMatchAssignment[];
};

export function calculateRefereeEarnings({
  assignments,
  customTariff = DEFAULT_REFEREE_TARIFF,
}: {
  assignments: Array<{
    matchId: string;
    roundName?: string | null;
    scheduledAt: string;
    status: string;
    role: MatchOfficialRole;
    homeTeamName: string;
    awayTeamName: string;
    isPaid?: boolean;
    customFee?: number;
  }>;
  customTariff?: OfficialFeeTariff;
}): RefereeEarningsSummary {
  let earned = 0;
  let paid = 0;
  let pending = 0;

  const calculatedAssignments: RefereeMatchAssignment[] = assignments.map((item) => {
    const fee = item.customFee ?? (customTariff[item.role] || 300);
    const isCompleted = item.status === "completed" || item.status === "in_progress";
    const isPaid = !!item.isPaid;

    if (isCompleted) {
      earned += fee;
      if (isPaid) {
        paid += fee;
      } else {
        pending += fee;
      }
    }

    return {
      matchId: item.matchId,
      roundName: item.roundName,
      scheduledAt: item.scheduledAt,
      status: item.status,
      role: item.role,
      homeTeamName: item.homeTeamName,
      awayTeamName: item.awayTeamName,
      feeAmount: fee,
      isPaid,
    };
  });

  return {
    totalMatches: assignments.length,
    totalEarned: earned,
    totalPaid: paid,
    totalPending: pending,
    assignments: calculatedAssignments,
  };
}
