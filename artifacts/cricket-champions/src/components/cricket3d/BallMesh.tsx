import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BallEvent } from "@/lib/types";
import type { Phase, ShotOutcome } from "./cricket3dUtils";
import { BOWLER_RELEASE_Z, deliveryPosition, shotPosition } from "./cricket3dUtils";

interface BallMeshProps {
  ball: BallEvent;
  phase: Phase;
  phaseStartRef: React.MutableRefObject<number>;
  phaseDuration: number;
  shotOutcome: ShotOutcome;
}

export default function BallMesh({ ball, phase, phaseStartRef, phaseDuration, shotOutcome }: BallMeshProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const tmp = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!mesh.current) return;
    const t = THREE.MathUtils.clamp((performance.now() - phaseStartRef.current) / phaseDuration, 0, 1);

    if (phase === "runup" || phase === "delivery") {
      mesh.current.position.set(0.2, 1.9, BOWLER_RELEASE_Z + 0.7);
      mesh.current.visible = phase === "delivery" && t > 0.6;
    } else if (phase === "flight") {
      mesh.current.visible = true;
      deliveryPosition(t, ball.bowlingStyle, tmp.current);
      mesh.current.position.copy(tmp.current);
    } else if (phase === "shot") {
      mesh.current.visible = !ball.isWicket || t < 0.4;
      shotPosition(t, shotOutcome, tmp.current);
      mesh.current.position.copy(tmp.current);
    } else {
      mesh.current.visible = false;
    }
  });

  return (
    <mesh ref={mesh} castShadow>
      <sphereGeometry args={[0.12, 12, 12]} />
      <meshStandardMaterial color="#c81e2c" />
    </mesh>
  );
}
