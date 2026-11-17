import html2canvas from 'html2canvas';
import { Check, Download, RotateCcw, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';
import { GradeLevel, SelectedDream } from '../types/game';
import { SpeakButton } from './SpeakButton';

interface DreamPracticeCardModalProps {
  nickname: string;
  grade: GradeLevel;
  classCode: string;
  selectedDream: SelectedDream;
  answeredSnowmen: Record<string, string>;
  quizScore: number;
  totalQuizzes: number;
  selectedMissions: string[];
  selectedFrequency: string;
  selectedPledge: string;
  treeSnapshotUrl: string | null;
  sheetSaveNotice: string;
  onCloseToExplore: () => void;
  onRestartGame: () => void;
}

const FOURTEEN_DAYS = Array.from({ length: 14 }, (_, i) => i + 1);

export function DreamPracticeCardModal({
  nickname,
  grade,
  classCode,
  selectedDream,
  answeredSnowmen,
  quizScore,
  totalQuizzes,
  selectedMissions,
  selectedFrequency,
  selectedPledge,
  treeSnapshotUrl,
  sheetSaveNotice,
  onCloseToExplore,
  onRestartGame,
}: DreamPracticeCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [checkedDays, setCheckedDays] = useState<Record<number, boolean>>({});
  const [savingPng, setSavingPng] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const summarySpeech = `나의 겨울방학 꿈 실천 카드예요. ${nickname} 친구의 꿈은 ${selectedDream.label}이에요. 겨울방학에는 ${selectedFrequency}, ${selectedMissions.join(', ')}를 해 보기로 했어요. 다짐은 ${selectedPledge} 예요.`;

  const handleToggleDay = (day: number) => {
    setCheckedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current || savingPng) return;
    setSavingPng(true);
    setSaveMessage('');

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#F6F8FC',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      const safeName = nickname.replace(/\s+/g, '_');
      link.download = `꿈실천카드_${safeName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setSaveMessage('카드를 이미지로 저장했어요!');
    } catch {
      setSaveMessage('저장이 잘 안 됐어요. 다시 한 번 눌러 주세요.');
    } finally {
      setSavingPng(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-3 sm:p-5 bg-[#1E2A4A]/55 overflow-y-auto">
      <div className="w-full max-w-2xl my-auto flex flex-col gap-3">
        {/* Printable / Exportable Card Container (strictly hex/rgba styles for html2canvas compatibility) */}
        <div
          ref={cardRef}
          style={{
            backgroundColor: '#F6F8FC',
            borderColor: '#B6CEE8',
            color: '#1E2A4A',
            boxShadow: '0 16px 40px rgba(30, 42, 74, 0.25)',
          }}
          className="rounded-3xl border-2 p-5 sm:p-7 flex flex-col gap-4"
        >
          {/* Card Title & Identity */}
          <div
            style={{ borderColor: '#D8E5F3' }}
            className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b-2"
          >
            <div>
              <p
                style={{ color: '#2F7D62' }}
                className="text-sm sm:text-base font-extrabold"
              >
                방학이 특별해지는 시간 · 겨울방학 내 꿈에 한 걸음 더
              </p>
              <h2
                style={{ color: '#1E2A4A' }}
                className="font-display text-2xl sm:text-4xl mt-1"
              >
                나의 겨울방학 꿈 실천 카드
              </h2>
            </div>
            <div
              style={{
                backgroundColor: '#E3EEFA',
                borderColor: '#B6CEE8',
                color: '#1E2A4A',
              }}
              className="px-3.5 py-2 rounded-2xl border text-right"
            >
              <p className="text-base sm:text-lg font-extrabold">{nickname}</p>
              <p style={{ color: '#2F7D62' }} className="text-xs sm:text-sm font-bold">
                {grade}학년{classCode ? ` · 코드 ${classCode}` : ''}
              </p>
            </div>
          </div>

          {/* 3D Dream Tree Snapshot */}
          {treeSnapshotUrl ? (
            <div
              style={{
                backgroundColor: '#DCEBFA',
                borderColor: '#B6CEE8',
              }}
              className="w-full h-44 sm:h-52 rounded-2xl border-2 overflow-hidden flex items-center justify-center"
            >
              <img
                src={treeSnapshotUrl}
                alt="활짝 핀 나의 3D 꿈 나무"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#E3EEFA',
                borderColor: '#B6CEE8',
                color: '#1E2A4A',
              }}
              className="w-full h-32 rounded-2xl border-2 flex flex-col items-center justify-center gap-1"
            >
              <span className="text-4xl" aria-hidden="true">
                🌸
              </span>
              <span className="font-display text-xl">활짝 핀 나의 꿈 나무</span>
            </div>
          )}

          {/* Dream & Quiz Score */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              style={{ backgroundColor: '#FFFFFF', borderColor: '#C8DCF0' }}
              className="rounded-2xl border-2 p-3.5"
            >
              <p style={{ color: '#2F7D62' }} className="text-xs sm:text-sm font-extrabold">
                내가 심은 꿈 씨앗
              </p>
              <p className="text-xl sm:text-2xl font-extrabold mt-1">
                <span aria-hidden="true">{selectedDream.emoji} </span>
                <span>{selectedDream.label}</span>
              </p>
            </div>

            <div
              style={{ backgroundColor: '#FFFFFF', borderColor: '#C8DCF0' }}
              className="rounded-2xl border-2 p-3.5"
            >
              <p style={{ color: '#2F7D62' }} className="text-xs sm:text-sm font-extrabold">
                OX 얼음문 퀴즈
              </p>
              <p className="text-xl sm:text-2xl font-extrabold mt-1">
                {totalQuizzes}문제 중 {quizScore}개 맞혔어요!
              </p>
            </div>
          </div>

          {/* Three Snowman Answers */}
          <div
            style={{ backgroundColor: '#FFFFFF', borderColor: '#C8DCF0' }}
            className="rounded-2xl border-2 p-3.5 flex flex-col gap-2"
          >
            <p style={{ color: '#2F7D62' }} className="text-xs sm:text-sm font-extrabold">
              눈사람에게 들려준 나의 이야기
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm font-extrabold">
              <div
                style={{ backgroundColor: '#E3EEFA' }}
                className="rounded-xl p-2.5"
              >
                <span style={{ color: '#2F7D62' }} className="block text-xs">
                  좋아하는 것
                </span>
                <span>{answeredSnowmen.like || '-'}</span>
              </div>
              <div
                style={{ backgroundColor: '#E3EEFA' }}
                className="rounded-xl p-2.5"
              >
                <span style={{ color: '#2F7D62' }} className="block text-xs">
                  궁금한 것
                </span>
                <span>{answeredSnowmen.curious || '-'}</span>
              </div>
              <div
                style={{ backgroundColor: '#E3EEFA' }}
                className="rounded-xl p-2.5"
              >
                <span style={{ color: '#2F7D62' }} className="block text-xs">
                  잘하는 것
                </span>
                <span>{answeredSnowmen['good-at'] || '-'}</span>
              </div>
            </div>
          </div>

          {/* Chosen Missions + Frequency */}
          <div
            style={{ backgroundColor: '#E3EEFA', borderColor: '#B6CEE8' }}
            className="rounded-2xl border-2 p-3.5 flex flex-col gap-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p style={{ color: '#2F7D62' }} className="text-sm font-extrabold">
                겨울방학 한 걸음 미션 ({selectedFrequency})
              </p>
              <span style={{ color: '#1E2A4A' }} className="text-xs font-extrabold">
                작게, 자주, 즐겁게!
              </span>
            </div>
            <ul className="flex flex-col gap-1.5 text-sm sm:text-base font-extrabold">
              {selectedMissions.map((m, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Sparkles
                    className="w-4 h-4 shrink-0 mt-1"
                    style={{ color: '#F4A259' }}
                    aria-hidden="true"
                  />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pledge */}
          <div
            style={{ backgroundColor: '#FFF5EA', borderColor: '#F4A259' }}
            className="rounded-2xl border-2 p-3 text-center"
          >
            <p style={{ color: '#2F7D62' }} className="text-xs sm:text-sm font-extrabold">
              나의 다짐
            </p>
            <p className="font-display text-xl sm:text-2xl mt-0.5">
              “{selectedPledge}”
            </p>
          </div>

          {/* 14-day (2-week) Checkboxes */}
          <div
            style={{ backgroundColor: '#FFFFFF', borderColor: '#C8DCF0' }}
            className="rounded-2xl border-2 p-3.5 flex flex-col gap-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p style={{ color: '#2F7D62' }} className="text-xs sm:text-sm font-extrabold">
                2주 동안 실천 체크 칸 (14일)
              </p>
              <span style={{ color: '#1E2A4A' }} className="text-xs font-bold">
                실천한 날에 동그라미를 쳐 보아요
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {FOURTEEN_DAYS.map((day) => {
                const checked = Boolean(checkedDays[day]);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    aria-pressed={checked}
                    aria-label={`${day}일차 체크`}
                    style={{
                      backgroundColor: checked ? '#2F7D62' : '#F6F8FC',
                      borderColor: checked ? '#205B47' : '#B6CEE8',
                      color: checked ? '#F6F8FC' : '#1E2A4A',
                    }}
                    className="min-h-[46px] rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 text-xs font-extrabold cursor-pointer transition-colors"
                  >
                    <span>{day}일</span>
                    {checked ? (
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      <span
                        style={{ borderColor: '#9BB5D2' }}
                        className="w-3.5 h-3.5 rounded-sm border bg-white"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons Bar (outside PNG export) */}
        <div className="rounded-2xl bg-[#F6F8FC] border-2 border-[#C8DCF0] shadow-xl p-3.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <SpeakButton text={summarySpeech} compact />
            {(saveMessage || sheetSaveNotice) && (
              <span className="text-sm font-extrabold text-[#2F7D62]">
                {saveMessage || sheetSaveNotice}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={savingPng}
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-4 py-2.5 rounded-xl bg-[#F4A259] hover:bg-[#EB9244] border-2 border-[#D98236] text-[#1E2A4A] text-sm sm:text-base font-extrabold cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{savingPng ? '저장하는 중...' : '카드 이미지로 저장'}</span>
            </button>

            <button
              type="button"
              onClick={onCloseToExplore}
              className="min-h-[48px] px-4 py-2.5 rounded-xl bg-[#2F7D62] hover:bg-[#23634D] text-[#F6F8FC] text-sm sm:text-base font-extrabold cursor-pointer whitespace-nowrap"
            >
              섬 구경하기
            </button>

            <button
              type="button"
              onClick={onRestartGame}
              className="inline-flex items-center justify-center gap-1.5 min-h-[48px] px-4 py-2.5 rounded-xl bg-white hover:bg-[#E3EEFA] border-2 border-[#C8DCF0] text-[#1E2A4A] text-sm sm:text-base font-extrabold cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>처음부터 다시 하기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
