# Cricket Champions

A cricket tournament simulator — pick a tournament (World Cup, T20 World Cup, Asia Cup, BPL, IPL, PSL, LPL), pick an overs format (2 to 50 overs), and play through group/league stages and knockouts to crown a champion.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/cricket-champions/src/lib/types.ts` — core domain types (Team, TournamentConfig, Fixture, StandingRow, MatchResult, Innings, OverOption)
- `artifacts/cricket-champions/src/lib/teams.ts` — all team rosters (international + BPL/IPL/PSL/LPL franchises)
- `artifacts/cricket-champions/src/lib/tournaments.ts` — the 7 tournament configs (World Cup, T20 World Cup, Asia Cup, BPL, IPL, PSL, LPL)
- `artifacts/cricket-champions/src/lib/matchSimulator.ts` — ball-by-ball match simulation engine
- `artifacts/cricket-champions/src/lib/tournamentEngine.ts` — fixture generation, standings, and stage advancement (group→knockout, league→playoffs)
- `artifacts/cricket-champions/src/hooks/useTournament.ts` — React hook/context wrapping the engine with localStorage persistence

## Architecture decisions

- This is a fully client-side app — no backend/database. Tournament progress persists to localStorage only (single active tournament at a time).
- Game rules/simulation logic live in `src/lib` and are owned by the main agent; the design subagent only builds UI that consumes the `useTournament` hook.
- Two tournament formats: `group-knockout` (World Cup, T20 WC, Asia Cup — groups feed into QF/SF/Final) and `league-playoff` (BPL/IPL/PSL/LPL — round robin feeds into Qualifier1/Eliminator/Qualifier2/Final).

## Product

- Pick one of 7 tournaments and an overs format (2/3/5/10/20/50 overs per innings)
- Play through group or league stage fixtures one at a time (or simulate all remaining at once)
- Standings tables update live; stage automatically advances to knockouts/playoffs once the prior stage completes
- Championship reveal screen once a champion is crowned, with option to start a new tournament

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After editing `src/lib/tournaments.ts` or `src/lib/teams.ts`, no codegen step is needed — this app has no OpenAPI/backend.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
