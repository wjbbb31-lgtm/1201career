import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { ArrowLeft, RefreshCw, Trees, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { PALETTE } from '../../types/game';
import { detectDeviceCapabilities } from '../../utils/device';
import {
  StudentDreamCard,
  fetchDreamCardsByClass,
} from '../../utils/sheetClient';
import { SkyAndSnow } from '../scene/SkyAndSnow';

interface TeacherForestViewProps {
  classCode: string;
  lowSpec: boolean;
  onToggleLowSpec: () => void;
  onExit: () => void;
}

const POLL_INTERVAL_MS = 15000;

function ForestTree({
  card,
  x,
  z,
  animateGrow,
  enableShadows,
}: {
  card: StudentDreamCard;
  x: number;
  z: number;
  animateGrow: boolean;
  enableShadows: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(animateGrow ? 0.02 : 1.0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    if (scaleRef.current < 0.999) {
      scaleRef.current = THREE.MathUtils.damp(scaleRef.current, 1.0, 4.0, dt);
    } else {
      scaleRef.current = 1.0;
    }
    const s = scaleRef.current;
    groupRef.current.scale.set(s, s, s);
    groupRef.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 0.7 + x + z) * 0.06;
  });

  const flowerColor = card.dream_color || PALETTE.orange;

  return (
    <group position={[x, 0, z]}>
      {/* Pot / snow ring base */}
      <mesh position={[0, 0.12, 0]} receiveShadow={enableShadows}>
        <cylinderGeometry args={[0.92, 1.05, 0.24, 14]} />
        <meshStandardMaterial color={PALETTE.green} roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 0.22, 0]} receiveShadow={enableShadows}>
        <cylinderGeometry args={[0.8, 0.8, 0.08, 14]} />
        <meshStandardMaterial color={PALETTE.soil} roughness={0.95} />
      </mesh>

      {/* Tree trunk, canopy, and dream-colored blossoms */}
      <group
        ref={groupRef}
        position={[0, 0.24, 0]}
        scale={animateGrow ? 0.02 : 1}
      >
        <mesh position={[0, 0.78, 0]} castShadow={enableShadows}>
          <cylinderGeometry args={[0.15, 0.24, 1.56, 8]} />
          <meshStandardMaterial color={PALETTE.soil} roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.65, 0]} castShadow={enableShadows}>
          <dodecahedronGeometry args={[0.9, 1]} />
          <meshStandardMaterial color={PALETTE.green} roughness={0.72} flatShading />
        </mesh>
        <mesh position={[-0.55, 1.42, 0.25]} castShadow={enableShadows}>
          <dodecahedronGeometry args={[0.52, 1]} />
          <meshStandardMaterial color="#378B6E" roughness={0.72} flatShading />
        </mesh>
        <mesh position={[0.55, 1.44, -0.22]} castShadow={enableShadows}>
          <dodecahedronGeometry args={[0.52, 1]} />
          <meshStandardMaterial color="#378B6E" roughness={0.72} flatShading />
        </mesh>

        {/* Crown Blossom */}
        <group position={[0, 2.52, 0]}>
          <mesh>
            <sphereGeometry args={[0.24, 10, 8]} />
            <meshStandardMaterial
              color="#F6C445"
              emissive="#F6C445"
              emissiveIntensity={0.3}
            />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((p) => {
            const a = (p / 6) * Math.PI * 2;
            return (
              <mesh
                key={p}
                position={[Math.cos(a) * 0.34, 0.03, Math.sin(a) * 0.34]}
                scale={[1.15, 0.65, 1.15]}
              >
                <sphereGeometry args={[0.21, 8, 8]} />
                <meshStandardMaterial color={flowerColor} roughness={0.45} />
              </mesh>
            );
          })}
        </group>

        {/* Side blossoms */}
        {[
          [-0.65, 1.7, 0.45],
          [0.62, 1.72, 0.36],
          [0.08, 1.7, -0.74],
          [-0.36, 1.98, -0.4],
          [0.42, 1.95, 0.48],
        ].map(([bx, by, bz], idx) => (
          <mesh key={idx} position={[bx, by, bz]}>
            <sphereGeometry args={[0.16, 8, 8]} />
            <meshStandardMaterial
              color={flowerColor}
              emissive={flowerColor}
              emissiveIntensity={0.2}
            />
          </mesh>
        ))}

        <Html position={[0, 3.25, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="px-3 py-1.5 rounded-2xl bg-[#F6F8FC]/95 border-2 border-[#1E2A4A] text-[#1E2A4A] shadow-md text-center whitespace-nowrap">
            <p className="text-sm sm:text-base font-extrabold">
              <span aria-hidden="true">{card.dream_emoji} </span>
              <span>{card.nickname}</span>
            </p>
            <p className="text-xs font-bold text-[#2F7D62]">{card.dream}</p>
          </div>
        </Html>
      </group>
    </group>
  );
}

export function TeacherForestView({
  classCode,
  lowSpec,
  onToggleLowSpec,
  onExit,
}: TeacherForestViewProps) {
  const [cards, setCards] = useState<StudentDreamCard[]>([]);
  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const knownIdsRef = useRef<Set<string>>(new Set());
  const isFirstFetchRef = useRef(true);

  const caps = useMemo(() => detectDeviceCapabilities(), []);
  const enableShadows = caps.isDesktopPC && !lowSpec && !caps.isSoftwareGl;

  const loadCards = useCallback(async () => {
    try {
      const result = await fetchDreamCardsByClass(classCode);

      if (isFirstFetchRef.current) {
        isFirstFetchRef.current = false;
        const initialSet = new Set(result.map((c) => c.id));
        knownIdsRef.current = initialSet;
        setNewlyAddedIds(new Set());
      } else {
        const added = new Set<string>();
        for (const c of result) {
          if (!knownIdsRef.current.has(c.id)) {
            added.add(c.id);
            knownIdsRef.current.add(c.id);
          }
        }
        if (added.size > 0) {
          setNewlyAddedIds((prev) => new Set([...prev, ...added]));
        }
      }

      setCards(result);
      setError('');
    } catch {
      setError('잠시 후 다시 불러올게요');
    } finally {
      setLoading(false);
    }
  }, [classCode]);

  useEffect(() => {
    let intervalId: number | null = null;

    const startPolling = () => {
      if (intervalId !== null) return;
      intervalId = window.setInterval(() => {
        if (document.visibilityState === 'visible') {
          loadCards();
        }
      }, POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadCards();
        startPolling();
      } else {
        stopPolling();
      }
    };

    // Fetch once immediately when teacher screen opens
    if (document.visibilityState === 'visible') {
      loadCards();
      startPolling();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadCards]);

  // Grid positions for all student trees
  const treePositions = useMemo(() => {
    const count = cards.length;
    if (count === 0) return [];
    const cols = Math.max(1, Math.ceil(Math.sqrt(count)));
    const rows = Math.ceil(count / cols);
    const spacing = 4.5;

    return cards.map((card, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = (col - (cols - 1) / 2) * spacing;
      const z = (row - (rows - 1) / 2) * spacing;
      return { card, x, z };
    });
  }, [cards]);

  // TOP 5 Popular Dreams
  const topDreams = useMemo(() => {
    const map = new Map<
      string,
      { label: string; emoji: string; color: string; count: number }
    >();
    for (const c of cards) {
      const prev = map.get(c.dream);
      if (prev) {
        prev.count += 1;
      } else {
        map.set(c.dream, {
          label: c.dream,
          emoji: c.dream_emoji,
          color: c.dream_color,
          count: 1,
        });
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [cards]);

  // Popular Missions Ranking
  const topMissions = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of cards) {
      for (const m of c.missions) {
        map.set(m, (map.get(m) ?? 0) + 1);
      }
    }
    return Array.from(map.entries())
      .map(([mission, count]) => ({ mission, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [cards]);

  return (
    <div className="fixed inset-0 flex flex-col lg:flex-row bg-[#DCEBFA] text-[#1E2A4A]">
      {/* Left/Main 3D Dream Forest Viewport */}
      <div className="relative flex-1 min-h-[52vh] lg:min-h-full">
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 min-h-[46px] px-4 py-2 rounded-2xl bg-[#F6F8FC]/95 hover:bg-[#E3EEFA] border-2 border-[#C8DCF0] text-base font-extrabold shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            <span>시작 화면으로</span>
          </button>

          <button
            type="button"
            onClick={onToggleLowSpec}
            className={`min-h-[46px] px-3.5 py-2 rounded-2xl border-2 text-sm font-extrabold shadow-md cursor-pointer ${
              lowSpec
                ? 'bg-[#2F7D62] text-[#F6F8FC] border-[#205B47]'
                : 'bg-[#F6F8FC]/95 text-[#1E2A4A] border-[#C8DCF0]'
            }`}
          >
            {lowSpec ? '저사양 모드 켜짐' : '저사양 모드'}
          </button>
        </div>

        <Canvas
          key={lowSpec ? 'teacher-low' : 'teacher-std'}
          dpr={lowSpec ? 1 : [1, 1.5]}
          shadows={enableShadows}
          gl={{
            antialias: !lowSpec,
            powerPreference: 'high-performance',
          }}
          camera={{ position: [0, 12, 19], fov: 46, near: 0.2, far: 240 }}
        >
          <color attach="background" args={['#DCEBFA']} />
          <fog attach="fog" args={['#DCEBFA', 35, 115]} />

          <hemisphereLight args={['#E3EEFA', '#9EB6D2', 0.95]} />
          <directionalLight
            position={[18, 28, 16]}
            intensity={1.35}
            color="#FFF4E0"
            castShadow={enableShadows}
            shadow-mapSize={[1024, 1024]}
            shadow-camera-left={-28}
            shadow-camera-right={28}
            shadow-camera-top={28}
            shadow-camera-bottom={-28}
          />
          <directionalLight position={[-14, 12, -16]} intensity={0.45} color="#B8D6F6" />

          <SkyAndSnow lowSpec={lowSpec} />

          <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={enableShadows}>
            <circleGeometry args={[75, 48]} />
            <meshStandardMaterial color={PALETTE.snow} roughness={0.82} />
          </mesh>

          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[28, 28.4, 48]} />
            <meshBasicMaterial color="#B7CFE8" transparent opacity={0.5} />
          </mesh>

          {treePositions.map(({ card, x, z }) => (
            <ForestTree
              key={card.id}
              card={card}
              x={x}
              z={z}
              animateGrow={newlyAddedIds.has(card.id)}
              enableShadows={enableShadows}
            />
          ))}

          <OrbitControls
            autoRotate
            autoRotateSpeed={0.65}
            enableDamping
            dampingFactor={0.05}
            minDistance={8}
            maxDistance={46}
            minPolarAngle={0.25}
            maxPolarAngle={Math.PI / 2.25}
            target={[0, 1.5, 0]}
          />
        </Canvas>

        {cards.length === 0 && !loading && !error && (
          <div className="absolute inset-x-4 bottom-6 flex justify-center pointer-events-none">
            <div className="rounded-2xl bg-[#F6F8FC]/95 border-2 border-[#C8DCF0] shadow-lg px-6 py-4 text-center max-w-md">
              <p className="font-display text-2xl text-[#1E2A4A]">
                아직 자란 나무가 없어요
              </p>
              <p className="text-base font-bold text-[#1E2A4A]/75 mt-1">
                학생이 꿈 실천 카드를 완성하면 여기에 나무가 쑥 자라나요!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right-Side Large-Text Dashboard Panel */}
      <aside className="w-full lg:w-[440px] xl:w-[480px] bg-[#F6F8FC] border-t-2 lg:border-t-0 lg:border-l-2 border-[#C8DCF0] p-5 sm:p-6 overflow-y-auto flex flex-col gap-5 shrink-0">
        <div className="flex items-start justify-between gap-3 pb-4 border-b-2 border-[#D8E5F3]">
          <div>
            <p className="text-base font-extrabold text-[#2F7D62]">
              수업 코드: {classCode || '전체 반'}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl text-[#1E2A4A] mt-0.5">
              우리 반 꿈 숲
            </h1>
          </div>
          <button
            type="button"
            onClick={loadCards}
            className="inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-xl bg-[#E3EEFA] hover:bg-[#D2E4F8] border-2 border-[#B6CEE8] text-base font-extrabold cursor-pointer shrink-0 whitespace-nowrap"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>지금 새로고침</span>
          </button>
        </div>

        {error && (
          <div className="rounded-2xl bg-[#FFF5EA] border-2 border-[#F4A259] p-3.5 text-lg font-extrabold text-[#1E2A4A]">
            {error}
          </div>
        )}

        <div className="rounded-3xl bg-[#1E2A4A] text-[#F6F8FC] p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-[#F4A259] shrink-0" aria-hidden="true" />
            <span className="text-xl sm:text-2xl font-extrabold">참여 학생 수</span>
          </div>
          <span className="font-display text-4xl sm:text-5xl tabular-nums text-[#F4A259]">
            {cards.length}명
          </span>
        </div>

        <section className="rounded-3xl bg-white border-2 border-[#C8DCF0] p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Trees className="w-6 h-6 text-[#2F7D62]" aria-hidden="true" />
            <h2 className="font-display text-2xl text-[#1E2A4A]">
              인기 꿈 순위 TOP 5
            </h2>
          </div>

          {topDreams.length === 0 ? (
            <p className="text-base font-bold text-[#1E2A4A]/65">
              학생들이 꿈 씨앗을 심으면 순위가 나타나요.
            </p>
          ) : (
            <ol className="flex flex-col gap-2.5">
              {topDreams.map((item, idx) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-[#E3EEFA]/75"
                >
                  <div className="flex items-center gap-2.5 text-lg sm:text-xl font-extrabold">
                    <span className="w-7 text-center text-[#2F7D62] tabular-nums">
                      {idx + 1}.
                    </span>
                    <span aria-hidden="true">{item.emoji}</span>
                    <span>{item.label}</span>
                  </div>
                  <span className="text-lg sm:text-xl font-extrabold text-[#1E2A4A] tabular-nums">
                    {item.count}명
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="rounded-3xl bg-white border-2 border-[#C8DCF0] p-5 flex flex-col gap-3">
          <h2 className="font-display text-2xl text-[#1E2A4A]">
            인기 미션 순위
          </h2>

          {topMissions.length === 0 ? (
            <p className="text-base font-bold text-[#1E2A4A]/65">
              선물상자에서 고른 겨울방학 미션이 모여요.
            </p>
          ) : (
            <ol className="flex flex-col gap-2.5">
              {topMissions.map((item, idx) => (
                <li
                  key={item.mission}
                  className="flex items-start justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-[#FFF5EA] border border-[#F4A259]/50"
                >
                  <div className="flex items-start gap-2 text-base sm:text-lg font-extrabold leading-snug">
                    <span className="text-[#2F7D62] tabular-nums shrink-0">
                      {idx + 1}.
                    </span>
                    <span>{item.mission}</span>
                  </div>
                  <span className="text-base sm:text-lg font-extrabold text-[#1E2A4A] tabular-nums shrink-0">
                    {item.count}명
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </aside>
    </div>
  );
}
