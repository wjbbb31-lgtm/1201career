import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

interface SkyAndSnowProps {
  lowSpec: boolean;
}

const SNOW_COUNT = 180; // Keeps total scene particles <= 300 with effects

function createSnowflakeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(16, 16, 2, 16, 16, 15);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.55, 'rgba(246, 248, 252, 0.85)');
    grad.addColorStop(1, 'rgba(246, 248, 252, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function SkyAndSnow({ lowSpec }: SkyAndSnowProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const skyUniforms = useMemo(
    () => ({
      topColor: { value: new THREE.Color('#B5D5F5') },
      midColor: { value: new THREE.Color('#E3EEFA') },
      bottomColor: { value: new THREE.Color('#F6F8FC') },
    }),
    [],
  );

  const { positions, speeds, drifts, phases } = useMemo(() => {
    const pos = new Float32Array(SNOW_COUNT * 3);
    const spd = new Float32Array(SNOW_COUNT);
    const drf = new Float32Array(SNOW_COUNT);
    const phs = new Float32Array(SNOW_COUNT);

    for (let i = 0; i < SNOW_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 44;
      pos[i * 3 + 1] = Math.random() * 20 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 44;
      spd[i] = 1.1 + Math.random() * 1.1;
      drf[i] = 0.25 + Math.random() * 0.45;
      phs[i] = Math.random() * Math.PI * 2;
    }

    return { positions: pos, speeds: spd, drifts: drf, phases: phs };
  }, []);

  const snowTexture = useMemo(() => createSnowflakeTexture(), []);

  useEffect(() => {
    return () => {
      snowTexture.dispose();
    };
  }, [snowTexture]);

  useFrame((state, delta) => {
    if (lowSpec || !pointsRef.current) return;
    const clampedDelta = Math.min(delta, 0.05);
    const attr = pointsRef.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const elapsed = state.clock.elapsedTime;

    for (let i = 0; i < SNOW_COUNT; i++) {
      const idx = i * 3;
      arr[idx + 1] -= speeds[i] * clampedDelta;
      arr[idx] += Math.sin(elapsed * 0.9 + phases[i]) * drifts[i] * clampedDelta;

      if (arr[idx + 1] < -0.5) {
        arr[idx + 1] = 20.5;
        arr[idx] = (Math.random() - 0.5) * 44;
        arr[idx + 2] = (Math.random() - 0.5) * 44;
      }
    }

    attr.needsUpdate = true;
  });

  return (
    <group>
      {/* Sky gradient dome */}
      <mesh scale={140} frustumCulled={false}>
        <sphereGeometry args={[1, 24, 16]} />
        <shaderMaterial
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={skyUniforms}
          vertexShader={`
            varying vec3 vWorldPosition;
            void main() {
              vec4 worldPosition = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPosition.xyz;
              gl_Position = projectionMatrix * viewMatrix * worldPosition;
            }
          `}
          fragmentShader={`
            uniform vec3 topColor;
            uniform vec3 midColor;
            uniform vec3 bottomColor;
            varying vec3 vWorldPosition;
            void main() {
              float h = clamp(normalize(vWorldPosition).y, 0.0, 1.0);
              vec3 col = mix(bottomColor, midColor, smoothstep(0.0, 0.28, h));
              col = mix(col, topColor, smoothstep(0.28, 0.9, h));
              gl_FragColor = vec4(col, 1.0);
            }
          `}
        />
      </mesh>

      {/* Gently falling snowflakes (disabled in low-spec mode) */}
      {!lowSpec && (
        <points ref={pointsRef} frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            map={snowTexture}
            size={0.34}
            transparent
            opacity={0.92}
            depthWrite={false}
            sizeAttenuation
            color="#FFFFFF"
          />
        </points>
      )}
    </group>
  );
}
