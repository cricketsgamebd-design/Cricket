import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Phase } from "./cricket3dUtils";
import { BOWLER_RELEASE_Z, BATSMAN_CREASE_Z } from "./cricket3dUtils";

interface CameraRigProps {
  phase: Phase;
}

const BEHIND_BOWLER = new THREE.Vector3(0, 3.2, BOWLER_RELEASE_Z - 6);
const BEHIND_BOWLER_LOOK = new THREE.Vector3(0, 1, BATSMAN_CREASE_Z);
const SIDE_ON = new THREE.Vector3(14, 4, 2);
const SIDE_ON_LOOK = new THREE.Vector3(0, 1, BATSMAN_CREASE_Z - 1);
const WIDE = new THREE.Vector3(-10, 9, BATSMAN_CREASE_Z + 12);
const WIDE_LOOK = new THREE.Vector3(0, 1, 0);

export default function CameraRig({ phase }: CameraRigProps) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3().copy(BEHIND_BOWLER));
  const targetLook = useRef(new THREE.Vector3().copy(BEHIND_BOWLER_LOOK));
  const currentLook = useRef(new THREE.Vector3().copy(BEHIND_BOWLER_LOOK));

  useFrame(() => {
    if (phase === "runup" || phase === "delivery" || phase === "flight") {
      targetPos.current.copy(BEHIND_BOWLER);
      targetLook.current.copy(BEHIND_BOWLER_LOOK);
    } else if (phase === "shot") {
      targetPos.current.copy(SIDE_ON);
      targetLook.current.copy(SIDE_ON_LOOK);
    } else {
      targetPos.current.copy(WIDE);
      targetLook.current.copy(WIDE_LOOK);
    }

    camera.position.lerp(targetPos.current, 0.06);
    currentLook.current.lerp(targetLook.current, 0.08);
    camera.lookAt(currentLook.current);
  });

  return null;
}
