export type OverOption = 2 | 3 | 5 | 10 | 20 | 50;

export const OVER_OPTIONS: OverOption[] = [2, 3, 5, 10, 20, 50];

export interface Team {
  id: string;
  name: string;
  short: string;
  flag: string;
  rating: number; // 60-95, overall team strength
  batting: number;
  bowling: number;
  color: string;
}

export type TournamentFormat =
  | "group-knockout" // two groups, top N advance to QF/SF/Final
  | "league-playoff"; // single league table, top 4 into IPL-style playoffs

export interface TournamentConfig {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  format: TournamentFormat;
  teamIds: string[];
  groups?: { id: string; name: string; teamIds: string[] }[];
  advancePerGroup?: number; // for group-knockout
  homeAndAway?: boolean;
  description: string;
}

export type BowlingStyle =
  | "fast"
  | "fast-medium"
  | "medium-fast"
  | "medium"
  | "off-spin"
  | "leg-spin"
  | "left-arm-orthodox"
  | "left-arm-wrist-spin";

export type ShotType =
  | "drive"
  | "pull"
  | "cut"
  | "flick"
  | "loft"
  | "defend"
  | "leave"
  | "edge"
  | "miss"
  | "big-hit";

export interface Innings {
  battingTeamId: string;
  bowlingTeamId: string;
  runs: number;
  wickets: number;
  overs: number;
  ballsFaced: number;
  target?: number;
  isAllOut: boolean;
  timeline: BallEvent[];
}

export interface BallEvent {
  over: number;
  ball: number;
  runs: number;
  isWicket: boolean;
  isFour: boolean;
  isSix: boolean;
  isExtra: boolean;
  label: string;
  bowlingStyle: BowlingStyle;
  speedKph: number;
  shotType: ShotType;
}

export interface MatchResult {
  id: string;
  stage: string;
  team1Id: string;
  team2Id: string;
  oversLimit: OverOption;
  firstInnings: Innings;
  secondInnings: Innings;
  winnerId: string | null;
  isTie: boolean;
  resultText: string;
  playedAt: number;
}

export interface StandingRow {
  teamId: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  points: number;
  runsFor: number;
  oversFor: number;
  runsAgainst: number;
  oversAgainst: number;
  nrr: number;
}

export type FixtureStage =
  | "group"
  | "league"
  | "qualifier1"
  | "eliminator"
  | "eliminator1"
  | "eliminator2"
  | "qualifier"
  | "qualifier2"
  | "quarterfinal"
  | "semifinal"
  | "final";

export interface Fixture {
  id: string;
  stage: FixtureStage;
  groupId?: string;
  team1Id: string | null;
  team2Id: string | null;
  team1Slot?: string; // description like "Group A #1" when not yet resolved
  team2Slot?: string;
  played: boolean;
  result?: MatchResult;
}

export interface TournamentState {
  tournamentId: string;
  overs: OverOption;
  fixtures: Fixture[];
  standings: Record<string, StandingRow>; // keyed by groupId or "league"
  championId: string | null;
  stageLabel: string;
  createdAt: number;
}
