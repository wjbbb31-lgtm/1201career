import { GraduationCap, Play, RefreshCw, Sparkles } from 'lucide-react';
import { GradeLevel, SCARF_COLORS, ScarfColorId } from '../types/game';
import { SpeakButton } from './SpeakButton';

interface StartScreenProps {
  classCode: string;
  onClassCodeChange: (value: string) => void;
  grade: GradeLevel;
  onGradeChange: (grade: GradeLevel) => void;
  nickname: string;
  onRegenerateNickname: () => void;
  scarfColor: ScarfColorId;
  onScarfColorChange: (color: ScarfColorId) => void;
  onStart: () => void;
  onOpenTeacherAuth: () => void;
}

const GRADES: GradeLevel[] = [1, 2, 3, 4];

export function StartScreen({
  classCode,
  onClassCodeChange,
  grade,
  onGradeChange,
  nickname,
  onRegenerateNickname,
  scarfColor,
  onScarfColorChange,
  onStart,
  onOpenTeacherAuth,
}: StartScreenProps) {
  const introText =
    '꿈 씨앗 섬에 오신 것을 환영해요. 겨울방학 내 꿈에 한 걸음 더 다가가요.';
  const classCodeGuide =
    '선생님이 알려 준 수업 코드를 적어요. 없으면 비워 두고 시작해도 돼요.';
  const gradeGuide = '몇 학년인지 버튼으로 골라 주세요. 1학년과 2학년은 자동 이동이 켜져요.';
  const nicknameGuide = `오늘의 내 별명은 ${nickname}이에요. 마음에 안 들면 다시 뽑기를 눌러요.`;
  const scarfGuide = '펭귄이 두를 목도리 색을 골라 주세요.';
  const privacyGuide = '이름이나 전화번호 같은 개인정보는 받지 않아요. 안심하고 시작해요.';

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-3 sm:p-6 bg-[#1E2A4A]/35 overflow-y-auto">
      <div className="w-full max-w-2xl my-auto rounded-3xl bg-[#F6F8FC] border-2 border-[#C8DCF0] shadow-2xl p-5 sm:p-8 text-[#1E2A4A]">
        {/* Header */}
        <div className="flex flex-col gap-3 pb-5 border-b border-[#D8E5F3]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm sm:text-base font-bold text-[#2F7D62]">
                방학이 특별해지는 시간
              </p>
              <h1 className="font-display text-3xl sm:text-5xl text-[#1E2A4A] tracking-tight mt-1">
                꿈 씨앗 섬
              </h1>
            </div>
            <SpeakButton text={introText} />
          </div>
          <p className="text-base sm:text-xl font-bold text-[#1E2A4A]/85 leading-relaxed">
            겨울방학 내 꿈에 한 걸음 더 다가가요.
          </p>
        </div>

        {/* Form Controls */}
        <div className="flex flex-col gap-5 py-5">
          {/* 1. Class Code */}
          <section className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="class-code-input"
                className="text-lg sm:text-xl font-extrabold text-[#1E2A4A]"
              >
                1. 수업 코드
              </label>
              <SpeakButton text={classCodeGuide} compact />
            </div>
            <p className="text-sm sm:text-base font-medium text-[#1E2A4A]/75">
              선생님이 알려 준 코드를 적어요. (예: A3)
            </p>
            <input
              id="class-code-input"
              type="text"
              inputMode="text"
              maxLength={12}
              value={classCode}
              onChange={(e) => onClassCodeChange(e.target.value.toUpperCase())}
              placeholder="예: A3"
              className="w-full sm:w-56 min-h-[50px] px-4 py-2.5 rounded-2xl bg-white border-2 border-[#B6CEE8] text-xl sm:text-2xl font-extrabold text-[#1E2A4A] tracking-wider placeholder:text-[#1E2A4A]/35 focus:border-[#F4A259] focus:outline-none"
            />
          </section>

          {/* 2. Grade Buttons */}
          <section className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-lg sm:text-xl font-extrabold text-[#1E2A4A]">
                2. 나는 몇 학년인가요?
              </span>
              <SpeakButton text={gradeGuide} compact />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {GRADES.map((g) => {
                const selected = grade === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onGradeChange(g)}
                    aria-pressed={selected}
                    className={`min-h-[52px] px-4 py-3 rounded-2xl text-lg sm:text-xl font-extrabold border-2 transition-colors cursor-pointer whitespace-nowrap ${
                      selected
                        ? 'bg-[#1E2A4A] text-[#F6F8FC] border-[#1E2A4A] shadow-md'
                        : 'bg-white text-[#1E2A4A] border-[#C8DCF0] hover:bg-[#E3EEFA]'
                    }`}
                  >
                    {g}학년
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. Auto-generated Nickname */}
          <section className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-lg sm:text-xl font-extrabold text-[#1E2A4A]">
                3. 오늘의 내 별명
              </span>
              <SpeakButton text={nicknameGuide} compact />
            </div>
            <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-[#E3EEFA] border border-[#C8DCF0]">
              <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                <Sparkles className="w-5 h-5 text-[#2F7D62] shrink-0" aria-hidden="true" />
                <span className="text-xl sm:text-2xl font-extrabold text-[#1E2A4A]">
                  {nickname}
                </span>
              </div>
              <button
                type="button"
                onClick={onRegenerateNickname}
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-4 py-2 rounded-xl bg-white border-2 border-[#B6CEE8] text-base sm:text-lg font-extrabold text-[#1E2A4A] hover:bg-[#FFF5EA] hover:border-[#F4A259] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>다시 뽑기</span>
              </button>
            </div>
          </section>

          {/* 4. Scarf Color */}
          <section className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-lg sm:text-xl font-extrabold text-[#1E2A4A]">
                4. 펭귄 목도리 색
              </span>
              <SpeakButton text={scarfGuide} compact />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SCARF_COLORS.map((color) => {
                const selected = scarfColor === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => onScarfColorChange(color.id)}
                    aria-pressed={selected}
                    className={`flex items-center justify-center gap-2.5 min-h-[50px] px-3 py-2.5 rounded-2xl border-2 text-base sm:text-lg font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                      selected
                        ? 'bg-[#1E2A4A] text-[#F6F8FC] border-[#1E2A4A] shadow-md'
                        : 'bg-white text-[#1E2A4A] border-[#C8DCF0] hover:bg-[#E3EEFA]'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm shrink-0"
                      style={{ backgroundColor: color.hex }}
                      aria-hidden="true"
                    />
                    <span>{color.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer Privacy + Start CTA */}
        <div className="flex flex-col gap-4 pt-4 border-t border-[#D8E5F3]">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm sm:text-base font-bold text-[#2F7D62]">
            <span>이름이나 개인정보는 받지 않아요.</span>
            <SpeakButton text={privacyGuide} compact />
          </div>

          <button
            type="button"
            onClick={onStart}
            className="w-full min-h-[60px] px-6 py-4 rounded-2xl bg-[#F4A259] hover:bg-[#EB9244] text-[#1E2A4A] font-display text-2xl sm:text-3xl shadow-lg border-2 border-[#D98236] flex items-center justify-center gap-3 transition-transform active:scale-[0.99] cursor-pointer"
          >
            <Play className="w-7 h-7 fill-current shrink-0" aria-hidden="true" />
            <span>섬으로 출발하기</span>
          </button>
        </div>
      </div>

      {/* Small Teacher button in bottom-right corner */}
      <button
        type="button"
        onClick={onOpenTeacherAuth}
        className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-30 inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-xl bg-[#F6F8FC]/90 hover:bg-[#E3EEFA] border border-[#B6CEE8] text-xs sm:text-sm font-extrabold text-[#1E2A4A]/80 shadow-md cursor-pointer"
      >
        <GraduationCap className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>선생님</span>
      </button>
    </div>
  );
}
