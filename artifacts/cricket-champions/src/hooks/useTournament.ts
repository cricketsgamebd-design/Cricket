import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { OverOption, TournamentState } from "@/lib/types";
import {
  getGroupStandings,
  getNextUnplayedFixture,
  getStageFixtures,
  initTournament,
  isTournamentComplete,
  playFixture,
  setStandingsSnapshot,
} from "@/lib/tournamentEngine";
import { TOURNAMENTS } from "@/lib/tournaments";

const STORAGE_KEY = "cricket-champions:active-tournament";

function loadFromStorage(): TournamentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TournamentState;
  } catch {
    return null;
  }
}

function saveToStorage(state: TournamentState | null) {
  try {
    if (state === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // ignore storage errors (e.g. private mode)
  }
}

export interface TournamentContextValue {
  state: TournamentState | null;
  config: (typeof TOURNAMENTS)[string] | null;
  startTournament: (tournamentId: string, overs: OverOption) => void;
  simulateFixture: (fixtureId: string) => void;
  simulateNext: () => void;
  simulateAllRemaining: () => void;
  resetTournament: () => void;
  nextFixture: ReturnType<typeof getNextUnplayedFixture>;
  isComplete: boolean;
}

export function useTournamentState(): TournamentContextValue {
  const [state, setState] = useState<TournamentState | null>(() => loadFromStorage());

  useEffect(() => {
    if (state) setStandingsSnapshot(state.standings);
  }, [state]);

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  const startTournament = useCallback((tournamentId: string, overs: OverOption) => {
    const initial = initTournament(tournamentId, overs);
    setStandingsSnapshot(initial.standings);
    setState(initial);
  }, []);

  const simulateFixture = useCallback((fixtureId: string) => {
    setState((prev) => {
      if (!prev) return prev;
      return playFixture(prev, fixtureId);
    });
  }, []);

  const simulateNext = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      const next = getNextUnplayedFixture(prev);
      if (!next) return prev;
      return playFixture(prev, next.id);
    });
  }, []);

  const simulateAllRemaining = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      let current = prev;
      let guard = 0;
      while (guard < 500) {
        const next = getNextUnplayedFixture(current);
        if (!next) break;
        current = playFixture(current, next.id);
        guard += 1;
      }
      return current;
    });
  }, []);

  const resetTournament = useCallback(() => {
    setState(null);
  }, []);

  const config = state ? TOURNAMENTS[state.tournamentId] ?? null : null;
  const nextFixture = state ? getNextUnplayedFixture(state) : undefined;
  const isComplete = state ? isTournamentComplete(state) : false;

  return useMemo(
    () => ({
      state,
      config,
      startTournament,
      simulateFixture,
      simulateNext,
      simulateAllRemaining,
      resetTournament,
      nextFixture,
      isComplete,
    }),
    [state, config, startTournament, simulateFixture, simulateNext, simulateAllRemaining, resetTournament, nextFixture, isComplete],
  );
}

export const TournamentContext = createContext<TournamentContextValue | null>(null);

export function useTournament(): TournamentContextValue {
  const ctx = useContext(TournamentContext);
  if (!ctx) throw new Error("useTournament must be used within a TournamentProvider");
  return ctx;
}

export { getGroupStandings, getStageFixtures };
