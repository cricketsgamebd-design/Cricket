import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useTournament, getGroupStandings, getStageFixtures } from "@/hooks/useTournament";
import { getTeam } from "@/lib/teams";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, FastForward, Play as PlayIcon, AlertCircle, RotateCcw, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Fixture } from "@/lib/types";
import MatchPlayback3D from "@/components/cricket3d/MatchPlayback3D";

export default function Play() {
  const [, setLocation] = useLocation();
  const { state, config, isComplete, nextFixture, simulateNext, simulateAllRemaining, resetTournament, simulateFixture } = useTournament();
  const [watchFixture, setWatchFixture] = useState<Fixture | null>(null);
  const [watchInningsIndex, setWatchInningsIndex] = useState<0 | 1>(0);

  if (!state || !config) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
        <AlertCircle className="w-16 h-16 text-slate-400" />
        <h2 className="text-2xl font-bold text-slate-700">No Active Tournament</h2>
        <Button onClick={() => setLocation("/")}>Go to Selection</Button>
      </div>
    );
  }

  if (isComplete && state.championId) {
    const champion = getTeam(state.championId);
    const championFixtures = state.fixtures.filter(
      f => f.played && (f.team1Id === state.championId || f.team2Id === state.championId)
    );
    
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-4 py-12 overflow-y-auto">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-3xl" />
        </div>
        
        <div className="z-10 text-center space-y-8 animate-in zoom-in duration-700 max-w-3xl w-full">
          <div className="text-8xl mb-4">{champion?.flag}</div>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-yellow-600">
            {champion?.name}
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold text-slate-300">
            {config.name} Champions!
          </h2>
          
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 mt-12 text-left space-y-4">
            <h3 className="text-xl font-bold text-slate-300 uppercase tracking-widest border-b border-slate-700 pb-2 mb-4">Road to Glory</h3>
            <div className="space-y-3">
              {championFixtures.map(f => {
                const oppId = f.team1Id === state.championId ? f.team2Id : f.team1Id;
                const opp = getTeam(oppId);
                const won = f.result?.winnerId === state.championId;
                
                return (
                  <div key={f.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700 gap-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-16 justify-center bg-slate-900 text-slate-300 border-slate-700">{f.stage}</Badge>
                      <span className="font-medium text-slate-400">vs</span>
                      <span className="font-bold flex items-center gap-2">
                        <span>{opp?.flag}</span> {opp?.name}
                      </span>
                    </div>
                    <div className={cn("text-sm font-bold px-2 py-1 rounded", won ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                      {f.result?.resultText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="pt-8">
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-bold" onClick={() => {
              resetTournament();
              setLocation("/");
            }}>
              <RotateCcw className="w-5 h-5 mr-2" />
              Start New Tournament
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Find current stage fixtures
  const currentStageFixtures = state.fixtures.filter(f => !f.played);
  const activeStage = currentStageFixtures.length > 0 ? currentStageFixtures[0].stage : state.fixtures[state.fixtures.length - 1].stage;
  
  const stageFixtures = getStageFixtures(state, activeStage);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white py-6 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{config.emoji}</span>
              <div>
                <h1 className="text-2xl font-black tracking-tight">{config.name}</h1>
                <p className="text-slate-400 font-medium">{state.overs} Overs • {state.stageLabel}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={simulateNext} disabled={!nextFixture} className="font-bold">
              <PlayIcon className="w-4 h-4 mr-2" />
              Simulate Next
            </Button>
            <Button variant="outline" className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 font-bold" onClick={simulateAllRemaining} disabled={!nextFixture}>
              <FastForward className="w-4 h-4 mr-2" />
              Simulate Stage
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Match Center</h2>
              <Badge variant="outline" className="text-sm font-bold uppercase">{activeStage}</Badge>
            </div>
            
            <div className="space-y-4">
              {stageFixtures.map(fixture => {
                const t1 = getTeam(fixture.team1Id);
                const t2 = getTeam(fixture.team2Id);
                
                return (
                  <Card key={fixture.id} className={cn("overflow-hidden transition-all", !fixture.played && fixture.id === nextFixture?.id ? "ring-2 ring-primary shadow-md" : "")}>
                    <div className="flex flex-col sm:flex-row sm:items-stretch">
                      <div className="flex-1 p-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                        <div className="text-right flex items-center justify-end gap-3">
                          <span className="font-bold text-lg">{t1?.name || fixture.team1Slot}</span>
                          {t1 && <span className="text-2xl">{t1.flag}</span>}
                        </div>
                        <div className="text-sm font-black text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full">VS</div>
                        <div className="text-left flex items-center justify-start gap-3">
                          {t2 && <span className="text-2xl">{t2.flag}</span>}
                          <span className="font-bold text-lg">{t2?.name || fixture.team2Slot}</span>
                        </div>
                      </div>
                      
                      <div className={cn(
                        "p-4 sm:w-64 flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l",
                        fixture.played ? "bg-slate-50" : "bg-white"
                      )}>
                        {fixture.played && fixture.result ? (
                          <div className="text-center w-full">
                            <div className="font-mono text-sm space-y-1 mb-2 text-slate-600">
                              <div className="flex justify-between">
                                <span>{getTeam(fixture.result.firstInnings.battingTeamId)?.short}</span>
                                <span className="font-bold text-slate-900">{fixture.result.firstInnings.runs}/{fixture.result.firstInnings.wickets}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{getTeam(fixture.result.secondInnings.battingTeamId)?.short}</span>
                                <span className="font-bold text-slate-900">{fixture.result.secondInnings.runs}/{fixture.result.secondInnings.wickets}</span>
                              </div>
                            </div>
                            <div className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded mb-2">
                              {fixture.result.resultText}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full font-bold"
                              onClick={() => setWatchFixture(fixture)}
                            >
                              <Clapperboard className="w-4 h-4 mr-2" />
                              Watch 3D
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant={fixture.id === nextFixture?.id ? "default" : "outline"}
                            className="w-full font-bold"
                            disabled={!fixture.team1Id || !fixture.team2Id}
                            onClick={() => simulateFixture(fixture.id)}
                          >
                            Simulate
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          <div className="space-y-6">
             <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Standings</h2>
             
             {config.format === "league-playoff" ? (
               <StandingsTable standings={getGroupStandings(state)} title="League Table" />
             ) : (
               <div className="space-y-6">
                 {config.groups?.map(g => (
                   <StandingsTable key={g.id} standings={getGroupStandings(state, g.id)} title={g.name} />
                 ))}
               </div>
             )}
          </div>
        </div>
      </main>

      {watchFixture?.result && (
        <MatchPlayback3D
          innings={watchInningsIndex === 0 ? watchFixture.result.firstInnings : watchFixture.result.secondInnings}
          battingTeam={
            getTeam(
              watchInningsIndex === 0
                ? watchFixture.result.firstInnings.battingTeamId
                : watchFixture.result.secondInnings.battingTeamId,
            )!
          }
          bowlingTeam={
            getTeam(
              watchInningsIndex === 0
                ? watchFixture.result.firstInnings.bowlingTeamId
                : watchFixture.result.secondInnings.bowlingTeamId,
            )!
          }
          onClose={() => {
            if (watchInningsIndex === 0) {
              setWatchInningsIndex(1);
            } else {
              setWatchFixture(null);
              setWatchInningsIndex(0);
            }
          }}
        />
      )}
    </div>
  );
}

function StandingsTable({ standings, title }: { standings: any[], title: string }) {
  if (!standings || standings.length === 0) return null;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-slate-100 py-3 px-4">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600">{title}</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-2">Team</th>
              <th className="px-2 py-2 text-center" title="Played">P</th>
              <th className="px-2 py-2 text-center" title="Won">W</th>
              <th className="px-2 py-2 text-center" title="Lost">L</th>
              <th className="px-2 py-2 text-center font-bold text-slate-900" title="Points">Pts</th>
              <th className="px-4 py-2 text-right" title="Net Run Rate">NRR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {standings.map((row, idx) => {
              const team = getTeam(row.teamId);
              return (
                <tr key={row.teamId} className={cn("hover:bg-slate-50", idx < 4 ? "bg-white" : "bg-slate-50/50 text-slate-500")}>
                  <td className="px-4 py-3 font-sans font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-3">{idx + 1}</span>
                    <span className="text-lg">{team?.flag}</span>
                    <span className="hidden sm:inline">{team?.short}</span>
                  </td>
                  <td className="px-2 py-3 text-center">{row.played}</td>
                  <td className="px-2 py-3 text-center text-green-600">{row.won}</td>
                  <td className="px-2 py-3 text-center text-red-600">{row.lost}</td>
                  <td className="px-2 py-3 text-center font-bold text-slate-900 bg-slate-50">{row.points}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {row.nrr > 0 ? "+" : ""}{row.nrr.toFixed(3)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
