import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { MutableRefObject, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  DREAM_SEED_OPTIONS,
  DreamSeedOption,
  GIFT_CATEGORIES,
  GiftCategory,
  SNOWMAN_QUESTIONS,
  SnowmanQuestion,
} from '../../data/careerGameData';
import {
  GameStage,
  OX_GATES_POSITIONS,
  PALETTE,
  getSeedOrbPositions,
} from '../../types/game';

interface StageProps3DProps {
  hasStarted: boolean;
  modalOpen: boolean;
  gameStage: GameStage;
  penguinPosRef: MutableRefObject<THREE.Vector3>;
  // Stage 1
  seedPlanted: boolean;
  onTriggerSeedOrb: (option: DreamSeedOption, x: number, z: number) => void;
  // Stage 2
  answeredSnowmen: Record<string, string>;
  onTriggerSnowman: (q: SnowmanQuestion) => void;
  // Stage 3
  quizLocked: boolean;
  onAnswerOx: (choice: 'O' | 'X') => void;
  // Stage 4
  openedGifts: Record<string, boolean>;
  selectedMissions: Record<string, string>;
  onTriggerGift: (gift: GiftCategory) => void;
  // Ground path guide target
  guideTarget: { x: number; z: number } | null;
  enableShadows: boolean;
}

const STEP_COUNT = 9;

function GroundPathGuide({
  penguinPosRef,
  guideTarget,
}: {
  penguinPosRef: MutableRefObject<THREE.Vector3>;
  guideTarget: { x: number; z: number } | null;
}) {
  const stepsGroupRef = useRef<THREE.Group>(null);
  const destRingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!guideTarget || !stepsGroupRef.current || !destRingRef.current) return;

    const px = penguinPosRef.current.x;
    const pz = penguinPosRef.current.z;
    const dx = guideTarget.x - px;
    const dz = guideTarget.z - pz;
    const totalDist = Math.hypot(dx, dz);

    const angle = Math.atan2(dx, dz);
    const children = stepsGroupRef.current.children;

    if (totalDist < 1.5) {
      for (let i = 0; i < children.length; i++) {
        children[i].visible = false;
      }
    } else {
      const timeOffset = (state.clock.elapsedTime * 1.4) % 1;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const frac = (i + timeOffset) / children.length;
        if (frac < 0.1 || frac > 0.92) {
          child.visible = false;
          continue;
        }
        let sx = THREE.MathUtils.lerp(px, guideTarget.x, frac);
        let sz = THREE.MathUtils.lerp(pz, guideTarget.z, frac);

        // Gently curve around the center Dream Pot if line crosses through center
        const centerDist = Math.hypot(sx, sz);
        if (centerDist < 2.95) {
          const push = 2.95 / (centerDist || 0.1);
          sx *= push;
          sz *= push;
        }

        child.visible = true;
        child.position.set(sx, 0.035, sz);
        child.rotation.set(-Math.PI / 2, 0, -angle);
        const s = 0.75 + Math.sin(frac * Math.PI) * 0.35;
        child.scale.set(s, s, 1);
      }
    }

    destRingRef.current.position.set(guideTarget.x, 0.032, guideTarget.z);
    const ringPulse = 1 + Math.sin(state.clock.elapsedTime * 3.8) * 0.12;
    destRingRef.current.scale.set(ringPulse, ringPulse, 1);
  });

  if (!guideTarget) return null;

  return (
    <group>
      <group ref={stepsGroupRef}>
        {Array.from({ length: STEP_COUNT }).map((_, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.22, 0.38, 3]} />
            <meshBasicMaterial color={PALETTE.orange} transparent opacity={0.85} />
          </mesh>
        ))}
      </group>
      <mesh
        ref={destRingRef}
        position={[guideTarget.x, 0.032, guideTarget.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.85, 1.12, 24]} />
        <meshBasicMaterial color={PALETTE.orange} transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

function DreamSeedOrbs({
  hasStarted,
  modalOpen,
  penguinPosRef,
  onTriggerSeedOrb,
}: {
  hasStarted: boolean;
  modalOpen: boolean;
  penguinPosRef: MutableRefObject<THREE.Vector3>;
  onTriggerSeedOrb: (option: DreamSeedOption, x: number, z: number) => void;
}) {
  const orbPositions = useMemo(
    () => getSeedOrbPositions(DREAM_SEED_OPTIONS.length),
    [],
  );
  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const lastTriggeredRef = useRef<string | null>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const px = penguinPosRef.current.x;
    const pz = penguinPosRef.current.z;

    let nearAnyId: string | null = null;

    for (let i = 0; i < DREAM_SEED_OPTIONS.length; i++) {
      const grp = groupRefs.current[i];
      const pos = orbPositions[i];
      if (grp) {
        grp.position.y = 1.05 + Math.sin(t * 2.1 + i * 0.65) * 0.14;
        grp.rotation.y = t * 0.7 + i * 0.4;
      }

      if (hasStarted && !modalOpen) {
        const dist = Math.hypot(px - pos.x, pz - pos.z);
        if (dist < 1.25) {
          nearAnyId = DREAM_SEED_OPTIONS[i].id;
          if (lastTriggeredRef.current !== nearAnyId) {
            lastTriggeredRef.current = nearAnyId;
            onTriggerSeedOrb(DREAM_SEED_OPTIONS[i], pos.x, pos.z);
          }
        }
      }
    }

    if (!nearAnyId && !modalOpen) {
      lastTriggeredRef.current = null;
    }
  });

  return (
    <group>
      {DREAM_SEED_OPTIONS.map((option, idx) => {
        const pos = orbPositions[idx];
        return (
          <group key={option.id} position={[pos.x, 0, pos.z]}>
            {/* Ground shadow ring */}
            <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.38, 0.54, 18]} />
              <meshBasicMaterial color={option.color} transparent opacity={0.55} />
            </mesh>

            {/* Floating orb */}
            <group
              ref={(el) => {
                groupRefs.current[idx] = el;
              }}
              position={[0, 1.05, 0]}
              onClick={(e) => {
                if (!hasStarted || modalOpen) return;
                e.stopPropagation();
                onTriggerSeedOrb(option, pos.x, pos.z);
              }}
            >
              <mesh>
                <sphereGeometry args={[0.4, 14, 12]} />
                <meshStandardMaterial
                  color={option.color}
                  emissive={option.color}
                  emissiveIntensity={0.32}
                  roughness={0.35}
                />
              </mesh>
              <mesh rotation={[Math.PI / 3, 0, 0]}>
                <torusGeometry args={[0.56, 0.045, 8, 20]} />
                <meshBasicMaterial color="#F6F8FC" />
              </mesh>
            </group>

            {hasStarted && !modalOpen && (
              <Html position={[0, 1.88, 0]} center>
                <button
                  type="button"
                  onClick={() => onTriggerSeedOrb(option, pos.x, pos.z)}
                  className={`px-2.5 py-1 rounded-xl border-2 text-xs sm:text-sm font-extrabold whitespace-nowrap shadow-md cursor-pointer transition-transform hover:scale-105 ${
                    option.isUnknown
                      ? 'bg-[#2F7D62] text-[#F6F8FC] border-[#F6F8FC]'
                      : 'bg-[#F6F8FC]/95 text-[#1E2A4A] border-[#C8DCF0]'
                  }`}
                >
                  <span aria-hidden="true">{option.emoji} </span>
                  <span>{option.label}</span>
                </button>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

function SnowmanQuestionMarkers({
  hasStarted,
  modalOpen,
  penguinPosRef,
  answeredSnowmen,
  onTriggerSnowman,
}: {
  hasStarted: boolean;
  modalOpen: boolean;
  penguinPosRef: MutableRefObject<THREE.Vector3>;
  answeredSnowmen: Record<string, string>;
  onTriggerSnowman: (q: SnowmanQuestion) => void;
}) {
  const lastTriggeredRef = useRef<string | null>(null);

  useFrame(() => {
    if (!hasStarted || modalOpen) return;
    const px = penguinPosRef.current.x;
    const pz = penguinPosRef.current.z;

    let nearId: string | null = null;
    for (const q of SNOWMAN_QUESTIONS) {
      if (answeredSnowmen[q.id]) continue;
      const dist = Math.hypot(px - q.x, pz - q.z);
      if (dist < 2.2) {
        nearId = q.id;
        if (lastTriggeredRef.current !== q.id) {
          lastTriggeredRef.current = q.id;
          onTriggerSnowman(q);
        }
      }
    }
    if (!nearId) {
      lastTriggeredRef.current = null;
    }
  });

  return (
    <group>
      {SNOWMAN_QUESTIONS.map((q) => {
        const answered = Boolean(answeredSnowmen[q.id]);
        return (
          <group key={q.id} position={[q.x, 0, q.z]}>
            {!answered && (
              <mesh
                position={[0, 0.03, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                onClick={(e) => {
                  if (!hasStarted || modalOpen) return;
                  e.stopPropagation();
                  onTriggerSnowman(q);
                }}
              >
                <ringGeometry args={[1.15, 1.45, 24]} />
                <meshBasicMaterial color={PALETTE.orange} transparent opacity={0.8} />
              </mesh>
            )}

            {hasStarted && !modalOpen && (
              <Html position={[0, 2.55, 0]} center>
                <button
                  type="button"
                  onClick={() => onTriggerSnowman(q)}
                  className={`px-3 py-1.5 rounded-2xl border-2 text-sm sm:text-base font-extrabold whitespace-nowrap shadow-lg cursor-pointer transition-transform hover:scale-105 ${
                    answered
                      ? 'bg-[#2F7D62] text-[#F6F8FC] border-[#F6F8FC]'
                      : 'bg-[#F4A259] text-[#1E2A4A] border-[#1E2A4A]'
                  }`}
                >
                  {answered ? '✅ 대답 완료!' : `❓ ${q.title}`}
                </button>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

function OxIceGates({
  hasStarted,
  modalOpen,
  quizLocked,
  penguinPosRef,
  onAnswerOx,
}: {
  hasStarted: boolean;
  modalOpen: boolean;
  quizLocked: boolean;
  penguinPosRef: MutableRefObject<THREE.Vector3>;
  onAnswerOx: (choice: 'O' | 'X') => void;
}) {
  const insideGateRef = useRef<'O' | 'X' | null>(null);

  useFrame(() => {
    if (!hasStarted || modalOpen || quizLocked) {
      return;
    }
    const px = penguinPosRef.current.x;
    const pz = penguinPosRef.current.z;

    const distO = Math.hypot(
      px - OX_GATES_POSITIONS.O.x,
      pz - OX_GATES_POSITIONS.O.z,
    );
    const distX = Math.hypot(
      px - OX_GATES_POSITIONS.X.x,
      pz - OX_GATES_POSITIONS.X.z,
    );

    if (distO < 1.35) {
      if (insideGateRef.current !== 'O') {
        insideGateRef.current = 'O';
        onAnswerOx('O');
      }
    } else if (distX < 1.35) {
      if (insideGateRef.current !== 'X') {
        insideGateRef.current = 'X';
        onAnswerOx('X');
      }
    } else if (distO > 2.0 && distX > 2.0) {
      insideGateRef.current = null;
    }
  });

  return (
    <group>
      {/* O Ice Gate */}
      <group position={[OX_GATES_POSITIONS.O.x, 0, OX_GATES_POSITIONS.O.z]}>
        {/* Floor pad */}
        <mesh
          position={[0, 0.03, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={(e) => {
            if (!hasStarted || modalOpen || quizLocked) return;
            e.stopPropagation();
            onAnswerOx('O');
          }}
        >
          <circleGeometry args={[1.3, 24]} />
          <meshBasicMaterial color="#2F7D62" transparent opacity={0.38} />
        </mesh>

        {/* Left & Right ice pillars */}
        <mesh position={[-1.15, 1.25, 0]}>
          <boxGeometry args={[0.42, 2.5, 0.42]} />
          <meshStandardMaterial color="#B9DDF8" roughness={0.28} metalness={0.1} />
        </mesh>
        <mesh position={[1.15, 1.25, 0]}>
          <boxGeometry args={[0.42, 2.5, 0.42]} />
          <meshStandardMaterial color="#B9DDF8" roughness={0.28} metalness={0.1} />
        </mesh>
        {/* Top ice lintel */}
        <mesh position={[0, 2.58, 0]}>
          <boxGeometry args={[2.9, 0.36, 0.48]} />
          <meshStandardMaterial color="#D4ECFD" roughness={0.25} />
        </mesh>
        {/* Big O Ring */}
        <mesh
          position={[0, 3.35, 0]}
          onClick={(e) => {
            if (!hasStarted || modalOpen || quizLocked) return;
            e.stopPropagation();
            onAnswerOx('O');
          }}
        >
          <torusGeometry args={[0.52, 0.14, 10, 22]} />
          <meshStandardMaterial
            color={PALETTE.green}
            emissive={PALETTE.green}
            emissiveIntensity={0.25}
            roughness={0.35}
          />
        </mesh>

        {hasStarted && !modalOpen && (
          <Html position={[0, 4.25, 0]} center>
            <button
              type="button"
              onClick={() => !quizLocked && onAnswerOx('O')}
              className="px-3.5 py-1.5 rounded-2xl bg-[#2F7D62] border-2 border-[#F6F8FC] text-[#F6F8FC] font-extrabold text-sm sm:text-base whitespace-nowrap shadow-lg cursor-pointer hover:scale-105 transition-transform"
            >
              ⭕ O 맞아요
            </button>
          </Html>
        )}
      </group>

      {/* X Ice Gate */}
      <group position={[OX_GATES_POSITIONS.X.x, 0, OX_GATES_POSITIONS.X.z]}>
        {/* Floor pad */}
        <mesh
          position={[0, 0.03, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={(e) => {
            if (!hasStarted || modalOpen || quizLocked) return;
            e.stopPropagation();
            onAnswerOx('X');
          }}
        >
          <circleGeometry args={[1.3, 24]} />
          <meshBasicMaterial color={PALETTE.orange} transparent opacity={0.38} />
        </mesh>

        {/* Left & Right ice pillars */}
        <mesh position={[-1.15, 1.25, 0]}>
          <boxGeometry args={[0.42, 2.5, 0.42]} />
          <meshStandardMaterial color="#B9DDF8" roughness={0.28} metalness={0.1} />
        </mesh>
        <mesh position={[1.15, 1.25, 0]}>
          <boxGeometry args={[0.42, 2.5, 0.42]} />
          <meshStandardMaterial color="#B9DDF8" roughness={0.28} metalness={0.1} />
        </mesh>
        {/* Top ice lintel */}
        <mesh position={[0, 2.58, 0]}>
          <boxGeometry args={[2.9, 0.36, 0.48]} />
          <meshStandardMaterial color="#D4ECFD" roughness={0.25} />
        </mesh>
        {/* Big X Cross */}
        <group
          position={[0, 3.35, 0]}
          onClick={(e) => {
            if (!hasStarted || modalOpen || quizLocked) return;
            e.stopPropagation();
            onAnswerOx('X');
          }}
        >
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[1.15, 0.22, 0.22]} />
            <meshStandardMaterial
              color="#E04F5F"
              emissive="#E04F5F"
              emissiveIntensity={0.22}
              roughness={0.35}
            />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[1.15, 0.22, 0.22]} />
            <meshStandardMaterial
              color="#E04F5F"
              emissive="#E04F5F"
              emissiveIntensity={0.22}
              roughness={0.35}
            />
          </mesh>
        </group>

        {hasStarted && !modalOpen && (
          <Html position={[0, 4.25, 0]} center>
            <button
              type="button"
              onClick={() => !quizLocked && onAnswerOx('X')}
              className="px-3.5 py-1.5 rounded-2xl bg-[#E04F5F] border-2 border-[#F6F8FC] text-[#F6F8FC] font-extrabold text-sm sm:text-base whitespace-nowrap shadow-lg cursor-pointer hover:scale-105 transition-transform"
            >
              ❌ X 아니에요
            </button>
          </Html>
        )}
      </group>
    </group>
  );
}

function GiftBoxes3D({
  hasStarted,
  modalOpen,
  penguinPosRef,
  openedGifts,
  selectedMissions,
  onTriggerGift,
  enableShadows,
}: {
  hasStarted: boolean;
  modalOpen: boolean;
  penguinPosRef: MutableRefObject<THREE.Vector3>;
  openedGifts: Record<string, boolean>;
  selectedMissions: Record<string, string>;
  onTriggerGift: (gift: GiftCategory) => void;
  enableShadows: boolean;
}) {
  const lidRefs = useRef<(THREE.Group | null)[]>([]);
  const lastTriggeredRef = useRef<string | null>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const px = penguinPosRef.current.x;
    const pz = penguinPosRef.current.z;

    let nearId: string | null = null;

    for (let i = 0; i < GIFT_CATEGORIES.length; i++) {
      const gift = GIFT_CATEGORIES[i];
      const lid = lidRefs.current[i];
      const isOpen = Boolean(openedGifts[gift.id] || selectedMissions[gift.id]);

      if (lid) {
        const targetAngle = isOpen ? -1.25 : 0;
        lid.rotation.x = THREE.MathUtils.damp(lid.rotation.x, targetAngle, 8, dt);
      }

      if (hasStarted && !modalOpen) {
        const dist = Math.hypot(px - gift.x, pz - gift.z);
        if (dist < 1.35) {
          nearId = gift.id;
          if (lastTriggeredRef.current !== gift.id) {
            lastTriggeredRef.current = gift.id;
            onTriggerGift(gift);
          }
        }
      }
    }

    if (!nearId && !modalOpen) {
      lastTriggeredRef.current = null;
    }
  });

  return (
    <group>
      {GIFT_CATEGORIES.map((gift, idx) => {
        const isChosen = Boolean(selectedMissions[gift.id]);
        return (
          <group
            key={gift.id}
            position={[gift.x, 0, gift.z]}
            onClick={(e) => {
              if (!hasStarted || modalOpen) return;
              e.stopPropagation();
              onTriggerGift(gift);
            }}
          >
            {/* Base box */}
            <mesh position={[0, 0.42, 0]} castShadow={enableShadows} receiveShadow={enableShadows}>
              <boxGeometry args={[0.92, 0.84, 0.92]} />
              <meshStandardMaterial color={gift.color} roughness={0.55} />
            </mesh>
            {/* Ribbons on base */}
            <mesh position={[0, 0.42, 0]}>
              <boxGeometry args={[0.96, 0.85, 0.18]} />
              <meshStandardMaterial color={gift.ribbonColor} roughness={0.45} />
            </mesh>
            <mesh position={[0, 0.42, 0]}>
              <boxGeometry args={[0.18, 0.85, 0.96]} />
              <meshStandardMaterial color={gift.ribbonColor} roughness={0.45} />
            </mesh>

            {/* Hinged Lid (pivots at back edge) */}
            <group
              ref={(el) => {
                lidRefs.current[idx] = el;
              }}
              position={[0, 0.84, -0.46]}
            >
              <mesh position={[0, 0.08, 0.46]} castShadow={enableShadows}>
                <boxGeometry args={[1.02, 0.18, 1.02]} />
                <meshStandardMaterial color={gift.color} roughness={0.5} />
              </mesh>
              <mesh position={[0, 0.18, 0.46]}>
                <boxGeometry args={[0.2, 0.05, 1.04]} />
                <meshStandardMaterial color={gift.ribbonColor} roughness={0.45} />
              </mesh>
              <mesh position={[0, 0.18, 0.46]}>
                <boxGeometry args={[1.04, 0.05, 0.2]} />
                <meshStandardMaterial color={gift.ribbonColor} roughness={0.45} />
              </mesh>
              {/* Bow loops */}
              <mesh position={[-0.14, 0.27, 0.46]} rotation={[0, 0, 0.4]}>
                <torusGeometry args={[0.12, 0.04, 7, 12]} />
                <meshStandardMaterial color={gift.ribbonColor} roughness={0.4} />
              </mesh>
              <mesh position={[0.14, 0.27, 0.46]} rotation={[0, 0, -0.4]}>
                <torusGeometry args={[0.12, 0.04, 7, 12]} />
                <meshStandardMaterial color={gift.ribbonColor} roughness={0.4} />
              </mesh>
            </group>

            {hasStarted && !modalOpen && (
              <Html position={[0, 1.55, 0]} center>
                <button
                  type="button"
                  onClick={() => onTriggerGift(gift)}
                  className={`px-3 py-1.5 rounded-2xl border-2 text-xs sm:text-sm font-extrabold whitespace-nowrap shadow-md cursor-pointer transition-transform hover:scale-105 ${
                    isChosen
                      ? 'bg-[#2F7D62] text-[#F6F8FC] border-[#F6F8FC]'
                      : 'bg-[#F6F8FC]/95 text-[#1E2A4A] border-[#C8DCF0]'
                  }`}
                >
                  <span aria-hidden="true">{gift.emoji} </span>
                  <span>{gift.label}</span>
                  {isChosen && <span> ✓</span>}
                </button>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

export function StageProps3D({
  hasStarted,
  modalOpen,
  gameStage,
  penguinPosRef,
  seedPlanted,
  onTriggerSeedOrb,
  answeredSnowmen,
  onTriggerSnowman,
  quizLocked,
  onAnswerOx,
  openedGifts,
  selectedMissions,
  onTriggerGift,
  guideTarget,
  enableShadows,
}: StageProps3DProps) {
  return (
    <group>
      {hasStarted && (
        <GroundPathGuide
          penguinPosRef={penguinPosRef}
          guideTarget={guideTarget}
        />
      )}

      {gameStage === 1 && !seedPlanted && (
        <DreamSeedOrbs
          hasStarted={hasStarted}
          modalOpen={modalOpen}
          penguinPosRef={penguinPosRef}
          onTriggerSeedOrb={onTriggerSeedOrb}
        />
      )}

      {gameStage === 2 && (
        <SnowmanQuestionMarkers
          hasStarted={hasStarted}
          modalOpen={modalOpen}
          penguinPosRef={penguinPosRef}
          answeredSnowmen={answeredSnowmen}
          onTriggerSnowman={onTriggerSnowman}
        />
      )}

      {gameStage === 3 && (
        <OxIceGates
          hasStarted={hasStarted}
          modalOpen={modalOpen}
          quizLocked={quizLocked}
          penguinPosRef={penguinPosRef}
          onAnswerOx={onAnswerOx}
        />
      )}

      {gameStage === 4 && (
        <GiftBoxes3D
          hasStarted={hasStarted}
          modalOpen={modalOpen}
          penguinPosRef={penguinPosRef}
          openedGifts={openedGifts}
          selectedMissions={selectedMissions}
          onTriggerGift={onTriggerGift}
          enableShadows={enableShadows}
        />
      )}
    </group>
  );
}
