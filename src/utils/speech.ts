export function isSpeechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  );
}

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore speech synthesis errors on restricted browsers
  }
}

export function speakKorean(
  text: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
  },
): void {
  if (!isSpeechSupported()) {
    callbacks?.onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.92;
    utterance.pitch = 1.06;

    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith('ko'),
    );
    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }

    utterance.onstart = () => callbacks?.onStart?.();
    utterance.onend = () => callbacks?.onEnd?.();
    utterance.onerror = () => callbacks?.onEnd?.();

    window.speechSynthesis.speak(utterance);
  } catch {
    callbacks?.onEnd?.();
  }
}
