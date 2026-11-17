import { GROWTH_STAGES, GrowthStageIndex } from '../types/game';

interface GrowthProgressBarProps {
  growthStage: GrowthStageIndex;
  gameStageLabel: string;
}

export function GrowthProgressBar({
  growthStage,
  gameStageLabel,
}: GrowthProgressBarProps) {
  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none max-w-[calc(100vw-24px)] hidden xl:block">
      <div className="rounded-2xl bg-[#F6F8FC]/95 border-2 border-[#C8DCF0] shadow-lg px-4 py-2 flex items-center gap-3 text-[#1E2A4A]">
        <span className="text-sm font-extrabold text-[#2F7D62] whitespace-nowrap shrink-0">
          {gameStageLabel}
        </span>
        <span className="text-[#B6CEE8]" aria-hidden="true">
          |
        </span>
        <ol className="flex items-center gap-1.5" aria-label="꿈 화분 자라는 순서">
          {GROWTH_STAGES.map((stage, idx) => {
            const isActive = stage.index === growthStage;
            const isDone = stage.index < growthStage;
            return (
              <li key={stage.index} className="flex items-center gap-1.5">
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-sm font-extrabold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-[#F4A259] text-[#1E2A4A] shadow-sm'
                      : isDone
                        ? 'bg-[#2F7D62] text-[#F6F8FC]'
                        : 'bg-[#E3EEFA] text-[#1E2A4A]/60'
                  }`}
                >
                  <span aria-hidden="true">{stage.emoji}</span>
                  <span>{stage.label}</span>
                </div>
                {idx < GROWTH_STAGES.length - 1 && (
                  <span
                    className={`font-extrabold text-sm ${
                      isDone ? 'text-[#2F7D62]' : 'text-[#9BB5D2]'
                    }`}
                    aria-hidden="true"
                  >
                    →
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
