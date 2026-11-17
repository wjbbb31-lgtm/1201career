import { Check, Gift } from 'lucide-react';
import {
  DreamSeedOption,
  FREQUENCY_OPTIONS,
  GiftCategory,
  INTEREST_SEED_OPTIONS,
  InterestOption,
  OxQuizQuestion,
  PLEDGE_OPTIONS,
  SnowmanQuestion,
} from '../data/careerGameData';
import { SelectedDream } from '../types/game';
import { SpeakButton } from './SpeakButton';

interface StageOverlayUIProps {
  // Stage 1
  pendingOrb: { option: DreamSeedOption; x: number; z: number } | null;
  showInterestPicker: boolean;
  onConfirmSeedOrb: () => void;
  onCancelSeedOrb: () => void;
  onSelectInterest: (interest: InterestOption) => void;
  onCancelInterestPicker: () => void;
  // Stage 2
  activeSnowmanQuestion: SnowmanQuestion | null;
  answeredSnowmen: Record<string, string>;
  onAnswerSnowman: (questionId: string, choiceLabel: string) => void;
  onCloseSnowman: () => void;
  // Stage 3
  oxFeedback: {
    question: OxQuizQuestion;
    userChoice: 'O' | 'X';
    isCorrect: boolean;
  } | null;
  onNextOxQuestion: () => void;
  // Stage 4
  activeGift: GiftCategory | null;
  selectedDream: SelectedDream | null;
  selectedMissions: Record<string, string>;
  onToggleMission: (giftId: string, missionText: string) => void;
  onCloseGift: () => void;
  onProceedToPlan: () => void;
  showPlanModal: boolean;
  selectedFrequency: string;
  onSelectFrequency: (freq: string) => void;
  selectedPledge: string;
  onSelectPledge: (pledge: string) => void;
  onBackFromPlan: () => void;
  onCompletePlan: () => void;
}

export function StageOverlayUI({
  pendingOrb,
  showInterestPicker,
  onConfirmSeedOrb,
  onCancelSeedOrb,
  onSelectInterest,
  onCancelInterestPicker,
  activeSnowmanQuestion,
  answeredSnowmen,
  onAnswerSnowman,
  onCloseSnowman,
  oxFeedback,
  onNextOxQuestion,
  activeGift,
  selectedDream,
  selectedMissions,
  onToggleMission,
  onCloseGift,
  onProceedToPlan,
  showPlanModal,
  selectedFrequency,
  onSelectFrequency,
  selectedPledge,
  onSelectPledge,
  onBackFromPlan,
  onCompletePlan,
}: StageOverlayUIProps) {
  // 1. Stage 1: Confirm Dream Seed Orb
  if (pendingOrb) {
    const { option } = pendingOrb;
    const confirmText = option.isUnknown
      ? '아직 잘 모르겠어요 씨앗을 고를까요? 좋아하는 것을 고르면 씨앗이 돼요.'
      : `${option.label} 꿈 씨앗을 고를까요?`;

    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[#1E2A4A]/45">
        <div className="w-full max-w-md rounded-3xl bg-[#F6F8FC] border-2 border-[#C8DCF0] shadow-2xl p-6 text-[#1E2A4A] flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="text-4xl" aria-hidden="true">
                {option.emoji}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl leading-snug">
                {option.isUnknown ? '아직 잘 모르겠어요' : option.label}
              </h2>
            </div>
            <SpeakButton text={confirmText} compact />
          </div>

          <p className="text-lg sm:text-xl font-extrabold text-[#1E2A4A]">
            {option.isUnknown
              ? '좋아하는 것으로 꿈 씨앗을 찾아볼까요?'
              : '이 꿈 씨앗을 고를까요?'}
          </p>

          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="button"
              onClick={onConfirmSeedOrb}
              className="w-full min-h-[54px] px-5 py-3 rounded-2xl bg-[#F4A259] hover:bg-[#EB9244] text-[#1E2A4A] border-2 border-[#D98236] text-lg sm:text-xl font-extrabold cursor-pointer transition-colors"
            >
              {option.isUnknown ? '네, 찾아볼래요!' : '네, 이 꿈 씨앗을 심을래요!'}
            </button>
            <button
              type="button"
              onClick={onCancelSeedOrb}
              className="w-full min-h-[48px] px-5 py-2.5 rounded-2xl bg-white hover:bg-[#E3EEFA] text-[#1E2A4A] border-2 border-[#C8DCF0] text-base sm:text-lg font-extrabold cursor-pointer transition-colors"
            >
              다른 씨앗도 볼래요
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Stage 1: "아직 잘 모르겠어요" Interest Picker
  if (showInterestPicker) {
    const guideText =
      '괜찮아요! 꿈은 찾아가는 거예요. 지금 좋아하는 것을 하나 골라 주세요.';
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[#1E2A4A]/45 overflow-y-auto">
        <div className="w-full max-w-xl my-auto rounded-3xl bg-[#F6F8FC] border-2 border-[#C8DCF0] shadow-2xl p-6 text-[#1E2A4A] flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm sm:text-base font-extrabold text-[#2F7D62]">
                괜찮아요! 꿈은 찾아가는 거예요
              </p>
              <h2 className="font-display text-2xl sm:text-3xl mt-1">
                요즘 무엇을 좋아하나요?
              </h2>
            </div>
            <SpeakButton text={guideText} compact />
          </div>

          <p className="text-base sm:text-lg font-bold text-[#1E2A4A]/80">
            하나를 고르면 멋진 꿈 씨앗이 돼요.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {INTEREST_SEED_OPTIONS.map((interest) => (
              <button
                key={interest.id}
                type="button"
                onClick={() => onSelectInterest(interest)}
                className="min-h-[82px] px-3 py-3 rounded-2xl bg-white hover:bg-[#FFF5EA] border-2 border-[#C8DCF0] hover:border-[#F4A259] flex flex-col items-center justify-center gap-1.5 text-base sm:text-lg font-extrabold text-[#1E2A4A] shadow-sm cursor-pointer transition-colors"
              >
                <span className="text-3xl" aria-hidden="true">
                  {interest.emoji}
                </span>
                <span>{interest.label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onCancelInterestPicker}
            className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl bg-[#E3EEFA] hover:bg-[#D2E4F8] border-2 border-[#B6CEE8] text-base font-extrabold cursor-pointer"
          >
            돌아가서 다시 볼래요
          </button>
        </div>
      </div>
    );
  }

  // 3. Stage 2: Snowman Question Modal
  if (activeSnowmanQuestion) {
    const currentAnswer = answeredSnowmen[activeSnowmanQuestion.id];
    const speakText = `${activeSnowmanQuestion.question} 아래에서 가장 가까운 생각을 하나 골라 주세요.`;

    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[#1E2A4A]/45 overflow-y-auto">
        <div className="w-full max-w-xl my-auto rounded-3xl bg-[#F6F8FC] border-2 border-[#C8DCF0] shadow-2xl p-5 sm:p-7 text-[#1E2A4A] flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm sm:text-base font-extrabold text-[#2F7D62]">
                ⛄ {activeSnowmanQuestion.title}
              </p>
              <h2 className="font-display text-2xl sm:text-4xl mt-1">
                {activeSnowmanQuestion.question}
              </h2>
            </div>
            <SpeakButton text={speakText} compact />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeSnowmanQuestion.choices.map((choice) => {
              const isSelected = currentAnswer === choice.label;
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() =>
                    onAnswerSnowman(activeSnowmanQuestion.id, choice.label)
                  }
                  className={`min-h-[60px] px-4 py-3 rounded-2xl border-2 flex items-center gap-3 text-left text-base sm:text-lg font-extrabold cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#2F7D62] text-[#F6F8FC] border-[#205B47]'
                      : 'bg-white hover:bg-[#FFF5EA] text-[#1E2A4A] border-[#C8DCF0] hover:border-[#F4A259]'
                  }`}
                >
                  <span className="text-2xl shrink-0" aria-hidden="true">
                    {choice.emoji}
                  </span>
                  <span>{choice.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onCloseSnowman}
            className="w-full min-h-[46px] px-4 py-2 rounded-2xl bg-[#E3EEFA] hover:bg-[#D2E4F8] border-2 border-[#B6CEE8] text-base font-extrabold cursor-pointer"
          >
            잠시 닫기
          </button>
        </div>
      </div>
    );
  }

  // 4. Stage 3: OX Quiz Feedback Modal (Never a failure screen!)
  if (oxFeedback) {
    const headline = oxFeedback.isCorrect
      ? '정답이에요! 정말 잘했어요!'
      : '괜찮아요, 아직 배우는 중이에요!';
    const readAll = `${headline} ${oxFeedback.question.explanation} 꿈 화분이 쑥 자라요.`;

    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[#1E2A4A]/45">
        <div className="w-full max-w-md rounded-3xl bg-[#F6F8FC] border-2 border-[#C8DCF0] shadow-2xl p-6 text-[#1E2A4A] flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl" aria-hidden="true">
                {oxFeedback.isCorrect ? '💧' : '🌱'}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl text-[#1E2A4A] leading-snug">
                {headline}
              </h2>
            </div>
            <SpeakButton text={readAll} compact />
          </div>

          <div className="rounded-2xl bg-[#E3EEFA] border border-[#C8DCF0] p-4 flex flex-col gap-2">
            <p className="text-sm sm:text-base font-extrabold text-[#2F7D62]">
              정답은 {oxFeedback.question.answer} 예요
            </p>
            <p className="text-base sm:text-lg font-extrabold text-[#1E2A4A] leading-relaxed">
              {oxFeedback.question.explanation}
            </p>
          </div>

          <p className="text-sm sm:text-base font-bold text-[#2F7D62]">
            구름이 시원한 물을 주어서 화분이 더 자랐어요!
          </p>

          <button
            type="button"
            onClick={onNextOxQuestion}
            className="w-full min-h-[56px] px-6 py-3 rounded-2xl bg-[#F4A259] hover:bg-[#EB9244] border-2 border-[#D98236] text-lg sm:text-xl font-extrabold text-[#1E2A4A] cursor-pointer transition-colors"
          >
            다음으로 가요
          </button>
        </div>
      </div>
    );
  }

  // 5. Stage 4: Gift Box Mission Modal
  if (activeGift && selectedDream) {
    const missionText = selectedDream.missions[activeGift.id];
    const isChosen = selectedMissions[activeGift.id] === missionText;
    const chosenCount = Object.keys(selectedMissions).length;
    const readText = `${activeGift.label} 선물상자예요. ${selectedDream.label} 꿈을 위한 겨울방학 미션은, ${missionText} 예요.`;

    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[#1E2A4A]/45">
        <div className="w-full max-w-md rounded-3xl bg-[#F6F8FC] border-2 border-[#C8DCF0] shadow-2xl p-6 text-[#1E2A4A] flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl" aria-hidden="true">
                {activeGift.emoji}
              </span>
              <div>
                <p className="text-sm font-extrabold text-[#2F7D62]">
                  {selectedDream.emoji} {selectedDream.label} 선물상자
                </p>
                <h2 className="font-display text-2xl sm:text-3xl">
                  {activeGift.label}
                </h2>
              </div>
            </div>
            <SpeakButton text={readText} compact />
          </div>

          <div className="rounded-2xl bg-white border-2 border-[#F4A259] p-4 shadow-sm">
            <p className="text-lg sm:text-xl font-extrabold text-[#1E2A4A] leading-relaxed">
              {missionText}
            </p>
          </div>

          <p className="text-sm sm:text-base font-bold text-[#1E2A4A]/75">
            겨울방학에 해 볼 미션을 2~3개 골라 주세요. (지금 {chosenCount}개 골랐어요)
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => onToggleMission(activeGift.id, missionText)}
              className={`w-full min-h-[54px] px-5 py-3 rounded-2xl border-2 text-lg sm:text-xl font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                isChosen
                  ? 'bg-[#2F7D62] text-[#F6F8FC] border-[#205B47]'
                  : 'bg-[#F4A259] hover:bg-[#EB9244] text-[#1E2A4A] border-[#D98236]'
              }`}
            >
              {isChosen ? (
                <>
                  <Check className="w-5 h-5" aria-hidden="true" />
                  <span>골랐어요! (누르면 빼기)</span>
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5" aria-hidden="true" />
                  <span>이 미션 고르기</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCloseGift}
              className="w-full min-h-[48px] px-5 py-2.5 rounded-2xl bg-[#E3EEFA] hover:bg-[#D2E4F8] border-2 border-[#B6CEE8] text-base font-extrabold text-[#1E2A4A] cursor-pointer"
            >
              다른 선물상자도 볼래요
            </button>

            {chosenCount >= 2 && (
              <button
                type="button"
                onClick={onProceedToPlan}
                className="w-full min-h-[52px] px-5 py-3 rounded-2xl bg-[#1E2A4A] hover:bg-[#2B3B66] text-[#F6F8FC] text-lg font-extrabold cursor-pointer transition-colors"
              >
                약속 정하러 가기 →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 6. Stage 4: Weekly Frequency & Pledge Modal
  if (showPlanModal) {
    const canFinish = Boolean(selectedFrequency && selectedPledge);
    const planSpeak =
      '작게, 자주, 즐겁게! 일주일에 몇 번 할지 고르고, 나만의 다짐을 골라 주세요.';

    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[#1E2A4A]/45 overflow-y-auto">
        <div className="w-full max-w-xl my-auto rounded-3xl bg-[#F6F8FC] border-2 border-[#C8DCF0] shadow-2xl p-5 sm:p-7 text-[#1E2A4A] flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm sm:text-base font-extrabold text-[#2F7D62]">
                작게, 자주, 즐겁게!
              </p>
              <h2 className="font-display text-2xl sm:text-3xl mt-0.5">
                겨울방학 한 걸음 약속하기
              </h2>
            </div>
            <SpeakButton text={planSpeak} compact />
          </div>

          {/* Frequency buttons */}
          <div className="flex flex-col gap-2">
            <span className="text-base sm:text-lg font-extrabold">
              1. 얼마나 자주 할까요?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {FREQUENCY_OPTIONS.map((opt) => {
                const selected = selectedFrequency === opt.label;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSelectFrequency(opt.label)}
                    aria-pressed={selected}
                    className={`min-h-[68px] px-3 py-2.5 rounded-2xl border-2 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                      selected
                        ? 'bg-[#1E2A4A] text-[#F6F8FC] border-[#1E2A4A]'
                        : 'bg-white hover:bg-[#E3EEFA] text-[#1E2A4A] border-[#C8DCF0]'
                    }`}
                  >
                    <span className="text-base sm:text-lg font-extrabold">
                      {opt.label}
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-bold mt-0.5 ${
                        selected ? 'text-[#E3EEFA]' : 'text-[#1E2A4A]/70'
                      }`}
                    >
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pledge buttons */}
          <div className="flex flex-col gap-2">
            <span className="text-base sm:text-lg font-extrabold">
              2. 나의 다짐을 골라 주세요
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PLEDGE_OPTIONS.map((pledge) => {
                const selected = selectedPledge === pledge;
                return (
                  <button
                    key={pledge}
                    type="button"
                    onClick={() => onSelectPledge(pledge)}
                    aria-pressed={selected}
                    className={`min-h-[56px] px-4 py-3 rounded-2xl border-2 text-base sm:text-lg font-extrabold cursor-pointer transition-colors ${
                      selected
                        ? 'bg-[#2F7D62] text-[#F6F8FC] border-[#205B47]'
                        : 'bg-white hover:bg-[#FFF5EA] text-[#1E2A4A] border-[#C8DCF0] hover:border-[#F4A259]'
                    }`}
                  >
                    {pledge}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <button
              type="button"
              onClick={onBackFromPlan}
              className="min-h-[52px] px-4 py-3 rounded-2xl bg-white hover:bg-[#E3EEFA] border-2 border-[#C8DCF0] text-base font-extrabold cursor-pointer"
            >
              미션 다시 고르기
            </button>
            <button
              type="button"
              disabled={!canFinish}
              onClick={onCompletePlan}
              className={`flex-1 min-h-[54px] px-6 py-3 rounded-2xl border-2 text-lg sm:text-xl font-extrabold transition-colors ${
                canFinish
                  ? 'bg-[#F4A259] hover:bg-[#EB9244] text-[#1E2A4A] border-[#D98236] cursor-pointer'
                  : 'bg-[#E3EEFA] text-[#1E2A4A]/45 border-[#C8DCF0] cursor-not-allowed'
              }`}
            >
              🌸 꿈 꽃 피우기!
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
