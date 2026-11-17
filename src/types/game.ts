import { DreamMissions } from '../data/careerGameData';

export type GradeLevel = 1 | 2 | 3 | 4;

export type ScarfColorId = 'red' | 'yellow' | 'green' | 'blue';

export type GameStage = 1 | 2 | 3 | 4 | 'complete';

/**
 * 0: 씨앗, 1: 새싹, 2: 줄기, 3: 봉오리, 4: 꽃
 */
export type GrowthStageIndex = 0 | 1 | 2 | 3 | 4;

export const GROWTH_STAGES: { index: GrowthStageIndex; label: string; emoji: string }[] = [
  { index: 0, label: '씨앗', emoji: '🌰' },
  { index: 1, label: '새싹', emoji: '🌱' },
  { index: 2, label: '줄기', emoji: '🌿' },
  { index: 3, label: '봉오리', emoji: '🌷' },
  { index: 4, label: '꽃', emoji: '🌸' },
];

export interface SelectedDream {
  id: string;
  label: string;
  emoji: string;
  color: string;
  fromUnknown?: boolean;
  missions: DreamMissions;
}

export interface ScarfColorOption {
  id: ScarfColorId;
  label: string;
  hex: string;
  ringHex: string;
}

export const PALETTE = {
  navy: '#1E2A4A',
  snow: '#F6F8FC',
  sky: '#E3EEFA',
  orange: '#F4A259',
  green: '#2F7D62',
  soil: '#6E4E37',
  seaDeep: '#5E8BB8',
  seaLight: '#8CB5DC',
} as const;

export const SCARF_COLORS: ScarfColorOption[] = [
  { id: 'red', label: '빨강', hex: '#E04F5F', ringHex: '#B83343' },
  { id: 'yellow', label: '노랑', hex: '#F6C445', ringHex: '#D19D1D' },
  { id: 'green', label: '초록', hex: '#2F7D62', ringHex: '#205B47' },
  { id: 'blue', label: '파랑', hex: '#3B82F6', ringHex: '#2563EB' },
];

export interface Waypoint {
  id: string;
  label: string;
  description: string;
  x: number;
  z: number;
}

export const ISLAND_WALK_RADIUS = 14.8;
export const ISLAND_SURFACE_RADIUS = 17.6;

export interface IslandPropPlacement {
  id: string;
  x: number;
  z: number;
  rotationY: number;
  scale: number;
}

export const PINE_TREES: IslandPropPlacement[] = [
  { id: 'tree-1', x: -13.4, z: -1.5, rotationY: 0.4, scale: 1.08 },
  { id: 'tree-2', x: -12.6, z: -9.4, rotationY: 1.2, scale: 0.95 },
  { id: 'tree-3', x: -5.2, z: -13.6, rotationY: 2.1, scale: 1.15 },
  { id: 'tree-4', x: -1.4, z: -14.2, rotationY: 0.9, scale: 0.92 },
  { id: 'tree-5', x: 3.1, z: -13.4, rotationY: 2.8, scale: 1.1 },
  { id: 'tree-6', x: 12.8, z: -1.8, rotationY: 1.7, scale: 1.02 },
  { id: 'tree-7', x: 13.6, z: 3.4, rotationY: 0.3, scale: 0.9 },
  { id: 'tree-8', x: 11.4, z: -9.8, rotationY: 2.4, scale: 1.05 },
  { id: 'tree-9', x: -12.8, z: 5.8, rotationY: 1.1, scale: 0.98 },
  { id: 'tree-10', x: -4.2, z: 13.5, rotationY: 0.6, scale: 0.94 },
  { id: 'tree-11', x: 4.5, z: 13.4, rotationY: 1.9, scale: 1.0 },
  { id: 'tree-12', x: -9.5, z: -11.5, rotationY: 2.5, scale: 0.88 },
  { id: 'tree-13', x: 7.4, z: -11.8, rotationY: 0.2, scale: 0.96 },
  { id: 'tree-14', x: 11.2, z: 9.6, rotationY: 1.5, scale: 0.88 },
];

export interface CabinPlacement extends IslandPropPlacement {
  wallColor: string;
  roofTrimColor: string;
}

export const ISLAND_CABINS: CabinPlacement[] = [
  {
    id: 'cabin-west',
    x: -9.8,
    z: 8.8,
    rotationY: 0.72,
    scale: 1.0,
    wallColor: '#F6F8FC',
    roofTrimColor: '#2F7D62',
  },
  {
    id: 'cabin-east',
    x: 10.4,
    z: -5.8,
    rotationY: -1.95,
    scale: 1.06,
    wallColor: '#FFF5EA',
    roofTrimColor: '#F4A259',
  },
  {
    id: 'cabin-north-west',
    x: -10.2,
    z: -5.6,
    rotationY: 2.05,
    scale: 0.94,
    wallColor: '#EDF3FA',
    roofTrimColor: '#1E2A4A',
  },
];

export const ISLAND_SNOWMEN: IslandPropPlacement[] = [
  { id: 'snowman-east', x: 8.2, z: 6.2, rotationY: -2.25, scale: 1.08 },
  { id: 'snowman-west', x: -8.2, z: 2.2, rotationY: 1.35, scale: 1.02 },
  { id: 'snowman-north', x: -1.2, z: -10.6, rotationY: 0.15, scale: 1.05 },
];

export interface CircleObstacle {
  x: number;
  z: number;
  radius: number;
}

export const ISLAND_OBSTACLES: CircleObstacle[] = [
  // Center Dream Pot
  { x: 0, z: 0, radius: 2.55 },
  // Cabins
  ...ISLAND_CABINS.map((c) => ({ x: c.x, z: c.z, radius: 2.05 * c.scale })),
  // Snowmen
  ...ISLAND_SNOWMEN.map((s) => ({ x: s.x, z: s.z, radius: 0.95 * s.scale })),
  // Pine trees
  ...PINE_TREES.map((t) => ({ x: t.x, z: t.z, radius: 1.05 * t.scale })),
];

export const ISLAND_WAYPOINTS: Waypoint[] = [
  {
    id: 'dream-pot',
    label: '꿈 화분',
    description: '섬 가운데 꿈 화분 앞에 왔어요.',
    x: 0,
    z: 3.4,
  },
  {
    id: 'snowman',
    label: '눈사람 친구',
    description: '귀여운 눈사람 친구 옆에 왔어요.',
    x: 6.4,
    z: 6.2,
  },
  {
    id: 'cabin-east',
    label: '따뜻한 오두막',
    description: '주황 불빛이 반짝이는 오두막이에요.',
    x: 7.2,
    z: -4.2,
  },
  {
    id: 'pine-grove',
    label: '소나무 숲',
    description: '초록 소나무가 가득한 북쪽 숲이에요.',
    x: -1.6,
    z: -10.0,
  },
  {
    id: 'cabin-west',
    label: '겨울 작은 집',
    description: '초록 지붕 작은 집 앞에 왔어요.',
    x: -6.8,
    z: 6.4,
  },
];

export const OX_GATES_POSITIONS = {
  O: { x: -3.2, z: -6.2 },
  X: { x: 3.2, z: -6.2 },
};

export interface SeedOrbPlacement {
  id: string;
  x: number;
  z: number;
}

// 13 orbs placed cleanly in an open plaza ring around the Dream Pot (radius ~ 5.6 - 6.8)
export function getSeedOrbPositions(count: number): { x: number; z: number }[] {
  const positions: { x: number; z: number }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? 5.4 : 6.4;
    positions.push({
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
    });
  }
  return positions;
}
