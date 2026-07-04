import type { BallEvent, Innings, MatchResult, OverOption, Team } from "./types";

function rand(): number {
  return Math.random();
}

function weightedOutcome(battingStrength: number, bowlingStrength: number): {
  runs: number;
  isWicket: boolean;
  isExtra: boolean;
} {
  const balance = battingStrength - bowlingStrength;
  const wicketChance = clamp(0.065 - balance * 0.0011, 0.02, 0.14);

  if (rand() < wicketChance) {
    return { runs: 0, isWicket: true, isExtra: false };
  }

  const extraChance = 0.045;
  if (rand() < extraChance) {
    return { runs: rand() < 0.7 ? 1 : rand() < 0.85 ? 4 : 5, isWicket: false, isExtra: true };
  }

  const aggression = clamp(0.5 + balance * 0.006, 0.25, 0.85);
  const roll = rand();

  let runs: number;
  if (roll < 0.36 - aggression * 0.08) {
    runs = 0;
  } else if (roll < 0.62) {
    runs = 1;
  } else if (roll < 0.72) {
    runs = 2;
  } else if (roll < 0.76) {
    runs = 3;
  } else if (roll < 0.76 + aggression * 0.16) {
    runs = 4;
  } else if (roll < 0.97) {
    runs = rand() < 0.5 ? 1 : 0;
  } else {
    runs = 6;
  }

  return { runs, isWicket: false, isExtra: false };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function simulateInnings(
  battingTeam: Team,
  bowlingTeam: Team,
  oversLimit: OverOption,
  target?: number,
): Innings {
  const totalBalls = oversLimit * 6;
  const maxWickets = 10;
  let runs = 0;
  let wickets = 0;
  let ballsFaced = 0;
  const timeline: BallEvent[] = [];

  const battingStrength = battingTeam.batting;
  const bowlingStrength = bowlingTeam.bowling;

  for (let i = 0; i < totalBalls; i++) {
    if (wickets >= maxWickets) break;
    if (target !== undefined && runs > target) break;

    const over = Math.floor(i / 6);
    const ball = (i % 6) + 1;

    const progress = i / totalBalls;
    const pushFactor = target !== undefined ? clamp((target - runs) / Math.max(totalBalls - i, 1) - 1, -1, 3) * 3 : 0;
    const lateInningsPush = progress > 0.82 ? 6 : 0;

    const outcome = weightedOutcome(battingStrength + pushFactor + lateInningsPush, bowlingStrength);

    runs += outcome.runs;
    ballsFaced += 1;
    if (outcome.isWicket) wickets += 1;

    let label = "";
    if (outcome.isWicket) label = "OUT";
    else if (outcome.isExtra) label = outcome.runs >= 4 ? "Extras (boundary)" : "Extra run";
    else if (outcome.runs === 0) label = "Dot ball";
    else if (outcome.runs === 4) label = "FOUR!";
    else if (outcome.runs === 6) label = "SIX!";
    else label = `${outcome.runs} run${outcome.runs > 1 ? "s" : ""}`;

    timeline.push({
      over,
      ball,
      runs: outcome.runs,
      isWicket: outcome.isWicket,
      isFour: outcome.runs === 4,
      isSix: outcome.runs === 6,
      isExtra: outcome.isExtra,
      label,
    });

    if (target !== undefined && runs > target) break;
  }

  const oversPlayed = Math.floor(ballsFaced / 6) + (ballsFaced % 6) / 6;

  return {
    battingTeamId: battingTeam.id,
    bowlingTeamId: bowlingTeam.id,
    runs,
    wickets,
    overs: Math.round(oversPlayed * 10) / 10,
    ballsFaced,
    target,
    isAllOut: wickets >= maxWickets,
    timeline,
  };
}

export function simulateMatch(
  id: string,
  stage: string,
  team1: Team,
  team2: Team,
  oversLimit: OverOption,
): MatchResult {
  const team1BatsFirst = rand() < 0.5;
  const battingFirst = team1BatsFirst ? team1 : team2;
  const bowlingFirst = team1BatsFirst ? team2 : team1;

  const firstInnings = simulateInnings(battingFirst, bowlingFirst, oversLimit);
  const target = firstInnings.runs + 1;
  const secondInnings = simulateInnings(bowlingFirst, battingFirst, oversLimit, target - 1);

  let winnerId: string | null = null;
  let isTie = false;
  let resultText = "";

  if (secondInnings.runs >= target) {
    winnerId = secondInnings.battingTeamId;
    const wicketsInHand = 10 - secondInnings.wickets;
    resultText = `${nameOf(winnerId, team1, team2)} won by ${wicketsInHand} wicket${wicketsInHand === 1 ? "" : "s"}`;
  } else if (secondInnings.runs === firstInnings.runs) {
    isTie = true;
    resultText = "Match tied";
  } else {
    winnerId = firstInnings.battingTeamId;
    const margin = firstInnings.runs - secondInnings.runs;
    resultText = `${nameOf(winnerId, team1, team2)} won by ${margin} run${margin === 1 ? "" : "s"}`;
  }

  return {
    id,
    stage,
    team1Id: team1.id,
    team2Id: team2.id,
    oversLimit,
    firstInnings,
    secondInnings,
    winnerId,
    isTie,
    resultText,
    playedAt: Date.now(),
  };
}

function nameOf(teamId: string, team1: Team, team2: Team): string {
  return teamId === team1.id ? team1.name : team2.name;
}
