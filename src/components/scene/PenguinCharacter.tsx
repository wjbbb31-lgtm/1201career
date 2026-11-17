import { useFrame } from '@react-three/fiber';
import { MutableRefObject, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  ISLAND_OBSTACLES,
  ISLAND_WALK_RADIUS,
  ISLAND_WAYPOINTS,
  PALETTE,
  SCARF_COLORS,
  ScarfColorId,
} from '../../types/game';

interface PenguinCharacterProps {
  scarfColor: ScarfColorId;
  hasStarted: boolean;
  modalOpen: boolean;
  autoMove: boolean;
  guideTarget: { x: number; z: number } | null;
  penguinPosRef: MutableRefObject<THREE.Vector3>;
  penguinYawRef: MutableRefObject<number>;
  clickTargetRef: MutableRefObject<{ x: number; z: number; active: boolean }>;
  onReachClickTarget: () => void;
  onWaypointChange: (label: string, description: string) => void;
  enableShadows: boolean;
  isCelebrating?: boolean;
}

const WALK_SPEED = 4.3;
const TURN_DAMP = 9.0;

function normalizeAngle(angle: number): number {
  let a = angle;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

export function PenguinCharacter({
  scarfColor,
  hasStarted,
  modalOpen,
  autoMove,
  guideTarget,
  penguinPosRef,
  penguinYawRef,
  clickTargetRef,
  onReachClickTarget,
  onWaypointChange,
  enableShadows,
  isCelebrating = false,
}: PenguinCharacterProps) {
  const rootRef = useRef<THREE.Group>(null);
  const bodyTiltRef = useRef<THREE.Group>(null);
  const leftFootRef = useRef<THREE.Group>(null);
  const rightFootRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);

  const keysRef = useRef<Record<string, boolean>>({});
  const walkCycleRef = useRef(0);
  const autoWaypointIndexRef = useRef(0);
  const autoPauseTimerRef = useRef(0);
  const lastReportedWpRef = useRef('');

  const scarfOption = useMemo(
    () => SCARF_COLORS.find((c) => c.id === scarfColor) ?? SCARF_COLORS[0],
    [scarfColor],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      keysRef.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };
    const handleBlur = () => {
      keysRef.current = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useFrame((state, delta) => {
    if (!rootRef.current || !bodyTiltRef.current) return;
    const dt = Math.min(delta, 0.05);
    const pos = penguinPosRef.current;

    let moveX = 0;
    let moveZ = 0;
    let isMoving = false;

    if (hasStarted && isCelebrating) {
      // Face toward the center Dream Tree & leap for joy!
      const toTreeYaw = Math.atan2(-pos.x, -pos.z);
      const diff = normalizeAngle(toTreeYaw - penguinYawRef.current);
      penguinYawRef.current = normalizeAngle(
        penguinYawRef.current + diff * (1 - Math.exp(-8 * dt)),
      );
      rootRef.current.position.set(pos.x, 0, pos.z);
      rootRef.current.rotation.y = penguinYawRef.current;

      const jumpPhase = state.clock.elapsedTime * 7.2;
      const jumpHeight = Math.abs(Math.sin(jumpPhase)) * 0.72;
      bodyTiltRef.current.position.y = jumpHeight;
      bodyTiltRef.current.rotation.z = Math.sin(jumpPhase * 0.5) * 0.1;
      bodyTiltRef.current.rotation.x = -0.06;

      if (leftWingRef.current && rightWingRef.current) {
        leftWingRef.current.rotation.z = 0.6 + Math.sin(jumpPhase * 2) * 0.55;
        rightWingRef.current.rotation.z = -0.6 - Math.sin(jumpPhase * 2) * 0.55;
      }
      if (leftFootRef.current && rightFootRef.current) {
        leftFootRef.current.rotation.x = Math.sin(jumpPhase) * 0.35;
        rightFootRef.current.rotation.x = -Math.sin(jumpPhase) * 0.35;
      }
      return;
    }

    if (hasStarted && !modalOpen) {
      const keys = keysRef.current;
      const up = keys['KeyW'] || keys['ArrowUp'];
      const down = keys['KeyS'] || keys['ArrowDown'];
      const left = keys['KeyA'] || keys['ArrowLeft'];
      const right = keys['KeyD'] || keys['ArrowRight'];

      const inputZ = (down ? 1 : 0) - (up ? 1 : 0);
      const inputX = (right ? 1 : 0) - (left ? 1 : 0);

      if (inputX !== 0 || inputZ !== 0) {
        const camDirX = pos.x - state.camera.position.x;
        const camDirZ = pos.z - state.camera.position.z;
        const camLen = Math.hypot(camDirX, camDirZ) || 1;
        const fwdX = camDirX / camLen;
        const fwdZ = camDirZ / camLen;
        const rightX = -fwdZ;
        const rightZ = fwdX;

        const kbForward = -inputZ;
        const kbRight = inputX;
        moveX = fwdX * kbForward + rightX * kbRight;
        moveZ = fwdZ * kbForward + rightZ * kbRight;

        const len = Math.hypot(moveX, moveZ) || 1;
        moveX /= len;
        moveZ /= len;
        isMoving = true;

        if (clickTargetRef.current.active) {
          clickTargetRef.current.active = false;
          onReachClickTarget();
        }
      } else if (clickTargetRef.current.active) {
        const dx = clickTargetRef.current.x - pos.x;
        const dz = clickTargetRef.current.z - pos.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.25) {
          moveX = dx / dist;
          moveZ = dz / dist;
          isMoving = true;
        } else {
          clickTargetRef.current.active = false;
          onReachClickTarget();
        }
      } else if (autoMove) {
        if (guideTarget) {
          const dx = guideTarget.x - pos.x;
          const dz = guideTarget.z - pos.z;
          const dist = Math.hypot(dx, dz);
          if (dist > 0.65) {
            // Gently steer around center Dream Pot if passing directly through it
            let dirX = dx / dist;
            let dirZ = dz / dist;
            const centerDist = Math.hypot(pos.x, pos.z);
            if (centerDist < 3.2) {
              const radialX = pos.x / (centerDist || 1);
              const radialZ = pos.z / (centerDist || 1);
              const dot = dirX * radialX + dirZ * radialZ;
              if (dot < 0) {
                dirX -= radialX * dot * 1.25;
                dirZ -= radialZ * dot * 1.25;
                const dLen = Math.hypot(dirX, dirZ) || 1;
                dirX /= dLen;
                dirZ /= dLen;
              }
            }
            moveX = dirX;
            moveZ = dirZ;
            isMoving = true;
          }
        } else {
          if (autoPauseTimerRef.current > 0) {
            autoPauseTimerRef.current -= dt;
          } else {
            const wp = ISLAND_WAYPOINTS[autoWaypointIndexRef.current];
            if (lastReportedWpRef.current !== wp.id) {
              lastReportedWpRef.current = wp.id;
              onWaypointChange(wp.label, wp.description);
            }

            const dx = wp.x - pos.x;
            const dz = wp.z - pos.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 0.4) {
              moveX = dx / dist;
              moveZ = dz / dist;
              isMoving = true;
            } else {
              autoPauseTimerRef.current = 1.6;
              autoWaypointIndexRef.current =
                (autoWaypointIndexRef.current + 1) % ISLAND_WAYPOINTS.length;
            }
          }
        }
      }
    }

    if (isMoving) {
      pos.x += moveX * WALK_SPEED * dt;
      pos.z += moveZ * WALK_SPEED * dt;

      for (let i = 0; i < ISLAND_OBSTACLES.length; i++) {
        const obs = ISLAND_OBSTACLES[i];
        const minDist = obs.radius + 0.52;
        const ox = pos.x - obs.x;
        const oz = pos.z - obs.z;
        const distSq = ox * ox + oz * oz;
        if (distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq) || 0.001;
          pos.x = obs.x + (ox / dist) * minDist;
          pos.z = obs.z + (oz / dist) * minDist;
        }
      }

      const radiusFromCenter = Math.hypot(pos.x, pos.z);
      if (radiusFromCenter > ISLAND_WALK_RADIUS) {
        const clampRatio = ISLAND_WALK_RADIUS / radiusFromCenter;
        pos.x *= clampRatio;
        pos.z *= clampRatio;
      }

      const targetYaw = Math.atan2(moveX, moveZ);
      const diff = normalizeAngle(targetYaw - penguinYawRef.current);
      penguinYawRef.current = normalizeAngle(
        penguinYawRef.current + diff * (1 - Math.exp(-TURN_DAMP * dt)),
      );

      walkCycleRef.current += dt * 11.5;
    }

    rootRef.current.position.set(pos.x, 0, pos.z);
    rootRef.current.rotation.y = penguinYawRef.current;

    const t = walkCycleRef.current;
    const idleWave = Math.sin(state.clock.elapsedTime * 2.4);

    if (isMoving) {
      const rollTarget = Math.sin(t) * 0.14;
      const hopTarget = Math.abs(Math.sin(t)) * 0.08;
      bodyTiltRef.current.rotation.z = THREE.MathUtils.damp(
        bodyTiltRef.current.rotation.z,
        rollTarget,
        14,
        dt,
      );
      bodyTiltRef.current.rotation.x = THREE.MathUtils.damp(
        bodyTiltRef.current.rotation.x,
        0.08,
        10,
        dt,
      );
      bodyTiltRef.current.position.y = THREE.MathUtils.damp(
        bodyTiltRef.current.position.y,
        hopTarget,
        16,
        dt,
      );

      if (leftFootRef.current && rightFootRef.current) {
        leftFootRef.current.rotation.x = Math.sin(t) * 0.55;
        rightFootRef.current.rotation.x = -Math.sin(t) * 0.55;
      }
      if (leftWingRef.current && rightWingRef.current) {
        leftWingRef.current.rotation.z = 0.25 + Math.sin(t) * 0.22;
        rightWingRef.current.rotation.z = -0.25 - Math.sin(t) * 0.22;
      }
    } else {
      bodyTiltRef.current.rotation.z = THREE.MathUtils.damp(
        bodyTiltRef.current.rotation.z,
        0,
        10,
        dt,
      );
      bodyTiltRef.current.rotation.x = THREE.MathUtils.damp(
        bodyTiltRef.current.rotation.x,
        0,
        10,
        dt,
      );
      bodyTiltRef.current.position.y = THREE.MathUtils.damp(
        bodyTiltRef.current.position.y,
        idleWave * 0.02 + 0.02,
        8,
        dt,
      );

      if (leftFootRef.current && rightFootRef.current) {
        leftFootRef.current.rotation.x = THREE.MathUtils.damp(
          leftFootRef.current.rotation.x,
          0,
          12,
          dt,
        );
        rightFootRef.current.rotation.x = THREE.MathUtils.damp(
          rightFootRef.current.rotation.x,
          0,
          12,
          dt,
        );
      }
      if (leftWingRef.current && rightWingRef.current) {
        leftWingRef.current.rotation.z = THREE.MathUtils.damp(
          leftWingRef.current.rotation.z,
          0.16 + idleWave * 0.04,
          8,
          dt,
        );
        rightWingRef.current.rotation.z = THREE.MathUtils.damp(
          rightWingRef.current.rotation.z,
          -0.16 - idleWave * 0.04,
          8,
          dt,
        );
      }
    }
  });

  return (
    <group ref={rootRef} position={[0, 0, 5.2]}>
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.62, 18]} />
        <meshBasicMaterial
          color="#6F89A8"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      <group ref={bodyTiltRef}>
        <group ref={leftFootRef} position={[-0.22, 0.08, 0.08]}>
          <mesh position={[0, -0.02, 0.1]} castShadow={enableShadows}>
            <boxGeometry args={[0.24, 0.1, 0.36]} />
            <meshStandardMaterial color={PALETTE.orange} roughness={0.55} />
          </mesh>
        </group>

        <group ref={rightFootRef} position={[0.22, 0.08, 0.08]}>
          <mesh position={[0, -0.02, 0.1]} castShadow={enableShadows}>
            <boxGeometry args={[0.24, 0.1, 0.36]} />
            <meshStandardMaterial color={PALETTE.orange} roughness={0.55} />
          </mesh>
        </group>

        <mesh
          position={[0, 0.65, 0]}
          scale={[1.0, 1.12, 0.94]}
          castShadow={enableShadows}
          receiveShadow={enableShadows}
        >
          <sphereGeometry args={[0.56, 16, 14]} />
          <meshStandardMaterial color={PALETTE.navy} roughness={0.62} />
        </mesh>

        <mesh
          position={[0, 0.63, 0.18]}
          scale={[0.84, 0.96, 0.72]}
          receiveShadow={enableShadows}
        >
          <sphereGeometry args={[0.48, 14, 12]} />
          <meshStandardMaterial color={PALETTE.snow} roughness={0.75} />
        </mesh>

        <group ref={leftWingRef} position={[-0.52, 0.76, 0]} rotation={[0, 0, 0.18]}>
          <mesh position={[-0.08, -0.22, 0]} scale={[0.32, 0.85, 0.48]} castShadow={enableShadows}>
            <sphereGeometry args={[0.42, 10, 10]} />
            <meshStandardMaterial color={PALETTE.navy} roughness={0.6} />
          </mesh>
        </group>

        <group ref={rightWingRef} position={[0.52, 0.76, 0]} rotation={[0, 0, -0.18]}>
          <mesh position={[0.08, -0.22, 0]} scale={[0.32, 0.85, 0.48]} castShadow={enableShadows}>
            <sphereGeometry args={[0.42, 10, 10]} />
            <meshStandardMaterial color={PALETTE.navy} roughness={0.6} />
          </mesh>
        </group>

        <mesh position={[0, 1.28, 0.03]} castShadow={enableShadows}>
          <sphereGeometry args={[0.43, 16, 14]} />
          <meshStandardMaterial color={PALETTE.navy} roughness={0.58} />
        </mesh>

        <mesh position={[-0.14, 1.24, 0.29]} scale={[0.92, 0.95, 0.65]}>
          <sphereGeometry args={[0.2, 12, 10]} />
          <meshStandardMaterial color={PALETTE.snow} roughness={0.72} />
        </mesh>
        <mesh position={[0.14, 1.24, 0.29]} scale={[0.92, 0.95, 0.65]}>
          <sphereGeometry args={[0.2, 12, 10]} />
          <meshStandardMaterial color={PALETTE.snow} roughness={0.72} />
        </mesh>

        <mesh position={[-0.15, 1.32, 0.39]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color="#111827" roughness={0.2} />
        </mesh>
        <mesh position={[0.15, 1.32, 0.39]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color="#111827" roughness={0.2} />
        </mesh>
        <mesh position={[-0.135, 1.34, 0.435]}>
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.165, 1.34, 0.435]}>
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>

        <mesh position={[0, 1.2, 0.49]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.095, 0.22, 8]} />
          <meshStandardMaterial color={PALETTE.orange} roughness={0.48} />
        </mesh>

        <mesh position={[0, 1.0, 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow={enableShadows}>
          <torusGeometry args={[0.38, 0.095, 10, 18]} />
          <meshStandardMaterial color={scarfOption.hex} roughness={0.78} />
        </mesh>

        <mesh
          position={[0.21, 0.78, 0.36]}
          rotation={[0.18, 0, -0.22]}
          castShadow={enableShadows}
        >
          <boxGeometry args={[0.16, 0.42, 0.08]} />
          <meshStandardMaterial color={scarfOption.ringHex} roughness={0.78} />
        </mesh>
      </group>
    </group>
  );
}
