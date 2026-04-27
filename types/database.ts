export type AppRole =
  | "super_admin"
  | "league_admin"
  | "team_admin"
  | "coach"
  | "referee"
  | "viewer";

export type LeagueStatus = "draft" | "active" | "archived" | "inactive";
export const SEASON_STATUS_VALUES = [
  "draft",
  "upcoming",
  "active",
  "completed",
  "archived",
] as const;
export type SeasonStatus = (typeof SEASON_STATUS_VALUES)[number];
export const TEAM_STATUS_VALUES = ["active", "inactive", "archived"] as const;
export type TeamStatus = (typeof TEAM_STATUS_VALUES)[number];
export const PLAYER_STATUS_VALUES = [
  "active",
  "inactive",
  "injured",
  "suspended",
  "retired",
] as const;
export type PlayerStatus = (typeof PLAYER_STATUS_VALUES)[number];
export const DOMINANT_FOOT_VALUES = ["left", "right", "both"] as const;
export type DominantFoot = (typeof DOMINANT_FOOT_VALUES)[number];
export type PlayerRegistrationStatus = "active" | "inactive" | "released" | "transferred";
export type MatchStatus = "scheduled" | "in_progress" | "completed" | "postponed" | "cancelled";
export type MatchEventType =
  | "goal"
  | "own_goal"
  | "assist"
  | "yellow_card"
  | "red_card"
  | "substitution"
  | "penalty_goal"
  | "penalty_miss";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled" | "paused";

export interface Profile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  global_role: AppRole;
  created_at: string;
  updated_at: string;
}

export interface League {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  region: string | null;
  city: string | null;
  state: string | null;
  country: string;
  logo_url: string | null;
  is_public: boolean;
  status: LeagueStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Season {
  id: string;
  league_id: string;
  name: string;
  slug: string;
  start_date: string;
  end_date: string;
  status: SeasonStatus;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  league_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  founded_year: number | null;
  status: TeamStatus;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  league_id: string;
  full_name: string;
  birth_date: string | null;
  photo_url: string | null;
  preferred_position: string | null;
  dominant_foot: DominantFoot | null;
  status: PlayerStatus;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  league_id: string;
  season_id: string;
  home_team_id: string;
  away_team_id: string;
  venue_id: string | null;
  referee_id: string | null;
  scheduled_at: string;
  status: MatchStatus;
  home_score: number;
  away_score: number;
  round_name: string | null;
  created_at: string;
  updated_at: string;
}
