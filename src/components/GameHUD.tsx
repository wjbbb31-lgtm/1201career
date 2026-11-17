import { Award, Compass, Gauge, Navigation, RotateCcw } from 'lucide-react';
import { OxQuizQuestion } from '../data/careerGameData';
import {
  GROWTH_STAGES,
  GameStage,
  GradeLevel,
  GrowthStageIndex,
  SCARF_COLORS,
  ScarfColorId,
} from '../types/game';
import { SpeakButton } from './SpeakButton';

interface GameHUDProps {
  classCode: string;
  grade: GradeLevel;
  nickname: string;
  scarfColor: ScarfColorId;
  onScarfColorChange: (color: ScarfColorId) => void;
  autoMove: boolean;
  onToggleAutoMove: () => void;
  lowSpec: boolean;
  onToggleLowSpec: () => void;
  onResetCamera: () => void;
  hasStarted: boolean;
  gameStage: GameStage;
  growthStage: GrowthStageIndex;
  stageInstruction: string;
  // Stage 3 quiz banner
  currentOxQuestion: OxQuizQuestion | null;
  oxIndex: number;
  oxTotal: number;
  quizLocked: boolean;
  onAnswerOx: (choice: 'O' | 'X') => void;
  // Stage 4 mission count & next CTA
  selectedMissionCount: number;
  onOpenPlanModal: () => void;
  // Complete stage
  onOpenCompletionCard: () => void;
}

export function GameHUD({
  classCode,
  grade,
  nickname,
  scarfColor,
  onScarfColorChange,
  autoMove,
  onToggleAutoMove,
  lowSpec,
  onToggleLowSpec,
  onResetCamera,
  hasStarted,
  gameStage,
  growthStage,
  stageInstruction,
  currentOxQuestion,
  oxIndex,
  oxTotal,
  quizLocked,
  onAnswerOx,
  selectedMissionCount,
  onOpenPlanModal,
  onOpenCompletionCard,
}: GameHUDProps) {
  return (
    <>
      {/* Top-Right Corner: Low-Spec Mode Toggle */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleLowSpec}
          aria-pressed={lowSpec}
          className={`inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-2xl border-2 text-sm sm:text-base font-extrabold shadow-md transition-colors cursor-pointer whitespace-nowrap ${
            lowSpec
              ? 'bg-[#2F7D62] text-[#F6F8FC] border-[#205B47]'
              : 'bg-[#F6F8FC]/95 text-[#1E2A4A] border-[#C8DCF0] hover:bg-[#E3EEFA]'
          }`}
        >
          <Gauge className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{lowSpec ? '저사양 모드 켜짐' : '저사양 모드'}</span>
        </button>
      </div>

      {hasStarted && (
        <>
          {/* Top-Left: Student Identity & Stage Guidance */}
          <div className="fixed top-3 left-3 sm:top-4 sm:left-4 z-10 max-w-[calc(100vw-165px)] sm:max-w-sm pointer-events-auto">
            <div className="rounded-2xl bg-[#F6F8FC]/95 border-2 border-[#C8DCF0] shadow-lg p-3 sm:p-3.5 text-[#1E2A4A]">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm font-extrabold text-[#2F7D62]">
                <span>{nickname}</span>
                <span aria-hidden="true">·</span>
                <span>{grade}학년</span>
                {classCode.trim() && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>코드 {classCode.trim()}</span>
                  </>
                )}
              </div>

              {/* Compact 5-step growth strip for screens < xl */}
              <div className="mt-1.5 flex items-center gap-1 flex-wrap xl:hidden text-[11px] sm:text-xs font-extrabold">
                {GROWTH_STAGES.map((s, idx) => (
                  <span key={s.index} className="inline-flex items-center gap-1">
                    <span
                      className={`px-1.5 py-0.5 rounded-lg ${
                        s.index === growthStage
                          ? 'bg-[#F4A259] text-[#1E2A4A]'
                          : s.index < growthStage
                            ? 'bg-[#2F7D62] text-[#F6F8FC]'
                            : 'bg-[#E3EEFA] text-[#1E2A4A]/55'
                      }`}
                    >
                      {s.label}
                    </span>
                    {idx < GROWTH_STAGES.length - 1 && (
                      <span className="text-[#9BB5D2]" aria-hidden="true">
                        →
                      </span>
                    )}
                  </span>
                ))}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm sm:text-base font-extrabold text-[#1E2A4A] leading-snug">
                  {stageInstruction}
                </p>
                <SpeakButton text={stageInstruction} compact />
              </div>

              {/* Stage 4 Action Banner when 2~3 missions selected */}
              {gameStage === 4 && (
                <div className="mt-2.5 pt-2.5 border-t border-[#D8E5F3] flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-extrabold text-[#2F7D62]">
                    미션 {selectedMissionCount}개 골랐어요 (2~3개)
                  </span>
                  {selectedMissionCount >= 2 && (
                    <button
                      type="button"
                      onClick={onOpenPlanModal}
                      className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#F4A259] hover:bg-[#EB9244] border-2 border-[#D98236] text-sm font-extrabold text-[#1E2A4A] cursor-pointer whitespace-nowrap"
                    >
                      약속 정하기 →
                    </button>
                  )}
                </div>
              )}

              {/* Complete Stage Banner */}
              {gameStage === 'complete' && (
                <div className="mt-2.5 pt-2.5 border-t border-[#D8E5F3]">
                  <button
                    type="button"
                    onClick={onOpenCompletionCard}
                    className="w-full min-h-[42px] px-3.5 py-1.5 rounded-xl bg-[#F4A259] hover:bg-[#EB9244] border-2 border-[#D98236] text-sm sm:text-base font-extrabold text-[#1E2A4A] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>내 꿈 카드 다시 보기</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stage 3 OX Quiz Top Banner */}
          {gameStage === 3 && currentOxQuestion && (
            <div className="fixed top-[178px] xl:top-[76px] left-1/2 -translate-x-1/2 z-10 w-[calc(100vw-24px)] max-w-lg pointer-events-auto">
              <div className="rounded-3xl bg-[#F6F8FC]/97 border-2 border-[#1E2A4A] shadow-xl px-4 py-3.5 sm:px-6 sm:py-4 text-[#1E2A4A]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm sm:text-base font-extrabold text-[#2F7D62]">
                    OX 얼음문 퀴즈 ({oxIndex + 1} / {oxTotal})
                  </span>
                  <SpeakButton
                    text={`문제 ${oxIndex + 1}번. ${currentOxQuestion.statement} 맞으면 O, 아니면 X 얼음문으로 가거나 버튼을 눌러요.`}
                    compact
                  />
                </div>
                <p className="font-display text-xl sm:text-2xl text-[#1E2A4A] mt-1.5 leading-snug">
                  “{currentOxQuestion.statement}”
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={quizLocked}
                    onClick={() => onAnswerOx('O')}
                    className="min-h-[48px] px-4 py-2 rounded-2xl bg-[#2F7D62] hover:bg-[#24664F] text-[#F6F8FC] text-base sm:text-lg font-extrabold cursor-pointer transition-colors"
                  >
                    ⭕ O 맞아요
                  </button>
                  <button
                    type="button"
                    disabled={quizLocked}
                    onClick={() => onAnswerOx('X')}
                    className="min-h-[48px] px-4 py-2 rounded-2xl bg-[#E04F5F] hover:bg-[#C93B4B] text-[#F6F8FC] text-base sm:text-lg font-extrabold cursor-pointer transition-colors"
                  >
                    ❌ X 아니에요
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom-Center Compact Control Dock */}
          <div className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-10 w-[calc(100vw-24px)] max-w-2xl pointer-events-auto">
            <div className="rounded-2xl bg-[#F6F8FC]/95 border-2 border-[#C8DCF0] shadow-xl px-3 py-2.5 sm:px-4 sm:py-3 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={onToggleAutoMove}
                aria-pressed={autoMove}
                className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border-2 text-sm sm:text-base font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                  autoMove
                    ? 'bg-[#F4A259] text-[#1E2A4A] border-[#D98236]'
                    : 'bg-[#E3EEFA] text-[#1E2A4A] border-[#B6CEE8] hover:bg-[#D2E4F8]'
                }`}
              >
                <Navigation className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{autoMove ? '자동 이동 켜짐' : '자동 이동'}</span>
              </button>

              <div
                className="flex items-center gap-1.5"
                role="group"
                aria-label="목도리 색 고르기"
              >
                {SCARF_COLORS.map((c) => {
                  const selected = scarfColor === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onScarfColorChange(c.id)}
                      aria-pressed={selected}
                      aria-label={`목도리 ${c.label}`}
                      className={`inline-flex items-center gap-1.5 min-h-[44px] px-2.5 sm:px-3 py-1.5 rounded-xl border-2 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                        selected
                          ? 'bg-[#1E2A4A] text-[#F6F8FC] border-[#1E2A4A]'
                          : 'bg-white text-[#1E2A4A] border-[#C8DCF0] hover:bg-[#E3EEFA]'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white shrink-0"
                        style={{ backgroundColor: c.hex }}
                        aria-hidden="true"
                      />
                      <span className="hidden sm:inline">{c.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={onResetCamera}
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl bg-white border-2 border-[#C8DCF0] hover:bg-[#E3EEFA] text-sm sm:text-base font-extrabold text-[#1E2A4A] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Compass className="w-4 h-4 shrink-0 hidden sm:inline" aria-hidden="true" />
                <RotateCcw className="w-4 h-4 shrink-0 sm:hidden" aria-hidden="true" />
                <span>시점 맞추기</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
