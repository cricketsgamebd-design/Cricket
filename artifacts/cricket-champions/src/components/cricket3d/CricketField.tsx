import { useMemo } from "react";
import * as THREE from "three";
import { FIELD_RADIUS } from "./cricket3dUtils";

interface CricketFieldProps {
  isNight: boolean;
}

interface CrowdSeat {
  x: number;
  z: number;
  y: number;
  rotY: number;
  color: string;
}

const CROWD_COLORS = ["#e2725b", "#4b8bbe", "#f2c14e", "#6bbf59", "#c14e9e", "#f2f2f2", "#3a3a3a"];

function useCrowdSeats(count: number): CrowdSeat[] {
  return useMemo(() => {
    const seats: CrowdSeat[] = [];
    const ringRadiusStart = FIELD_RADIUS + 6;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (i % 7) * 0.01;
      const ring = i % 4;
      const radius = ringRadiusStart + ring * 2.4;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const y = 3 + ring * 1.6;
      seats.push({
        x,
        z,
        y,
        rotY: angle + Math.PI,
        color: CROWD_COLORS[Math.floor((i * 13) % CROWD_COLORS.length)],
      });
    }
    return seats;
  }, [count]);
}

export default function CricketField({ isNight }: CricketFieldProps) {
  const seats = useCrowdSeats(260);

  const grassColor = isNight ? "#1c3d24" : "#2f7d3a";
  const pitchColor = isNight ? "#b6a06a" : "#d4c185";
  const skyColor = isNight ? "#0a0f24" : "#8fd0ff";

  return (
    <group>
      <color attach="background" args={[skyColor]} />
      {isNight ? (
        <>
          <ambientLight intensity={0.35} />
          <directionalLight position={[0, 30, 0]} intensity={0.2} />
          {[
            [FIELD_RADIUS * 0.9, FIELD_RADIUS * 0.9],
            [-FIELD_RADIUS * 0.9, FIELD_RADIUS * 0.9],
            [FIELD_RADIUS * 0.9, -FIELD_RADIUS * 0.9],
            [-FIELD_RADIUS * 0.9, -FIELD_RADIUS * 0.9],
          ].map(([x, z], i) => (
            <group key={i} position={[x, 0, z]}>
              <mesh position={[0, 15, 0]}>
                <cylinderGeometry args={[0.35, 0.5, 30, 8]} />
                <meshStandardMaterial color="#333" />
              </mesh>
              <mesh position={[0, 30, 0]}>
                <boxGeometry args={[3, 3, 0.5]} />
                <meshStandardMaterial color="#fff8dd" emissive="#fff8dd" emissiveIntensity={2} />
              </mesh>
              <pointLight position={[0, 30, 0]} intensity={80} distance={90} color="#fff8dd" />
            </group>
          ))}
        </>
      ) : (
        <>
          <ambientLight intensity={0.7} />
          <directionalLight position={[40, 60, 20]} intensity={1.4} castShadow />
        </>
      )}

      {/* Outfield */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[FIELD_RADIUS, 64]} />
        <meshStandardMaterial color={grassColor} />
      </mesh>

      {/* Boundary rope */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[FIELD_RADIUS - 0.4, FIELD_RADIUS, 64]} />
        <meshStandardMaterial color="#f4f4f4" />
      </mesh>

      {/* Pitch strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[3.2, 22]} />
        <meshStandardMaterial color={pitchColor} />
      </mesh>

      {/* Popping creases */}
      <mesh position={[0, 0.04, -9]}>
        <boxGeometry args={[3.6, 0.02, 0.08]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 0.04, 9]}>
        <boxGeometry args={[3.6, 0.02, 0.08]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Stumps */}
      <Stumps position={[0, 0, -10]} />
      <Stumps position={[0, 0, 10]} />

      {/* Stands (simple box ring) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 2.4, 0]}>
        <ringGeometry args={[FIELD_RADIUS + 4, FIELD_RADIUS + 16, 48]} />
        <meshStandardMaterial color={isNight ? "#111827" : "#94a3b8"} side={THREE.DoubleSide} />
      </mesh>

      {/* Crowd */}
      {seats.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]} rotation={[0, s.rotY, 0]}>
          <capsuleGeometry args={[0.28, 0.5, 2, 4]} />
          <meshStandardMaterial color={s.color} />
        </mesh>
      ))}
    </group>
  );
}

function Stumps({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[-0.22, 0, 0.22].map((x, i) => (
        <mesh key={i} position={[x, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.7, 8]} />
          <meshStandardMaterial color="#e8d9b0" />
        </mesh>
      ))}
      <mesh position={[-0.11, 0.72, 0]}>
        <boxGeometry args={[0.15, 0.04, 0.04]} />
        <meshStandardMaterial color="#e8d9b0" />
      </mesh>
      <mesh position={[0.11, 0.72, 0]}>
        <boxGeometry args={[0.15, 0.04, 0.04]} />
        <meshStandardMaterial color="#e8d9b0" />
      </mesh>
    </group>
  );
}
