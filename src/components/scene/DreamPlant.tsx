import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { GrowthStageIndex, PALETTE } from '../../types/game';

export interface FlightEffect {
  id: number;
  startX: number;
  startY: number;
  startZ: number;
  color: string;
}

interface DreamPlantProps {
  growthStage: GrowthStageIndex;
  growthProgress: number;
  seedColor: string;
  seedFlight: FlightEffect | null;
  onSeedFlightComplete: () => void;
  lightBurst: FlightEffect | null;
  onLightBurstComplete: () => void;
  rainShowerKey: number;
  rainIsCorrect: boolean;
  finaleActive?: boolean;
}

const BURST_COUNT = 12;
const DROP_COUNT = 14;
const POLLEN_COUNT = 34;

export function DreamPlant({
  growthStage,
  growthProgress,
  seedColor,
  seedFlight,
  onSeedFlightComplete,
  lightBurst,
  onLightBurstComplete,
  rainShowerKey,
  rainIsCorrect,
  finaleActive = false,
}: DreamPlantProps) {
  const plantGroupRef = useRef<THREE.Group>(null);
  const bloomGroupRef = useRef<THREE.Group>(null);
  const pollenGroupRef = useRef<THREE.Group>(null);

  const currentScaleRef = useRef(0.6);
  const pulseBoostRef = useRef(0);
  const bloomScaleRef = useRef(0.05);
  const prevProgressRef = useRef(growthProgress);

  const seedMeshRef = useRef<THREE.Group>(null);
  const seedProgressRef = useRef(0);
  const activeSeedIdRef = useRef<number | null>(null);

  const burstGroupRef = useRef<THREE.Group>(null);
  const burstProgressRef = useRef(0);
  const activeBurstIdRef = useRef<number | null>(null);

  const cloudGroupRef = useRef<THREE.Group>(null);
  const rainTimerRef = useRef(0);
  const lastRainKeyRef = useRef(0);

  const burstOffsets = useMemo(
    () =>
      Array.from({ length: BURST_COUNT }, (_, i) => ({
        angle: (i / BURST_COUNT) * Math.PI * 2,
        spread: 0.45 + (i % 3) * 0.25,
        delay: (i % 4) * 0.06,
      })),
    [],
  );

  const dropOffsets = useMemo(
    () =>
      Array.from({ length: DROP_COUNT }, (_, i) => ({
        x: ((i % 5) - 2) * 0.34,
        z: (Math.floor(i / 5) - 1) * 0.34,
        phase: (i / DROP_COUNT) * 1.0,
      })),
    [],
  );

  const pollenSeeds = useMemo(
    () =>
      Array.from({ length: POLLEN_COUNT }, (_, i) => ({
        angle: (i / POLLEN_COUNT) * Math.PI * 2,
        radius: 1.35 + (i % 5) * 0.55,
        speed: 0.5 + (i % 4) * 0.22,
        baseY: 1.4 + (i % 6) * 0.55,
        phase: i * 0.7,
      })),
    [],
  );

  useEffect(() => {
    if (growthProgress > prevProgressRef.current) {
      pulseBoostRef.current = 0.25;
    }
    prevProgressRef.current = growthProgress;
  }, [growthProgress]);

  useEffect(() => {
    if (growthStage === 4) {
      bloomScaleRef.current = 0.05;
    }
  }, [growthStage]);

  useEffect(() => {
    if (seedFlight && seedFlight.id !== activeSeedIdRef.current) {
      activeSeedIdRef.current = seedFlight.id;
      seedProgressRef.current = 0;
    }
  }, [seedFlight]);

  useEffect(() => {
    if (lightBurst && lightBurst.id !== activeBurstIdRef.current) {
      activeBurstIdRef.current = lightBurst.id;
      burstProgressRef.current = 0;
    }
  }, [lightBurst]);

  useEffect(() => {
    if (rainShowerKey > lastRainKeyRef.current) {
      lastRainKeyRef.current = rainShowerKey;
      rainTimerRef.current = 2.6;
    }
  }, [rainShowerKey]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const elapsed = state.clock.elapsedTime;

    if (plantGroupRef.current) {
      const targetScale = 0.72 + (growthProgress / 4) * 0.95;
      pulseBoostRef.current = THREE.MathUtils.damp(pulseBoostRef.current, 0, 5, dt);
      currentScaleRef.current = THREE.MathUtils.damp(
        currentScaleRef.current,
        targetScale + pulseBoostRef.current,
        5.5,
        dt,
      );
      const s = currentScaleRef.current;
      plantGroupRef.current.scale.set(s, s, s);
      plantGroupRef.current.rotation.y = Math.sin(elapsed * 0.85) * 0.08;
    }

    // Simultaneous flower bloom pop in Stage 4
    if (growthStage === 4 && bloomGroupRef.current) {
      bloomScaleRef.current = THREE.MathUtils.damp(
        bloomScaleRef.current,
        1.0,
        finaleActive ? 3.8 : 6.0,
        dt,
      );
      const bs = bloomScaleRef.current;
      bloomGroupRef.current.scale.set(bs, bs, bs);
    }

    // Swirling pollen / flower petals around blooming tree
    if (growthStage === 4 && pollenGroupRef.current) {
      const children = pollenGroupRef.current.children;
      for (let i = 0; i < children.length; i++) {
        const p = pollenSeeds[i];
        const a = p.angle + elapsed * p.speed;
        const r = p.radius + Math.sin(elapsed * 1.6 + p.phase) * 0.35;
        const y = p.baseY + Math.sin(elapsed * 2.1 + p.phase) * 0.55;
        children[i].position.set(Math.cos(a) * r, y, Math.sin(a) * r);
        children[i].rotation.x = elapsed * 2 + p.phase;
        children[i].rotation.y = elapsed * 1.5 + p.phase;
      }
    }

    // Seed parabolic flight
    if (seedFlight && seedMeshRef.current) {
      seedProgressRef.current += dt * 0.9;
      const t = Math.min(seedProgressRef.current, 1);
      const easeT = 1 - Math.pow(1 - t, 2);

      const x = THREE.MathUtils.lerp(seedFlight.startX, 0, easeT);
      const z = THREE.MathUtils.lerp(seedFlight.startZ, 0, easeT);
      const baseY = THREE.MathUtils.lerp(seedFlight.startY, 0.6, easeT);
      const arcY = 4 * t * (1 - t) * 4.2;

      seedMeshRef.current.position.set(x, baseY + arcY, z);
      seedMeshRef.current.rotation.y += dt * 5;
      const s = 1 - t * 0.35;
      seedMeshRef.current.scale.set(s, s, s);

      if (t >= 1) {
        activeSeedIdRef.current = null;
        onSeedFlightComplete();
      }
    }

    // Snowman light burst
    if (lightBurst && burstGroupRef.current) {
      burstProgressRef.current += dt * 0.85;
      const children = burstGroupRef.current.children;
      let allDone = true;

      for (let i = 0; i < children.length; i++) {
        const off = burstOffsets[i];
        const rawT = (burstProgressRef.current - off.delay) / 0.85;
        if (rawT < 1) allDone = false;
        const t = THREE.MathUtils.clamp(rawT, 0, 1);
        const ease = 1 - Math.pow(1 - t, 2);

        const sx = lightBurst.startX + Math.cos(off.angle) * off.spread;
        const sz = lightBurst.startZ + Math.sin(off.angle) * off.spread;
        const x = THREE.MathUtils.lerp(sx, 0, ease);
        const z = THREE.MathUtils.lerp(sz, 0, ease);
        const y =
          THREE.MathUtils.lerp(lightBurst.startY, 0.85, ease) +
          4 * t * (1 - t) * (2.8 + (i % 3) * 0.5);

        const child = children[i];
        child.position.set(x, y, z);
        const sc = t > 0 && t < 1 ? Math.sin(t * Math.PI) * 1.15 : 0.001;
        child.scale.set(sc, sc, sc);
      }

      if (allDone) {
        activeBurstIdRef.current = null;
        onLightBurstComplete();
      }
    }

    // Rain cloud + water droplets
    if (cloudGroupRef.current) {
      if (rainTimerRef.current > 0) {
        rainTimerRef.current = Math.max(0, rainTimerRef.current - dt);
        cloudGroupRef.current.visible = true;
        const fade = Math.min(1, rainTimerRef.current * 1.4);
        cloudGroupRef.current.scale.setScalar(fade);
        cloudGroupRef.current.position.y = 3.85 + Math.sin(elapsed * 3.0) * 0.08;

        const drops = cloudGroupRef.current.children.slice(4);
        for (let i = 0; i < drops.length; i++) {
          const dOff = dropOffsets[i];
          const cycle = (elapsed * 1.7 + dOff.phase) % 1;
          drops[i].position.set(dOff.x, -0.3 - cycle * 2.8, dOff.z);
        }
      } else {
        cloudGroupRef.current.visible = false;
      }
    }
  });

  return (
    <group>
      <group ref={plantGroupRef} position={[0, 0.45, 0]}>
        {growthStage === 0 && (
          <group position={[0, 0.12, 0]}>
            <mesh scale={[1, 1.35, 1]}>
              <sphereGeometry args={[0.2, 12, 10]} />
              <meshStandardMaterial
                color={seedColor}
                emissive={seedColor}
                emissiveIntensity={0.25}
                roughness={0.45}
              />
            </mesh>
          </group>
        )}

        {growthStage === 1 && (
          <group>
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.05, 0.08, 0.5, 8]} />
              <meshStandardMaterial color={PALETTE.green} roughness={0.65} />
            </mesh>
            <mesh position={[-0.22, 0.48, 0]} rotation={[0, 0, 0.5]} scale={[1.5, 0.55, 0.85]}>
              <sphereGeometry args={[0.17, 10, 8]} />
              <meshStandardMaterial color="#46A57E" roughness={0.55} />
            </mesh>
            <mesh position={[0.22, 0.52, 0]} rotation={[0, 0, -0.45]} scale={[1.5, 0.55, 0.85]}>
              <sphereGeometry args={[0.17, 10, 8]} />
              <meshStandardMaterial color="#46A57E" roughness={0.55} />
            </mesh>
          </group>
        )}

        {growthStage === 2 && (
          <group>
            <mesh position={[0, 0.52, 0]}>
              <cylinderGeometry args={[0.08, 0.13, 1.05, 8]} />
              <meshStandardMaterial color={PALETTE.green} roughness={0.7} />
            </mesh>
            {[0, 1, 2, 3].map((idx) => {
              const angle = (idx / 4) * Math.PI * 2 + 0.4;
              const y = 0.42 + idx * 0.16;
              return (
                <mesh
                  key={idx}
                  position={[Math.cos(angle) * 0.28, y, Math.sin(angle) * 0.28]}
                  rotation={[0, -angle, 0.4]}
                  scale={[1.55, 0.48, 0.85]}
                >
                  <sphereGeometry args={[0.19, 10, 8]} />
                  <meshStandardMaterial color="#46A57E" roughness={0.55} />
                </mesh>
              );
            })}
            <mesh position={[0, 1.08, 0]}>
              <sphereGeometry args={[0.22, 10, 8]} />
              <meshStandardMaterial color="#58B991" roughness={0.55} />
            </mesh>
          </group>
        )}

        {growthStage === 3 && (
          <group>
            <mesh position={[0, 0.68, 0]}>
              <cylinderGeometry args={[0.13, 0.22, 1.38, 9]} />
              <meshStandardMaterial color={PALETTE.soil} roughness={0.85} />
            </mesh>
            <mesh position={[0, 1.4, 0]}>
              <dodecahedronGeometry args={[0.72, 1]} />
              <meshStandardMaterial color={PALETTE.green} roughness={0.72} flatShading />
            </mesh>
            <mesh position={[-0.45, 1.24, 0.22]}>
              <dodecahedronGeometry args={[0.45, 1]} />
              <meshStandardMaterial color="#378B6E" roughness={0.72} flatShading />
            </mesh>
            <mesh position={[0.45, 1.24, -0.22]}>
              <dodecahedronGeometry args={[0.45, 1]} />
              <meshStandardMaterial color="#378B6E" roughness={0.72} flatShading />
            </mesh>
            <mesh position={[0, 2.08, 0]} scale={[0.9, 1.3, 0.9]}>
              <sphereGeometry args={[0.28, 12, 10]} />
              <meshStandardMaterial
                color={seedColor}
                emissive={seedColor}
                emissiveIntensity={0.22}
                roughness={0.45}
              />
            </mesh>
          </group>
        )}

        {growthStage === 4 && (
          <group>
            <mesh position={[0, 0.78, 0]}>
              <cylinderGeometry args={[0.16, 0.27, 1.56, 9]} />
              <meshStandardMaterial color={PALETTE.soil} roughness={0.85} />
            </mesh>
            <mesh position={[0, 1.62, 0]}>
              <dodecahedronGeometry args={[0.92, 1]} />
              <meshStandardMaterial color={PALETTE.green} roughness={0.7} flatShading />
            </mesh>
            <mesh position={[-0.6, 1.4, 0.28]}>
              <dodecahedronGeometry args={[0.56, 1]} />
              <meshStandardMaterial color="#378B6E" roughness={0.7} flatShading />
            </mesh>
            <mesh position={[0.6, 1.42, -0.25]}>
              <dodecahedronGeometry args={[0.56, 1]} />
              <meshStandardMaterial color="#378B6E" roughness={0.7} flatShading />
            </mesh>

            {/* All flowers blooming simultaneously */}
            <group ref={bloomGroupRef}>
              <group position={[0, 2.48, 0]}>
                <mesh>
                  <sphereGeometry args={[0.25, 12, 10]} />
                  <meshStandardMaterial
                    color="#F6C445"
                    emissive="#F6C445"
                    emissiveIntensity={0.35}
                    roughness={0.35}
                  />
                </mesh>
                {[0, 1, 2, 3, 4, 5].map((p) => {
                  const a = (p / 6) * Math.PI * 2;
                  return (
                    <mesh
                      key={p}
                      position={[Math.cos(a) * 0.34, 0.04, Math.sin(a) * 0.34]}
                      scale={[1.15, 0.65, 1.15]}
                    >
                      <sphereGeometry args={[0.22, 10, 8]} />
                      <meshStandardMaterial
                        color={p % 2 === 0 ? seedColor : '#F6F8FC'}
                        roughness={0.45}
                      />
                    </mesh>
                  );
                })}
              </group>

              {[
                [-0.68, 1.65, 0.45],
                [0.65, 1.72, 0.38],
                [0.12, 1.68, -0.76],
                [-0.35, 1.98, -0.45],
                [0.42, 1.92, 0.52],
                [-0.82, 1.38, -0.15],
                [0.78, 1.36, -0.42],
              ].map(([bx, by, bz], idx) => (
                <group key={idx} position={[bx, by, bz]}>
                  <mesh>
                    <sphereGeometry args={[0.16, 8, 8]} />
                    <meshStandardMaterial
                      color={idx % 2 === 0 ? seedColor : '#F6C445'}
                      emissive={idx % 2 === 0 ? seedColor : '#F6C445'}
                      emissiveIntensity={0.25}
                    />
                  </mesh>
                  <mesh position={[0, 0.05, 0]}>
                    <sphereGeometry args={[0.07, 6, 6]} />
                    <meshBasicMaterial color="#FFFBEB" />
                  </mesh>
                </group>
              ))}
            </group>
          </group>
        )}
      </group>

      {/* Swirling flower pollen & petals in Stage 4 */}
      {growthStage === 4 && (
        <group ref={pollenGroupRef}>
          {pollenSeeds.map((_, i) => (
            <mesh key={i} scale={[1, 0.45, 1]}>
              <sphereGeometry args={[0.065, 6, 6]} />
              <meshBasicMaterial
                color={i % 3 === 0 ? '#F6C445' : i % 3 === 1 ? seedColor : '#FFFFFF'}
              />
            </mesh>
          ))}
        </group>
      )}

      {seedFlight && (
        <group ref={seedMeshRef}>
          <mesh>
            <sphereGeometry args={[0.34, 14, 12]} />
            <meshStandardMaterial
              color={seedFlight.color}
              emissive={seedFlight.color}
              emissiveIntensity={0.45}
              roughness={0.35}
            />
          </mesh>
        </group>
      )}

      {lightBurst && (
        <group ref={burstGroupRef}>
          {burstOffsets.map((_, i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.14, 8, 8]} />
              <meshBasicMaterial color={i % 2 === 0 ? '#F6C445' : '#F4A259'} />
            </mesh>
          ))}
        </group>
      )}

      <group ref={cloudGroupRef} position={[0, 3.85, 0]} visible={false}>
        <mesh position={[0, 0.12, 0]}>
          <sphereGeometry args={[0.55, 12, 10]} />
          <meshStandardMaterial color="#F6F8FC" roughness={0.75} />
        </mesh>
        <mesh position={[-0.45, 0, 0.08]}>
          <sphereGeometry args={[0.4, 10, 8]} />
          <meshStandardMaterial color="#E3EEFA" roughness={0.78} />
        </mesh>
        <mesh position={[0.45, 0, -0.06]}>
          <sphereGeometry args={[0.42, 10, 8]} />
          <meshStandardMaterial color="#E3EEFA" roughness={0.78} />
        </mesh>
        <mesh position={[0, -0.05, 0.28]}>
          <sphereGeometry args={[0.36, 10, 8]} />
          <meshStandardMaterial color="#F6F8FC" roughness={0.75} />
        </mesh>

        {dropOffsets.map((_, idx) => (
          <mesh key={idx} scale={[0.7, 1.4, 0.7]}>
            <sphereGeometry args={[0.075, 7, 6]} />
            <meshBasicMaterial color={rainIsCorrect ? '#3B82F6' : '#60A5FA'} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
