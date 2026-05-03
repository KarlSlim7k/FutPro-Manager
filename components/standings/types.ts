export type StandingTeamSummary = {
  id: string;
  name: string;
  slug: string | null;
};

export type StandingRowViewModel = {
  id: string;
  team_id: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  updated_at?: string | null;
  team: StandingTeamSummary | null;
};
