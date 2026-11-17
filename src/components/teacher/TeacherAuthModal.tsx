import { Lock, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { TEACHER_PASSCODE } from '../../config/teacherConfig';

interface TeacherAuthModalProps {
  initialClassCode: string;
  onSuccess: (classCode: string) => void;
  onClose: () => void;
}

export function TeacherAuthModal({
  initialClassCode,
  onSuccess,
  onClose,
}: TeacherAuthModalProps) {
  const [classCode, setClassCode] = useState(initialClassCode);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (passcode.trim() !== TEACHER_PASSCODE) {
      setError('비밀번호가 맞지 않아요. 4자리 숫자를 확인해 주세요.');
      return;
    }
    setError('');
    onSuccess(classCode.trim().toUpperCase());
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#1E2A4A]/55">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-[#F6F8FC] border-2 border-[#C8DCF0] shadow-2xl p-6 text-[#1E2A4A] flex flex-col gap-4"
      >
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#D8E5F3]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#E3EEFA] border border-[#B6CEE8] flex items-center justify-center text-[#1E2A4A]">
              <Lock className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-2xl">선생님 화면 열기</h2>
              <p className="text-xs sm:text-sm font-bold text-[#2F7D62]">
                우리 반 꿈 숲을 함께 보아요
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="w-10 h-10 rounded-xl bg-white border border-[#C8DCF0] hover:bg-[#E3EEFA] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="teacher-class-code"
            className="text-base font-extrabold text-[#1E2A4A]"
          >
            수업 코드
          </label>
          <input
            id="teacher-class-code"
            type="text"
            maxLength={12}
            value={classCode}
            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
            placeholder="예: A3 (비우면 전체 보기)"
            className="w-full min-h-[48px] px-4 py-2 rounded-2xl bg-white border-2 border-[#B6CEE8] text-lg font-extrabold text-[#1E2A4A] tracking-wider placeholder:text-[#1E2A4A]/35"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="teacher-passcode"
            className="text-base font-extrabold text-[#1E2A4A]"
          >
            비밀번호 4자리
          </label>
          <input
            id="teacher-passcode"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={passcode}
            onChange={(e) => {
              setPasscode(e.target.value.replace(/\D/g, '').slice(0, 4));
              setError('');
            }}
            placeholder="0000"
            className="w-full min-h-[48px] px-4 py-2 rounded-2xl bg-white border-2 border-[#B6CEE8] text-xl font-extrabold text-[#1E2A4A] tracking-[0.4em] placeholder:text-[#1E2A4A]/35"
          />
        </div>

        {error && (
          <p className="text-sm font-extrabold text-[#E04F5F]">{error}</p>
        )}

        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[50px] px-4 py-2.5 rounded-2xl bg-white hover:bg-[#E3EEFA] border-2 border-[#C8DCF0] text-base font-extrabold cursor-pointer"
          >
            돌아가기
          </button>
          <button
            type="submit"
            className="flex-1 min-h-[50px] px-5 py-2.5 rounded-2xl bg-[#1E2A4A] hover:bg-[#2C3C68] text-[#F6F8FC] text-lg font-extrabold cursor-pointer"
          >
            우리 반 꿈 숲 열기
          </button>
        </div>
      </form>
    </div>
  );
}
