import { getTeam } from "./teams";
import { TOURNAMENTS } from "./tournaments";
import { simulateMatch } from "./matchSimulator";
import type {
  Fixture,
  FixtureStage,
  MatchResult,
  OverOption,
  StandingRow,
  TournamentConfig,
  TournamentState,
} from "./types";

let fixtureCounter = 0;
function nextFixtureId(): string {
  fixtureCounter += 1;
  return `fx-${Date.now()}-${fixtureCounter}`;
}

function roundRobinPairs(teamIds: string[], homeAndAway: boolean): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      pairs.push([teamIds[i]!, teamIds[j]!]);
      if (homeAndAway) pairs.push([teamIds[j]!, teamIds[i]!]);
    }
  }
  return pairs;
}

function emptyStandingRow(teamId: string): StandingRow {
  return {
    teamId,
    played: 0,
    won: 0,
    lost: 0,
    tied: 0,
    points: 0,
    runsFor: 0,
    oversFor: 0,
    runsAgainst: 0,
    oversAgainst: 0,
    nrr: 0,
  };
}

export function initTournament(tournamentId: string, overs: OverOption): TournamentState {
  const config = TOURNAMENTS[tournamentId];
  if (!config) throw new Error(`Unknown tournament: ${tournamentId}`);

  const fixtures: Fixture[] = [];
  const standings: Record<string, StandingRow> = {};

  if (config.format === "group-knockout" && config.groups) {
    for (const group of config.groups) {
      for (const teamId of group.teamIds) {
        standings[teamId] = emptyStandingRow(teamId);
      }
      const pairs = roundRobinPairs(group.teamIds, false);
      for (const [t1, t2] of pairs) {
        fixtures.push({
          id: nextFixtureId(),
          stage: "group",
          groupId: group.id,
          team1Id: t1,
          team2Id: t2,
          played: false,
        });
      }
    }
  } else {
    for (const teamId of config.teamIds) {
      standings[teamId] = emptyStandingRow(teamId);
    }
    const pairs = roundRobinPairs(config.teamIds, !!config.homeAndAway);
    for (const [t1, t2] of pairs) {
      fixtures.push({
        id: nextFixtureId(),
        stage: "league",
        team1Id: t1,
        team2Id: t2,
        played: false,
      });
    }
  }

  return {
    tournamentId,
    overs,
    fixtures,
    standings,
    championId: null,
    stageLabel: config.format === "group-knockout" ? "Group Stage" : "League Stage",
    createdAt: Date.now(),
  };
}

function updateStandingsWithResult(standings: Record<string, StandingRow>, result: MatchResult) {
  const t1 = standings[result.team1Id];
  const t2 = standings[result.team2Id];
  if (!t1 || !t2) return;

  const team1BattedFirst = result.firstInnings.battingTeamId === result.team1Id;
  const team1Innings = team1BattedFirst ? result.firstInnings : result.secondInnings;
  const team2Innings = team1BattedFirst ? result.secondInnings : result.firstInnings;

  t1.played += 1;
  t2.played += 1;
  t1.runsFor += team1Innings.runs;
  t1.oversFor += team1Innings.overs;
  t1.runsAgainst += team2Innings.runs;
  t1.oversAgainst += team2Innings.overs;

  t2.runsFor += team2Innings.runs;
  t2.oversFor += team2Innings.overs;
  t2.runsAgainst += team1Innings.runs;
  t2.oversAgainst += team1Innings.overs;

  if (result.isTie) {
    t1.tied += 1;
    t2.tied += 1;
    t1.points += 1;
    t2.points += 1;
  } else if (result.winnerId === result.team1Id) {
    t1.won += 1;
    t1.points += 2;
    t2.lost += 1;
  } else {
    t2.won += 1;
    t2.points += 2;
    t1.lost += 1;
  }

  t1.nrr = computeNrr(t1);
  t2.nrr = computeNrr(t2);
}

function computeNrr(row: StandingRow): number {
  const forRate = row.oversFor > 0 ? row.runsFor / row.oversFor : 0;
  const againstRate = row.oversAgainst > 0 ? row.runsAgainst / row.oversAgainst : 0;
  return Math.round((forRate - againstRate) * 1000) / 1000;
}

export function sortStandings(rows: StandingRow[]): StandingRow[] {
  return [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.nrr - a.nrr;
  });
}

export function getGroupStandings(state: TournamentState, groupId?: string): StandingRow[] {
  const config = TOURNAMENTS[state.tournamentId]!;
  let teamIds: string[];
  if (config.groups && groupId) {
    teamIds = config.groups.find((g) => g.id === groupId)?.teamIds ?? [];
  } else {
    teamIds = config.teamIds;
  }
  const rows = teamIds.map((id) => state.standings[id]).filter(Boolean) as StandingRow[];
  return sortStandings(rows);
}

export function playFixture(state: TournamentState, fixtureId: string): TournamentState {
  const fixture = state.fixtures.find((f) => f.id === fixtureId);
  if (!fixture || fixture.played || !fixture.team1Id || !fixture.team2Id) return state;

  const team1 = getTeam(fixture.team1Id)!;
  const team2 = getTeam(fixture.team2Id)!;

  const result = simulateMatch(fixture.id, fixture.stage, team1, team2, state.overs);

  const newFixtures = state.fixtures.map((f) =>
    f.id === fixtureId ? { ...f, played: true, result } : f,
  );

  const newStandings: Record<string, StandingRow> = {};
  for (const key of Object.keys(state.standings)) {
    newStandings[key] = { ...state.standings[key]! };
  }

  let nextState: TournamentState = { ...state, fixtures: newFixtures, standings: newStandings };

  const stagesWithStandings: FixtureStage[] = ["group", "league"];
  if (stagesWithStandings.includes(fixture.stage)) {
    updateStandingsWithResult(nextState.standings, result);
  }

  setStandingsSnapshot(nextState.standings);
  nextState = maybeAdvanceStage(nextState);
  return nextState;
}

function allPlayed(fixtures: Fixture[], stage: FixtureStage, groupId?: string): boolean {
  return fixtures
    .filter((f) => f.stage === stage && (groupId === undefined || f.groupId === groupId))
    .every((f) => f.played);
}

function hasStage(fixtures: Fixture[], stage: FixtureStage): boolean {
  return fixtures.some((f) => f.stage === stage);
}

function addFixture(fixtures: Fixture[], stage: FixtureStage, team1Id: string | null, team2Id: string | null, slots?: { team1Slot?: string; team2Slot?: string }) {
  fixtures.push({
    id: nextFixtureId(),
    stage,
    team1Id,
    team2Id,
    played: false,
    ...slots,
  });
}

function maybeAdvanceStage(state: TournamentState): TournamentState {
  const config = TOURNAMENTS[state.tournamentId]!;
  const fixtures = [...state.fixtures];
  let stageLabel = state.stageLabel;
  let championId = state.championId;

  if (config.format === "group-knockout") {
    stageLabel = advanceGroupKnockout(config, fixtures) ?? stageLabel;
  } else {
    stageLabel = advanceLeaguePlayoff(config, fixtures) ?? stageLabel;
  }

  const finalFixture = fixtures.find((f) => f.stage === "final");
  if (finalFixture?.played && finalFixture.result?.winnerId) {
    championId = finalFixture.result.winnerId;
    stageLabel = "Champion Crowned";
  }

  return { ...state, fixtures, stageLabel, championId };
}

function advanceGroupKnockout(config: TournamentConfig, fixtures: Fixture[]): string | undefined {
  const groups = config.groups ?? [];
  const advancePerGroup = config.advancePerGroup ?? 4;
  const groupStageDone = groups.every((g) => allPlayed(fixtures, "group", g.id));

  if (!groupStageDone) return "Group Stage";

  if (advancePerGroup === 4 && groups.length === 2) {
    if (!hasStage(fixtures, "quarterfinal")) {
      const qualifiers: Record<string, string[]> = {};
      for (const g of groups) {
        const rows = sortStandings(g.teamIds.map((id) => qsGetRow(fixtures, config, id)).filter(Boolean) as StandingRow[]);
        qualifiers[g.id] = rows.slice(0, 4).map((r) => r.teamId);
      }
      const [a1, a2, a3, a4] = qualifiers[groups[0]!.id]!;
      const [b1, b2, b3, b4] = qualifiers[groups[1]!.id]!;
      addFixture(fixtures, "quarterfinal", a1!, b4!, { team1Slot: `${groups[0]!.name} #1`, team2Slot: `${groups[1]!.name} #4` });
      addFixture(fixtures, "quarterfinal", b1!, a4!, { team1Slot: `${groups[1]!.name} #1`, team2Slot: `${groups[0]!.name} #4` });
      addFixture(fixtures, "quarterfinal", a2!, b3!, { team1Slot: `${groups[0]!.name} #2`, team2Slot: `${groups[1]!.name} #3` });
      addFixture(fixtures, "quarterfinal", b2!, a3!, { team1Slot: `${groups[1]!.name} #2`, team2Slot: `${groups[0]!.name} #3` });
      return "Quarter-Finals";
    }

    if (!allPlayed(fixtures, "quarterfinal")) return "Quarter-Finals";

    if (!hasStage(fixtures, "semifinal")) {
      const qfs = fixtures.filter((f) => f.stage === "quarterfinal");
      const winners = qfs.map((f) => f.result!.winnerId!);
      addFixture(fixtures, "semifinal", winners[0]!, winners[3]!, { team1Slot: "QF1 Winner", team2Slot: "QF4 Winner" });
      addFixture(fixtures, "semifinal", winners[1]!, winners[2]!, { team1Slot: "QF2 Winner", team2Slot: "QF3 Winner" });
      return "Semi-Finals";
    }

    if (!allPlayed(fixtures, "semifinal")) return "Semi-Finals";

    if (!hasStage(fixtures, "final")) {
      const sfs = fixtures.filter((f) => f.stage === "semifinal");
      const winners = sfs.map((f) => f.result!.winnerId!);
      addFixture(fixtures, "final", winners[0]!, winners[1]!, { team1Slot: "SF1 Winner", team2Slot: "SF2 Winner" });
      return "Final";
    }

    return "Final";
  }

  if (advancePerGroup === 2 && groups.length === 2) {
    if (!hasStage(fixtures, "semifinal")) {
      const qualifiers: Record<string, string[]> = {};
      for (const g of groups) {
        const rows = sortStandings(g.teamIds.map((id) => qsGetRow(fixtures, config, id)).filter(Boolean) as StandingRow[]);
        qualifiers[g.id] = rows.slice(0, 2).map((r) => r.teamId);
      }
      const [a1, a2] = qualifiers[groups[0]!.id]!;
      const [b1, b2] = qualifiers[groups[1]!.id]!;
      addFixture(fixtures, "semifinal", a1!, b2!, { team1Slot: `${groups[0]!.name} #1`, team2Slot: `${groups[1]!.name} #2` });
      addFixture(fixtures, "semifinal", b1!, a2!, { team1Slot: `${groups[1]!.name} #1`, team2Slot: `${groups[0]!.name} #2` });
      return "Semi-Finals";
    }

    if (!allPlayed(fixtures, "semifinal")) return "Semi-Finals";

    if (!hasStage(fixtures, "final")) {
      const sfs = fixtures.filter((f) => f.stage === "semifinal");
      const winners = sfs.map((f) => f.result!.winnerId!);
      addFixture(fixtures, "final", winners[0]!, winners[1]!, { team1Slot: "SF1 Winner", team2Slot: "SF2 Winner" });
      return "Final";
    }

    return "Final";
  }

  return undefined;
}

// Temporary standings snapshot cache used only during group->knockout transition,
// derived straight from the state's standings (fixtures param unused but kept for signature symmetry).
let standingsSnapshot: Record<string, StandingRow> | null = null;
export function setStandingsSnapshot(standings: Record<string, StandingRow>) {
  standingsSnapshot = standings;
}
function qsGetRow(_fixtures: Fixture[], _config: TournamentConfig, teamId: string): StandingRow | undefined {
  return standingsSnapshot?.[teamId];
}

function advanceLeaguePlayoff(config: TournamentConfig, fixtures: Fixture[]): string | undefined {
  const leagueDone = allPlayed(fixtures, "league");
  if (!leagueDone) return "League Stage";

  if (!hasStage(fixtures, "qualifier1")) {
    const rows = sortStandings(config.teamIds.map((id) => qsGetRow(fixtures, config, id)).filter(Boolean) as StandingRow[]);
    const top4 = rows.slice(0, 4).map((r) => r.teamId);
    addFixture(fixtures, "qualifier1", top4[0]!, top4[1]!, { team1Slot: "1st Place", team2Slot: "2nd Place" });
    addFixture(fixtures, "eliminator", top4[2]!, top4[3]!, { team1Slot: "3rd Place", team2Slot: "4th Place" });
    return "Playoffs — Qualifier 1 & Eliminator";
  }

  const q1 = fixtures.find((f) => f.stage === "qualifier1");
  const elim = fixtures.find((f) => f.stage === "eliminator");
  if (!q1?.played || !elim?.played) return "Playoffs — Qualifier 1 & Eliminator";

  if (!hasStage(fixtures, "qualifier2")) {
    const q1Loser = q1.result!.winnerId === q1.team1Id ? q1.team2Id! : q1.team1Id!;
    addFixture(fixtures, "qualifier2", q1Loser, elim.result!.winnerId!, {
      team1Slot: "Qualifier 1 Loser",
      team2Slot: "Eliminator Winner",
    });
    return "Playoffs — Qualifier 2";
  }

  const q2 = fixtures.find((f) => f.stage === "qualifier2");
  if (!q2?.played) return "Playoffs — Qualifier 2";

  if (!hasStage(fixtures, "final")) {
    addFixture(fixtures, "final", q1!.result!.winnerId!, q2.result!.winnerId!, {
      team1Slot: "Qualifier 1 Winner",
      team2Slot: "Qualifier 2 Winner",
    });
    return "Final";
  }

  return "Final";
}

export function getStageFixtures(state: TournamentState, stage: FixtureStage, groupId?: string): Fixture[] {
  return state.fixtures.filter((f) => f.stage === stage && (groupId === undefined || f.groupId === groupId));
}

export function getNextUnplayedFixture(state: TournamentState): Fixture | undefined {
  return state.fixtures.find((f) => !f.played && f.team1Id && f.team2Id);
}

export function isTournamentComplete(state: TournamentState): boolean {
  return !!state.championId;
}

export { TOURNAMENTS };
