import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { BallEvent, Innings, Team } from "@/lib/types";
import { buildPhases, shotOutcomeFor, styleLabel, type Phase, type PhaseStep } from "./cricket3dUtils";
import CricketField from "./CricketField";
import { Bowler, Batsman, WicketKeeper } from "./Players";
import BallMesh from "./BallMesh";
import CameraRig from "./CameraRig";
import { Button } from "@/components/ui/button";
import { Play as PlayIcon, Pause, SkipForward, X } from "lucide-react";

interface MatchPlayback3DProps {
  innings: Innings;
  battingTeam: Team;
  bowlingTeam: Team;
  onClose: () => void;
}

export default function MatchPlayback3D({ innings, battingTeam, bowlingTeam, onClose }: MatchPlayback3DProps) {
  const timeline = innings.timeline;
  const [ballIndex, setBallIndex] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [runningScore, setRunningScore] = useState({ runs: 0, wickets: 0 });
  const phaseStartRef = useRef(performance.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNight = useMemo(() => innings.ballsFaced % 2 === 0, [innings.battingTeamId]);

  const currentBall: BallEvent | undefined = timeline[ballIndex];
  const phases: PhaseStep[] = useMemo(() => (currentBall ? buildPhases(currentBall) : []), [currentBall]);
  const phase: Phase = phases[phaseIndex]?.name ?? "runup";
  const phaseDuration = phases[phaseIndex]?.duration ?? 500;

  const shotOutcome = useMemo(
    () => (currentBall ? shotOutcomeFor(currentBall, ballIndex + 1) : { angleDeg: 0, distance: 0, loft: 0 }),
    [currentBall, ballIndex],
  );

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const advance = useCallback(() => {
    setPhaseIndex((prevPhase) => {
      const isLastPhase = prevPhase >= phases.length - 1;
      if (!isLastPhase) return prevPhase + 1;
      return prevPhase;
    });
  }, [phases.length]);

  const goToNextBall = useCallback(() => {
    setBallIndex((prev) => Math.min(prev + 1, timeline.length - 1));
    setPhaseIndex(0);
  }, [timeline.length]);

  useEffect(() => {
    phaseStartRef.current = performance.now();
    clearTimer();
    if (!playing || !currentBall) return;

    const isLastPhase = phaseIndex >= phases.length - 1;
    timerRef.current = setTimeout(() => {
      if (isLastPhase) {
        if (ballIndex < timeline.length - 1) {
          goToNextBall();
        }
      } else {
        advance();
      }
    }, phaseDuration);

    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ballIndex, phaseIndex, playing, phaseDuration]);

  useEffect(() => {
    if (!currentBall) return;
    if (phaseIndex === phases.length - 1) {
      setRunningScore({
        runs: timeline.slice(0, ballIndex + 1).reduce((sum, b) => sum + b.runs, 0),
        wickets: timeline.slice(0, ballIndex + 1).filter((b) => b.isWicket).length,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ballIndex, phaseIndex]);

  if (!currentBall) return null;

  const teamColor1 = bowlingTeam.color || "#1e3a8a";
  const teamColor2 = battingTeam.color || "#b91c1c";
  const isDone = ballIndex >= timeline.length - 1 && phaseIndex >= phases.length - 1 && phase === "result";

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="relative flex-1">
        <Canvas shadows camera={{ fov: 55 }}>
          <CricketField isNight={isNight} />
          <CameraRig phase={phase} />
          <Bowler
            style={currentBall.bowlingStyle}
            phase={phase}
            phaseStartRef={phaseStartRef}
            phaseDuration={phaseDuration}
            teamColor={teamColor1}
          />
          <Batsman
            phase={phase}
            phaseStartRef={phaseStartRef}
            phaseDuration={phaseDuration}
            shotType={currentBall.shotType}
            teamColor={teamColor2}
          />
          <WicketKeeper teamColor={teamColor1} />
          <BallMesh
            ball={currentBall}
            phase={phase}
            phaseStartRef={phaseStartRef}
            phaseDuration={phaseDuration}
            shotOutcome={shotOutcome}
          />
        </Canvas>

        {/* HUD overlay */}
        <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-start justify-between pointer-events-none">
          <div className="bg-black/70 text-white rounded-lg px-4 py-2 font-mono">
            <div className="text-xs text-slate-300 uppercase tracking-wide">
              {battingTeam.short} batting
            </div>
            <div className="text-2xl font-black tabular-nums">
              {runningScore.runs}/{runningScore.wickets}
            </div>
            <div className="text-xs text-slate-300">
              Over {currentBall.over}.{currentBall.ball}
            </div>
          </div>
          <div className="bg-black/70 text-white rounded-lg px-4 py-2 text-right font-mono">
            <div className="text-xs text-slate-300 uppercase tracking-wide">{styleLabel(currentBall.bowlingStyle)}</div>
            <div className="text-xl font-black tabular-nums">{currentBall.speedKph} km/h</div>
          </div>
        </div>

        {(phase === "result" || phase === "shot") && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none">
            <div
              className={`px-6 py-2 rounded-full font-black text-xl sm:text-2xl uppercase tracking-wide shadow-lg ${
                currentBall.isWicket
                  ? "bg-red-600 text-white"
                  : currentBall.isSix
                    ? "bg-purple-600 text-white"
                    : currentBall.isFour
                      ? "bg-blue-600 text-white"
                      : "bg-white/90 text-slate-900"
              }`}
            >
              {currentBall.label}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 pointer-events-auto"
          aria-label="Close 3D replay"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-slate-900 border-t border-slate-800 p-3 flex items-center justify-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => setPlaying((p) => !p)}>
          {playing ? <Pause className="w-4 h-4 mr-2" /> : <PlayIcon className="w-4 h-4 mr-2" />}
          {playing ? "Pause" : "Play"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
          onClick={goToNextBall}
          disabled={ballIndex >= timeline.length - 1}
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Skip Ball
        </Button>
        <span className="text-slate-400 text-xs font-mono ml-2">
          Ball {ballIndex + 1} / {timeline.length}
        </span>
        {isDone && (
          <Button size="sm" onClick={onClose} className="font-bold ml-2">
            Done
          </Button>
        )}
      </div>
    </div>
  );
}
