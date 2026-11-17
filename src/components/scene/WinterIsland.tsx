import { Html } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import {
  CabinPlacement,
  GameStage,
  GrowthStageIndex,
  ISLAND_CABINS,
  ISLAND_SNOWMEN,
  ISLAND_SURFACE_RADIUS,
  ISLAND_WALK_RADIUS,
  ISLAND_WAYPOINTS,
  PALETTE,
  PINE_TREES,
} from '../../types/game';
import { DreamPlant, FlightEffect } from './DreamPlant';

interface WinterIslandProps {
  hasStarted: boolean;
  modalOpen: boolean;
  finaleActive?: boolean;
  gameStage: GameStage;
  growthStage: GrowthStageIndex;
  growthProgress: number;
  seedColor: string;
  seedFlight: FlightEffect | null;
  onSeedFlightComplete: () => void;
  lightBurst: FlightEffect | null;
  onLightBurstComplete: () => void;
  rainShowerKey: number;
  rainIsCorrect: boolean;
  onSelectGroundPoint: (x: number, z: number) => void;
  targetMarker: { x: number; z: number; visible: boolean };
  enableShadows: boolean;
}

function PineTree({
  x,
  z,
  rotationY,
  scale,
  enableShadows,
}: {
  x: number;
  z: number;
  rotationY: number;
  scale: number;
  enableShadows: boolean;
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh position={[0, 0.45, 0]} castShadow={enableShadows} receiveShadow={enableShadows}>
        <cylinderGeometry args={[0.18, 0.25, 0.9, 7]} />
        <meshStandardMaterial color={PALETTE.soil} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow={enableShadows} receiveShadow={enableShadows}>
        <coneGeometry args={[1.1, 1.35, 7]} />
        <meshStandardMaterial color={PALETTE.green} roughness={0.82} flatShading />
      </mesh>
      <mesh position={[0, 2.05, 0]} castShadow={enableShadows} receiveShadow={enableShadows}>
        <coneGeometry args={[0.86, 1.15, 7]} />
        <meshStandardMaterial color={PALETTE.green} roughness={0.82} flatShading />
      </mesh>
      <mesh position={[0, 2.7, 0]} castShadow={enableShadows} receiveShadow={enableShadows}>
        <coneGeometry args={[0.6, 0.95, 7]} />
        <meshStandardMaterial color="#378B6E" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 3.0, 0]} receiveShadow={enableShadows}>
        <coneGeometry args={[0.36, 0.5, 7]} />
        <meshStandardMaterial color={PALETTE.snow} roughness={0.65} flatShading />
      </mesh>
    </group>
  );
}

function Snowman({
  x,
  z,
  rotationY,
  scale,
  showLabel,
  hasStarted,
  enableShadows,
}: {
  x: number;
  z: number;
  rotationY: number;
  scale: number;
  showLabel?: boolean;
  hasStarted: boolean;
  enableShadows: boolean;
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh position={[0, 0.52, 0]} castShadow={enableShadows} receiveShadow={enableShadows}>
        <sphereGeometry args={[0.58, 12, 10]} />
        <meshStandardMaterial color={PALETTE.snow} roughness={0.68} />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow={enableShadows} receiveShadow={enableShadows}>
        <sphereGeometry args={[0.4, 12, 10]} />
        <meshStandardMaterial color={PALETTE.snow} roughness={0.68} />
      </mesh>
      <mesh position={[0, 1.3, 0.44]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.065, 0.28, 7]} />
        <meshStandardMaterial color={PALETTE.orange} roughness={0.55} />
      </mesh>
      <mesh position={[-0.13, 1.39, 0.35]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color={PALETTE.navy} roughness={0.4} />
      </mesh>
      <mesh position={[0.13, 1.39, 0.35]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color={PALETTE.navy} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.98, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.08, 8, 14]} />
        <meshStandardMaterial color={PALETTE.orange} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.68, 0.54]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color={PALETTE.navy} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.48, 0.57]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color={PALETTE.navy} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.66, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.06, 12]} />
        <meshStandardMaterial color={PALETTE.navy} roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.84, 0]}>
        <cylinderGeometry args={[0.23, 0.25, 0.34, 12]} />
        <meshStandardMaterial color={PALETTE.navy} roughness={0.75} />
      </mesh>
      <mesh position={[-0.56, 0.72, 0]} rotation={[0, 0, 0.6]}>
        <cylinderGeometry args={[0.03, 0.04, 0.55, 6]} />
        <meshStandardMaterial color={PALETTE.soil} roughness={0.9} />
      </mesh>
      <mesh position={[0.56, 0.72, 0]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.03, 0.04, 0.55, 6]} />
        <meshStandardMaterial color={PALETTE.soil} roughness={0.9} />
      </mesh>

      {showLabel && hasStarted && (
        <Html position={[0, 2.45, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="px-3 py-1 rounded-xl bg-[#F6F8FC]/95 border-2 border-[#C8DCF0] text-[#1E2A4A] font-extrabold text-sm whitespace-nowrap shadow-md">
            눈사람 친구
          </div>
        </Html>
      )}
    </group>
  );
}

function CozyCabin({
  cabin,
  showLabel,
  hasStarted,
  enableShadows,
}: {
  cabin: CabinPlacement;
  showLabel?: boolean;
  hasStarted: boolean;
  enableShadows: boolean;
}) {
  return (
    <group
      position={[cabin.x, 0, cabin.z]}
      rotation={[0, cabin.rotationY, 0]}
      scale={cabin.scale}
    >
      <mesh position={[0, 0.14, 0]} receiveShadow={enableShadows}>
        <boxGeometry args={[2.35, 0.28, 2.1]} />
        <meshStandardMaterial color="#8AA0BA" roughness={0.88} flatShading />
      </mesh>
      <mesh
        position={[0, 1.0, 0]}
        castShadow={enableShadows}
        receiveShadow={enableShadows}
      >
        <boxGeometry args={[2.1, 1.45, 1.85]} />
        <meshStandardMaterial color={cabin.wallColor} roughness={0.82} />
      </mesh>
      <mesh
        position={[0, 2.28, 0]}
        rotation={[0, Math.PI / 4, 0]}
        castShadow={enableShadows}
      >
        <coneGeometry args={[1.95, 1.25, 4]} />
        <meshStandardMaterial color={cabin.roofTrimColor} roughness={0.75} flatShading />
      </mesh>
      <mesh position={[0, 2.38, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.82, 1.12, 4]} />
        <meshStandardMaterial color={PALETTE.snow} roughness={0.62} flatShading />
      </mesh>
      <mesh position={[0.62, 2.45, -0.35]} castShadow={enableShadows}>
        <boxGeometry args={[0.36, 0.85, 0.36]} />
        <meshStandardMaterial color="#7C5642" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.72, 0.94]}>
        <boxGeometry args={[0.56, 0.95, 0.08]} />
        <meshStandardMaterial color={PALETTE.soil} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.1, 1.12]}>
        <boxGeometry args={[0.9, 0.18, 0.36]} />
        <meshStandardMaterial color="#9DB2CA" roughness={0.85} />
      </mesh>
      <mesh position={[-0.64, 1.08, 0.94]}>
        <boxGeometry args={[0.38, 0.38, 0.07]} />
        <meshStandardMaterial
          color={PALETTE.orange}
          emissive={PALETTE.orange}
          emissiveIntensity={0.45}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0.64, 1.08, 0.94]}>
        <boxGeometry args={[0.38, 0.38, 0.07]} />
        <meshStandardMaterial
          color={PALETTE.orange}
          emissive={PALETTE.orange}
          emissiveIntensity={0.45}
          roughness={0.4}
        />
      </mesh>

      {showLabel && hasStarted && (
        <Html position={[0, 3.35, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="px-3 py-1 rounded-xl bg-[#F6F8FC]/95 border-2 border-[#C8DCF0] text-[#1E2A4A] font-extrabold text-sm whitespace-nowrap shadow-md">
            따뜻한 오두막
          </div>
        </Html>
      )}
    </group>
  );
}

export function WinterIsland({
  hasStarted,
  modalOpen,
  finaleActive = false,
  gameStage,
  growthStage,
  growthProgress,
  seedColor,
  seedFlight,
  onSeedFlightComplete,
  lightBurst,
  onLightBurstComplete,
  rainShowerKey,
  rainIsCorrect,
  onSelectGroundPoint,
  targetMarker,
  enableShadows,
}: WinterIslandProps) {
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const oceanRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current && targetMarker.visible) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 1.4;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4.5) * 0.1;
      ringRef.current.scale.set(pulse, pulse, 1);
    }
    if (oceanRef.current) {
      oceanRef.current.position.y =
        -1.26 + Math.sin(state.clock.elapsedTime * 0.9) * 0.04;
    }
  });

  const handleGroundPointerDown = (e: ThreeEvent<PointerEvent>) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleGroundPointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!hasStarted || modalOpen || !pointerDownPos.current) return;
    const dx = e.clientX - pointerDownPos.current.x;
    const dy = e.clientY - pointerDownPos.current.y;
    pointerDownPos.current = null;

    if (dx * dx + dy * dy > 64) return;

    e.stopPropagation();
    const { x, z } = e.point;
    const dist = Math.hypot(x, z);
    if (dist <= ISLAND_WALK_RADIUS) {
      onSelectGroundPoint(x, z);
    } else if (dist > 0.001) {
      const scale = ISLAND_WALK_RADIUS / dist;
      onSelectGroundPoint(x * scale, z * scale);
    }
  };

  return (
    <group>
      {/* Endless icy sea */}
      <mesh
        ref={oceanRef}
        position={[0, -1.26, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow={false}
      >
        <circleGeometry args={[145, 48]} />
        <meshStandardMaterial color={PALETTE.seaDeep} roughness={0.42} metalness={0.08} />
      </mesh>

      {/* Soft sea foam ring around the island */}
      <mesh position={[0, -1.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[16.2, 18.6, 36]} />
        <meshStandardMaterial color="#CFE4F7" transparent opacity={0.55} roughness={0.7} />
      </mesh>

      {/* Island rocky/icy underwater cliff base */}
      <mesh position={[0, -1.15, 0]} receiveShadow={enableShadows}>
        <cylinderGeometry args={[17.1, 13.5, 2.2, 24]} />
        <meshStandardMaterial color="#839BB8" roughness={0.88} flatShading />
      </mesh>

      {/* Snow crust rim */}
      <mesh position={[0, -0.25, 0]} receiveShadow={enableShadows}>
        <cylinderGeometry args={[ISLAND_SURFACE_RADIUS, 17.3, 0.5, 32]} />
        <meshStandardMaterial color="#E6EEF9" roughness={0.76} flatShading />
      </mesh>

      {/* Walkable snow plateau */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow={enableShadows}
        onPointerDown={handleGroundPointerDown}
        onPointerUp={handleGroundPointerUp}
      >
        <circleGeometry args={[ISLAND_SURFACE_RADIUS, 36]} />
        <meshStandardMaterial color={PALETTE.snow} roughness={0.78} />
      </mesh>

      {/* Subtle waypoint guide circles on snow */}
      {ISLAND_WAYPOINTS.map((wp) => (
        <mesh
          key={wp.id}
          position={[wp.x, 0.014, wp.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.48, 0.62, 20]} />
          <meshBasicMaterial color="#B7CFE8" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Click/Tap Target Indicator Ring */}
      {targetMarker.visible && (
        <mesh
          ref={ringRef}
          position={[targetMarker.x, 0.025, targetMarker.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.38, 0.56, 18]} />
          <meshBasicMaterial color={PALETTE.orange} />
        </mesh>
      )}

      {/* Center Dream Pot & Growing Plant */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.18, 0]} castShadow={enableShadows} receiveShadow={enableShadows}>
          <cylinderGeometry args={[2.35, 2.55, 0.36, 20]} />
          <meshStandardMaterial color={PALETTE.green} roughness={0.78} flatShading />
        </mesh>
        <mesh position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow={enableShadows}>
          <torusGeometry args={[2.22, 0.19, 8, 24]} />
          <meshStandardMaterial color={PALETTE.orange} roughness={0.68} flatShading />
        </mesh>
        <mesh position={[0, 0.38, 0]} receiveShadow={enableShadows}>
          <cylinderGeometry args={[2.08, 2.08, 0.16, 20]} />
          <meshStandardMaterial color={PALETTE.soil} roughness={0.95} flatShading />
        </mesh>
        <mesh position={[0, 0.44, 0]} scale={[1, 0.32, 1]} receiveShadow={enableShadows}>
          <sphereGeometry args={[0.95, 14, 10]} />
          <meshStandardMaterial color="#5B3F2B" roughness={0.95} flatShading />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((idx) => {
          const angle = (idx / 6) * Math.PI * 2 + 0.3;
          return (
            <mesh
              key={idx}
              position={[Math.cos(angle) * 2.55, 0.12, Math.sin(angle) * 2.55]}
              scale={[1.15, 0.65, 1]}
            >
              <dodecahedronGeometry args={[0.26, 0]} />
              <meshStandardMaterial color="#9BB0C7" roughness={0.85} flatShading />
            </mesh>
          );
        })}

        <DreamPlant
          growthStage={growthStage}
          growthProgress={growthProgress}
          seedColor={seedColor}
          seedFlight={seedFlight}
          onSeedFlightComplete={onSeedFlightComplete}
          lightBurst={lightBurst}
          onLightBurstComplete={onLightBurstComplete}
          rainShowerKey={rainShowerKey}
          rainIsCorrect={rainIsCorrect}
          finaleActive={finaleActive}
        />

        {hasStarted && !modalOpen && !finaleActive && (
          <Html
            position={[0, growthStage >= 3 ? 3.25 : 1.7, 0]}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div className="px-3.5 py-1.5 rounded-xl bg-[#1E2A4A] border-2 border-[#F4A259] text-[#F6F8FC] font-extrabold text-sm sm:text-base whitespace-nowrap shadow-lg">
              꿈 화분
            </div>
          </Html>
        )}
      </group>

      {/* Low-poly Pine Trees */}
      {PINE_TREES.map((tree) => (
        <PineTree
          key={tree.id}
          x={tree.x}
          z={tree.z}
          rotationY={tree.rotationY}
          scale={tree.scale}
          enableShadows={enableShadows}
        />
      ))}

      {/* Cute Snowmen */}
      {ISLAND_SNOWMEN.map((snowman, index) => (
        <Snowman
          key={snowman.id}
          x={snowman.x}
          z={snowman.z}
          rotationY={snowman.rotationY}
          scale={snowman.scale}
          showLabel={index === 0 && gameStage !== 2 && !modalOpen && !finaleActive}
          hasStarted={hasStarted}
          enableShadows={enableShadows}
        />
      ))}

      {/* Cozy Small Cabins */}
      {ISLAND_CABINS.map((cabin, index) => (
        <CozyCabin
          key={cabin.id}
          cabin={cabin}
          showLabel={index === 1 && !modalOpen && !finaleActive}
          hasStarted={hasStarted}
          enableShadows={enableShadows}
        />
      ))}
    </group>
  );
}
