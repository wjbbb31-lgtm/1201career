import { useFrame, useThree } from '@react-three/fiber';
import { MutableRefObject, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface FollowCameraProps {
  hasStarted: boolean;
  finaleActive: boolean;
  penguinPosRef: MutableRefObject<THREE.Vector3>;
  penguinYawRef: MutableRefObject<number>;
  resetCameraSignal: number;
}

const _desiredPos = new THREE.Vector3();
const _desiredTarget = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 1.0, 2.0);

function normalizeAngle(angle: number): number {
  let a = angle;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

export function FollowCamera({
  hasStarted,
  finaleActive,
  penguinPosRef,
  penguinYawRef,
  resetCameraSignal,
}: FollowCameraProps) {
  const { camera, gl } = useThree();
  const azimuthRef = useRef(0);
  const polarRef = useRef(0.56);
  const distanceRef = useRef(9.2);

  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const manualCooldownRef = useRef(0);
  const introAngleRef = useRef(0.35);
  const finaleAngleRef = useRef(0.15);

  useEffect(() => {
    const behindAngle = normalizeAngle(penguinYawRef.current + Math.PI);
    azimuthRef.current = behindAngle;
    polarRef.current = 0.56;
    distanceRef.current = 9.2;
    manualCooldownRef.current = 0;
  }, [resetCameraSignal, penguinYawRef]);

  useEffect(() => {
    if (finaleActive) {
      // Start celebration orbit from current camera azimuth around the center tree
      finaleAngleRef.current = Math.atan2(camera.position.x, camera.position.z);
    }
  }, [finaleActive, camera]);

  useEffect(() => {
    const dom = gl.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      if (!hasStarted || finaleActive) return;
      isDraggingRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!hasStarted || finaleActive || !isDraggingRef.current) return;
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };

      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        azimuthRef.current = normalizeAngle(azimuthRef.current - dx * 0.0045);
        polarRef.current = THREE.MathUtils.clamp(
          polarRef.current - dy * 0.0035,
          0.38,
          0.95,
        );
        manualCooldownRef.current = 2.6;
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (!hasStarted || finaleActive) return;
      distanceRef.current = THREE.MathUtils.clamp(
        distanceRef.current + e.deltaY * 0.004,
        6.5,
        13.5,
      );
    };

    dom.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    dom.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      dom.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      dom.removeEventListener('wheel', handleWheel);
    };
  }, [gl, hasStarted, finaleActive]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    if (!hasStarted) {
      introAngleRef.current += dt * 0.14;
      const dist = 16.5;
      _desiredPos.set(
        Math.sin(introAngleRef.current) * dist,
        8.2,
        Math.cos(introAngleRef.current) * dist,
      );
      _desiredTarget.set(0, 0.9, 0.8);

      camera.position.x = THREE.MathUtils.damp(camera.position.x, _desiredPos.x, 3, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, _desiredPos.y, 3, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, _desiredPos.z, 3, dt);

      _currentLookAt.x = THREE.MathUtils.damp(_currentLookAt.x, _desiredTarget.x, 4, dt);
      _currentLookAt.y = THREE.MathUtils.damp(_currentLookAt.y, _desiredTarget.y, 4, dt);
      _currentLookAt.z = THREE.MathUtils.damp(_currentLookAt.z, _desiredTarget.z, 4, dt);
      camera.lookAt(_currentLookAt);
      return;
    }

    if (finaleActive) {
      // Slowly orbit one smooth revolution around the blooming Dream Tree
      finaleAngleRef.current += dt * ((Math.PI * 2) / 3.8);
      const orbitDist = 8.4;
      _desiredPos.set(
        Math.sin(finaleAngleRef.current) * orbitDist,
        4.35,
        Math.cos(finaleAngleRef.current) * orbitDist,
      );
      _desiredTarget.set(0, 1.85, 0);

      camera.position.x = THREE.MathUtils.damp(camera.position.x, _desiredPos.x, 4.5, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, _desiredPos.y, 4.5, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, _desiredPos.z, 4.5, dt);

      _currentLookAt.x = THREE.MathUtils.damp(_currentLookAt.x, _desiredTarget.x, 6, dt);
      _currentLookAt.y = THREE.MathUtils.damp(_currentLookAt.y, _desiredTarget.y, 6, dt);
      _currentLookAt.z = THREE.MathUtils.damp(_currentLookAt.z, _desiredTarget.z, 6, dt);
      camera.lookAt(_currentLookAt);
      return;
    }

    if (manualCooldownRef.current > 0) {
      manualCooldownRef.current -= dt;
    } else if (!isDraggingRef.current) {
      const behindYaw = normalizeAngle(penguinYawRef.current + Math.PI);
      const diff = normalizeAngle(behindYaw - azimuthRef.current);
      azimuthRef.current = normalizeAngle(
        azimuthRef.current + diff * (1 - Math.exp(-0.55 * dt)),
      );
    }

    const pos = penguinPosRef.current;
    const dist = distanceRef.current;
    const polar = polarRef.current;
    const azim = azimuthRef.current;

    const horizDist = Math.cos(polar) * dist;
    const vertDist = Math.sin(polar) * dist;

    _desiredPos.set(
      pos.x + Math.sin(azim) * horizDist,
      pos.y + vertDist + 1.0,
      pos.z + Math.cos(azim) * horizDist,
    );
    _desiredTarget.set(pos.x, pos.y + 1.1, pos.z);

    camera.position.x = THREE.MathUtils.damp(camera.position.x, _desiredPos.x, 5.2, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, _desiredPos.y, 5.2, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, _desiredPos.z, 5.2, dt);

    _currentLookAt.x = THREE.MathUtils.damp(_currentLookAt.x, _desiredTarget.x, 7.5, dt);
    _currentLookAt.y = THREE.MathUtils.damp(_currentLookAt.y, _desiredTarget.y, 7.5, dt);
    _currentLookAt.z = THREE.MathUtils.damp(_currentLookAt.z, _desiredTarget.z, 7.5, dt);

    camera.lookAt(_currentLookAt);
  });

  return null;
}
