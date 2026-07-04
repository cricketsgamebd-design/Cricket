import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Phase } from "./cricket3dUtils";
import { BOWLER_RELEASE_Z, BATSMAN_CREASE_Z, isPaceStyle, lerp } from "./cricket3dUtils";
import type { BowlingStyle, ShotType } from "@/lib/types";

interface HumanoidProps {
  color: string;
  skinColor?: string;
}

function Humanoid({ color, skinColor = "#c48a5a" }: HumanoidProps) {
  return (
    <group>
      <mesh position={[0, 1.15, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.55, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.68, 0]} castShadow>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.08, 0.7, 8]} />
        <meshStandardMaterial color="#1e2a3a" />
      </mesh>
    </group>
  );
}

interface BowlerProps {
  style: BowlingStyle;
  phase: Phase;
  phaseStartRef: React.MutableRefObject<number>;
  phaseDuration: number;
  teamColor: string;
}

export function Bowler({ style, phase, phaseStartRef, phaseDuration, teamColor }: BowlerProps) {
  const group = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Mesh>(null);
  const pace = isPaceStyle(style);
  const runupStartZ = BOWLER_RELEASE_Z - (pace ? 9 : 3);

  useFrame(() => {
    if (!group.current) return;
    const t = THREE.MathUtils.clamp((performance.now() - phaseStartRef.current) / phaseDuration, 0, 1);

    if (phase === "runup") {
      const z = lerp(runupStartZ, BOWLER_RELEASE_Z + 0.6, t);
      group.current.position.set(0.4, 0, z);
      group.current.rotation.y = Math.sin(t * Math.PI * (pace ? 10 : 4)) * 0.15;
    } else if (phase === "delivery") {
      group.current.position.set(0.4, 0, BOWLER_RELEASE_Z + 0.6);
      group.current.rotation.y = 0;
      if (arm.current) {
        arm.current.rotation.x = lerp(-2.4, 0.6, t);
      }
    } else {
      group.current.position.set(0.4, 0, BOWLER_RELEASE_Z + 0.6);
      if (arm.current) arm.current.rotation.x = 0.6;
    }
  });

  return (
    <group ref={group} position={[0.4, 0, runupStartZ]}>
      <Humanoid color={teamColor} />
      <mesh ref={arm} position={[0.22, 1.35, 0.1]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.55, 8]} />
        <meshStandardMaterial color={teamColor} />
      </mesh>
    </group>
  );
}

interface BatsmanProps {
  phase: Phase;
  phaseStartRef: React.MutableRefObject<number>;
  phaseDuration: number;
  shotType: ShotType;
  teamColor: string;
}

export function Batsman({ phase, phaseStartRef, phaseDuration, shotType, teamColor }: BatsmanProps) {
  const bat = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!bat.current || !group.current) return;
    const t = THREE.MathUtils.clamp((performance.now() - phaseStartRef.current) / phaseDuration, 0, 1);

    if (phase === "flight" && t > 0.65) {
      const swingT = (t - 0.65) / 0.35;
      bat.current.rotation.z = lerp(0.9, shotType === "defend" || shotType === "leave" ? 0.3 : -0.6, swingT);
      if (shotType === "pull" || shotType === "cut") {
        group.current.rotation.y = lerp(0, shotType === "pull" ? -0.5 : 0.5, swingT);
      }
    } else if (phase === "shot" || phase === "result") {
      bat.current.rotation.z = shotType === "defend" || shotType === "leave" ? 0.3 : -0.6;
    } else {
      bat.current.rotation.z = 0.9;
      group.current.rotation.y = 0;
    }
  });

  return (
    <group ref={group} position={[0.3, 0, BATSMAN_CREASE_Z + 0.4]}>
      <Humanoid color={teamColor} skinColor="#dba36a" />
      <mesh ref={bat} position={[0.24, 0.55, 0]} castShadow>
        <boxGeometry args={[0.09, 0.75, 0.04]} />
        <meshStandardMaterial color="#e8c07d" />
      </mesh>
    </group>
  );
}

export function WicketKeeper({ teamColor }: { teamColor: string }) {
  return (
    <group position={[0.3, 0, BATSMAN_CREASE_Z + 2.2]}>
      <Humanoid color={teamColor} />
    </group>
  );
}
