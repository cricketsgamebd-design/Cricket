import * as THREE from "three";
import type { BallEvent, BowlingStyle } from "@/lib/types";

export const PITCH_HALF_LENGTH = 10;
export const BOWLER_RELEASE_Z = -PITCH_HALF_LENGTH;
export const BATSMAN_CREASE_Z = PITCH_HALF_LENGTH - 1.2;
export const FIELD_RADIUS = 68;

export type Phase = "runup" | "delivery" | "flight" | "shot" | "result";

export interface PhaseStep {
  name: Phase;
  duration: number; // ms
}

const PACE_STYLES: BowlingStyle[] = ["fast", "fast-medium", "medium-fast", "medium"];

export function isPaceStyle(style: BowlingStyle): boolean {
  return PACE_STYLES.includes(style);
}

export function runupDuration(style: BowlingStyle): number {
  switch (style) {
    case "fast":
      return 1500;
    case "fast-medium":
      return 1250;
    case "medium-fast":
      return 1000;
    case "medium":
      return 800;
    default:
      return 450; // spin styles: short walk-up
  }
}

export function flightDuration(style: BowlingStyle, speedKph: number): number {
  if (isPaceStyle(style)) {
    // faster ball = shorter time in the air
    return Math.round(650 - speedKph * 2.1);
  }
  return Math.round(900 - speedKph * 2.5);
}

export function shotDuration(ball: BallEvent): number {
  if (ball.isWicket) return 550;
  if (ball.isSix) return 1100;
  if (ball.isFour) return 800;
  if (ball.runs === 0) return 350;
  return 550 + ball.runs * 60;
}

export function resultPauseDuration(ball: BallEvent): number {
  if (ball.isWicket) return 1500;
  if (ball.isSix || ball.isFour) return 1000;
  return 550;
}

export function buildPhases(ball: BallEvent): PhaseStep[] {
  return [
    { name: "runup", duration: runupDuration(ball.bowlingStyle) },
    { name: "delivery", duration: 180 },
    { name: "flight", duration: flightDuration(ball.bowlingStyle, ball.speedKph) },
    { name: "shot", duration: shotDuration(ball) },
    { name: "result", duration: resultPauseDuration(ball) },
  ];
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export function easeInQuad(t: number): number {
  return t * t;
}

/**
 * Ball trajectory from bowler's release point to the bat, with a bounce
 * roughly two-thirds down the pitch. Spin bowlers get more dip/drift.
 */
export function deliveryPosition(t: number, style: BowlingStyle, out: THREE.Vector3): THREE.Vector3 {
  const bounceZ = isPaceStyle(style) ? 3.5 : 1.5;
  const releaseY = 2.1;
  const bounceY = 0.08;
  const contactY = 0.75;
  const drift = isPaceStyle(style) ? 0.15 : 0.55;

  if (t < 0.62) {
    const local = t / 0.62;
    const x = lerp(0, drift, local);
    const y = lerp(releaseY, bounceY, easeInQuad(local));
    const z = lerp(BOWLER_RELEASE_Z, bounceZ, local);
    out.set(x, y, z);
  } else {
    const local = (t - 0.62) / 0.38;
    const x = lerp(drift, drift * (isPaceStyle(style) ? 1 : 1.8), local);
    const y = lerp(bounceY, contactY, easeOutQuad(local));
    const z = lerp(bounceZ, BATSMAN_CREASE_Z, local);
    out.set(x, y, z);
  }
  return out;
}

export interface ShotOutcome {
  angleDeg: number; // 0 = straight down the ground toward bowler's end reversed, measured from batsman
  distance: number;
  loft: number; // max height multiplier
}

export function shotOutcomeFor(ball: BallEvent, seed: number): ShotOutcome {
  const rnd = (n: number) => {
    const x = Math.sin(seed * 999 + n * 37.13) * 10000;
    return x - Math.floor(x);
  };

  if (ball.isWicket) {
    return { angleDeg: lerp(-15, 15, rnd(1)), distance: 1.5, loft: 0 };
  }

  const side = rnd(2) < 0.5 ? -1 : 1;
  if (ball.runs === 0) {
    return { angleDeg: side * lerp(10, 45, rnd(3)), distance: lerp(3, 7, rnd(4)), loft: 0.15 };
  }
  if (ball.isSix) {
    return { angleDeg: side * lerp(20, 80, rnd(5)), distance: FIELD_RADIUS + 6, loft: 1 };
  }
  if (ball.isFour) {
    return { angleDeg: side * lerp(15, 90, rnd(6)), distance: FIELD_RADIUS - 2, loft: 0.22 };
  }
  return { angleDeg: side * lerp(20, 110, rnd(7)), distance: lerp(10, 28, rnd(8)) * (ball.runs / 2 + 0.5), loft: 0.3 };
}

export function shotPosition(t: number, outcome: ShotOutcome, out: THREE.Vector3): THREE.Vector3 {
  const angleRad = (outcome.angleDeg * Math.PI) / 180;
  const eased = easeOutQuad(t);
  const dist = outcome.distance * eased;
  const x = Math.sin(angleRad) * dist;
  const z = BATSMAN_CREASE_Z + Math.cos(angleRad) * dist * -1;
  const arcHeight = outcome.loft * Math.sin(Math.PI * t) * 14;
  const y = 0.75 + arcHeight;
  out.set(x, Math.max(y, 0.12), z);
  return out;
}

export function fielderIntercept(outcome: ShotOutcome): THREE.Vector3 {
  const angleRad = (outcome.angleDeg * Math.PI) / 180;
  const dist = Math.min(outcome.distance, FIELD_RADIUS - 4);
  const x = Math.sin(angleRad) * dist;
  const z = BATSMAN_CREASE_Z + Math.cos(angleRad) * dist * -1;
  return new THREE.Vector3(x, 0, z);
}

export function styleLabel(style: BowlingStyle): string {
  switch (style) {
    case "fast":
      return "Fast";
    case "fast-medium":
      return "Fast Medium";
    case "medium-fast":
      return "Medium Fast";
    case "medium":
      return "Medium";
    case "off-spin":
      return "Off Spin";
    case "leg-spin":
      return "Leg Spin";
    case "left-arm-orthodox":
      return "Left-arm Orthodox";
    case "left-arm-wrist-spin":
      return "Left-arm Wrist Spin";
  }
}
