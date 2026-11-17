import {
  DREAM_SEED_OPTIONS,
  INTEREST_SEED_OPTIONS,
} from '../data/careerGameData';

const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/6wstkn3uv9v1m';

const LOCAL_SAVED_FLAG_PREFIX = 'dream_seed_sheet_saved_v1_';
const LOCAL_CARDS_BACKUP_KEY = 'dream_seed_local_backup_v1';

export interface StudentDreamCardInput {
  attemptId: string;
  class_code: string;
  nickname: string;
  grade: number;
  dream: string;
  likes: string;
  curious: string;
  good_at: string;
  missions: string[];
  frequency: string;
  promise: string;
  quiz_score: number;
}

export interface StudentDreamCard {
  id: string;
  created_at: string;
  class_code: string;
  nickname: string;
  grade: number;
  dream: string;
  dream_emoji: string;
  dream_color: string;
  likes: string;
  curious: string;
  good_at: string;
  missions: string[];
  frequency: string;
  promise: string;
  quiz_score: number;
}

export interface SaveCardResult {
  savedToSheet: boolean;
  message: string;
}

interface SheetRowPayload {
  created_at: string;
  class_code: string;
  nickname: string;
  grade: number;
  dream: string;
  likes: string;
  curious: string;
  good_at: string;
  missions: string;
  frequency: string;
  promise: string;
  quiz_score: number;
}

interface RawSheetRow {
  created_at?: string;
  class_code?: string;
  nickname?: string;
  grade?: string | number;
  dream?: string;
  likes?: string;
  curious?: string;
  good_at?: string;
  missions?: string;
  frequency?: string;
  promise?: string;
  quiz_score?: string | number;
}

function toShortFrequency(freq: string): string {
  if (freq.includes('1')) return '주 1회';
  if (freq.includes('2')) return '주 2회';
  if (freq.includes('3')) return '주 3회';
  return freq || '주 1회';
}

function resolveDreamMeta(dreamName: string): { emoji: string; color: string } {
  const clean = dreamName.trim();
  const fromCareer = DREAM_SEED_OPTIONS.find(
    (d) => d.label === clean || clean.includes(d.label),
  );
  if (fromCareer) {
    return { emoji: fromCareer.emoji, color: fromCareer.color };
  }

  const fromInterest = INTEREST_SEED_OPTIONS.find(
    (i) => i.label === clean || clean.includes(i.label),
  );
  if (fromInterest) {
    return { emoji: fromInterest.emoji, color: fromInterest.color };
  }

  return { emoji: '🌱', color: '#F4A259' };
}

function parseSheetRow(row: RawSheetRow, fallbackIndex: number): StudentDreamCard {
  const dream = String(row.dream || '꿈 씨앗').trim();
  const meta = resolveDreamMeta(dream);
  const createdAt = String(row.created_at || '').trim() || `row-${fallbackIndex}`;
  const nickname = String(row.nickname || '멋진 펭귄').trim();
  const rawMissions = String(row.missions || '').trim();
  const missions = rawMissions
    ? rawMissions
        .split(', ')
        .map((m) => m.trim())
        .filter(Boolean)
    : [];

  return {
    id: `${createdAt}::${nickname}`,
    created_at: createdAt,
    class_code: String(row.class_code || '').trim().toUpperCase(),
    nickname,
    grade: Number(row.grade) || 1,
    dream,
    dream_emoji: meta.emoji,
    dream_color: meta.color,
    likes: String(row.likes || '').trim(),
    curious: String(row.curious || '').trim(),
    good_at: String(row.good_at || '').trim(),
    missions,
    frequency: String(row.frequency || '').trim(),
    promise: String(row.promise || '').trim(),
    quiz_score: Number(row.quiz_score) || 0,
  };
}

function saveLocalBackup(payload: SheetRowPayload): void {
  try {
    const raw = window.localStorage.getItem(LOCAL_CARDS_BACKUP_KEY);
    const list: SheetRowPayload[] = raw ? JSON.parse(raw) : [];
    const exists = list.some(
      (item) =>
        item.created_at === payload.created_at &&
        item.nickname === payload.nickname,
    );
    if (!exists) {
      list.push(payload);
      window.localStorage.setItem(LOCAL_CARDS_BACKUP_KEY, JSON.stringify(list));
    }
  } catch {
    // Ignore localStorage quota errors
  }
}

export async function saveDreamCard(
  input: StudentDreamCardInput,
): Promise<SaveCardResult> {
  const flagKey = `${LOCAL_SAVED_FLAG_PREFIX}${input.attemptId}`;

  // Prevent duplicate POST on refresh or repeated button clicks
  try {
    if (window.localStorage.getItem(flagKey) === '1') {
      return {
        savedToSheet: true,
        message: '카드는 내 기기에 잘 저장됐어요',
      };
    }
  } catch {
    // Continue if localStorage is restricted
  }

  const payload: SheetRowPayload = {
    created_at: new Date().toISOString(),
    class_code: input.class_code.trim().toUpperCase(),
    nickname: input.nickname.trim(),
    grade: input.grade,
    dream: input.dream.trim(),
    likes: input.likes.trim(),
    curious: input.curious.trim(),
    good_at: input.good_at.trim(),
    missions: input.missions.join(', '),
    frequency: toShortFrequency(input.frequency),
    promise: input.promise.trim(),
    quiz_score: input.quiz_score,
  };

  saveLocalBackup(payload);

  try {
    const response = await fetch(SHEETDB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: [payload] }),
    });

    if (!response.ok) {
      console.error(
        `[SheetDB] 카드 저장 오류 (HTTP ${response.status})`,
        response.statusText,
      );
      return {
        savedToSheet: false,
        message: '카드는 내 기기에 잘 저장됐어요',
      };
    }

    try {
      window.localStorage.setItem(flagKey, '1');
    } catch {
      // Ignore storage write error
    }

    return {
      savedToSheet: true,
      message: '카드는 내 기기에 잘 저장됐어요',
    };
  } catch (err) {
    console.error('[SheetDB] 카드 저장 연결 실패:', err);
    return {
      savedToSheet: false,
      message: '카드는 내 기기에 잘 저장됐어요',
    };
  }
}

export async function fetchDreamCardsByClass(
  classCode: string,
): Promise<StudentDreamCard[]> {
  const normalizedCode = classCode.trim().toUpperCase();
  const url = normalizedCode
    ? `${SHEETDB_API_URL}/search?class_code=${encodeURIComponent(normalizedCode)}`
    : SHEETDB_API_URL;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(
        `[SheetDB] 반 카드 불러오기 오류 (HTTP ${response.status})`,
        response.statusText,
      );
      throw new Error('잠시 후 다시 불러올게요');
    }

    const rows = (await response.json()) as RawSheetRow[];
    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map((row, idx) => parseSheetRow(row, idx));
  } catch (err) {
    console.error('[SheetDB] 반 카드 불러오기 실패:', err);
    throw new Error('잠시 후 다시 불러올게요');
  }
}
