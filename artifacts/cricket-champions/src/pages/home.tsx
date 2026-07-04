import { useState } from "react";
import { useLocation } from "wouter";
import { useTournament } from "@/hooks/useTournament";
import { TOURNAMENT_LIST } from "@/lib/tournaments";
import { getTeam } from "@/lib/teams";
import { OVER_OPTIONS, OverOption } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, PlayCircle, Settings, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [, setLocation] = useLocation();
  const { state, startTournament } = useTournament();
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [selectedOvers, setSelectedOvers] = useState<OverOption>(20);

  const handleStart = () => {
    if (!selectedTournament) return;
    startTournament(selectedTournament, selectedOvers);
    setLocation("/play");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
            <Trophy className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 uppercase">
            CRICKET CHAMPIONS
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Experience the thrill of tournament cricket. Choose your competition, set the rules, and simulate your way to glory.
          </p>
        </div>

        {state && (
          <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative shadow-xl">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 text-primary-foreground/10">
              <Trophy className="w-64 h-64" />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl flex items-center gap-2">
                <PlayCircle className="w-6 h-6" /> Tournament in Progress
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                You have an active {state.overs}-over tournament underway.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-lg font-medium">{state.stageLabel}</p>
            </CardContent>
            <CardFooter className="relative z-10 flex gap-4">
              <Button size="lg" variant="secondary" onClick={() => setLocation("/play")} className="font-bold">
                Resume Tournament
              </Button>
            </CardFooter>
          </Card>
        )}

        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Select Tournament
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOURNAMENT_LIST.map((t) => (
              <Card 
                key={t.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
                  selectedTournament === t.id 
                    ? "border-primary ring-2 ring-primary ring-offset-2 scale-[1.02]" 
                    : "border-transparent hover:border-primary/50"
                )}
                onClick={() => setSelectedTournament(t.id)}
              >
                <CardHeader>
                  <div className="text-4xl mb-2">{t.emoji}</div>
                  <CardTitle className="text-xl">{t.name}</CardTitle>
                  <CardDescription className="font-medium text-slate-700">{t.shortName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 line-clamp-3">{t.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1">
                    {t.teamIds.slice(0, 6).map(id => {
                      const team = getTeam(id);
                      return (
                        <span key={id} className="inline-flex w-7 h-7 rounded-full bg-slate-100 items-center justify-center text-sm" title={team?.name ?? id}>
                          {team?.flag ?? "•"}
                        </span>
                      );
                    })}
                    {t.teamIds.length > 6 && (
                      <span className="text-xs text-slate-500 font-medium ml-1 self-center">+{t.teamIds.length - 6}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedTournament && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary" />
                Match Format
              </h3>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {OVER_OPTIONS.map(overs => (
                  <Button
                    key={overs}
                    variant={selectedOvers === overs ? "default" : "outline"}
                    className={cn("h-16 text-lg font-bold", selectedOvers === overs && "ring-2 ring-offset-2 ring-primary")}
                    onClick={() => setSelectedOvers(overs)}
                  >
                    {overs} <span className="text-xs font-normal ml-1 opacity-80">ov</span>
                  </Button>
                ))}
              </div>

              <div className="pt-6 flex justify-end border-t border-slate-100">
                <Button size="lg" className="h-14 px-8 text-lg font-bold" onClick={handleStart}>
                  Start Tournament
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
