import { Volume2, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { isSpeechSupported, speakKorean, stopSpeaking } from '../utils/speech';

interface SpeakButtonProps {
  text: string;
  compact?: boolean;
  className?: string;
  label?: string;
}

export function SpeakButton({
  text,
  compact = false,
  className = '',
  label = '읽어 주기',
}: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const supported = isSpeechSupported();

  useEffect(() => {
    return () => {
      if (speaking) {
        stopSpeaking();
      }
    };
  }, [speaking]);

  if (!supported) {
    return null;
  }

  const handleClick = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }

    speakKorean(text, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={speaking ? '읽기 멈추기' : `${label}: ${text}`}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
        compact ? 'min-h-[40px] px-3 py-1.5 text-sm' : 'min-h-[44px] px-3.5 py-2 text-sm sm:text-base'
      } ${
        speaking
          ? 'bg-[#F4A259] text-[#1E2A4A] border-[#D98236]'
          : 'bg-[#E3EEFA] text-[#1E2A4A] border-[#B6CEE8] hover:bg-[#D2E4F8]'
      } ${className}`}
    >
      {speaking ? (
        <Square className="w-4 h-4 fill-current shrink-0" aria-hidden="true" />
      ) : (
        <Volume2 className="w-4 h-4 shrink-0" aria-hidden="true" />
      )}
      <span>{speaking ? '멈추기' : `🔊 ${label}`}</span>
    </button>
  );
}
