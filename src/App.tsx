import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { DreamPracticeCardModal } from './components/DreamPracticeCardModal';
import { GameHUD } from './components/GameHUD';
import { GrowthProgressBar } from './components/GrowthProgressBar';
import { StageOverlayUI } from './components/StageOverlayUI';
import { StartScreen } from './components/StartScreen';
import { DreamIslandCanvas } from './components/scene/DreamIslandCanvas';
import { FlightEffect } from './components/scene/DreamPlant';
import { TeacherAuthModal } from './components/teacher/TeacherAuthModal';
import { TeacherForestView } from './components/teacher/TeacherForestView';
import {
  DREAM_SEED_OPTIONS,
  DreamSeedOption,
  GIFT_CATEGORIES,
  GiftCategory,
  InterestOption,
  OX_QUIZ_QUESTIONS,
  OxQuizQuestion,
  SNOWMAN_QUESTIONS,
  SnowmanQuestion,
} from './data/careerGameData';
import {
  GameStage,
  GradeLevel,
  GrowthStageIndex,
  ScarfColorId,
  SelectedDream,
  getSeedOrbPositions,
} from './types/game';
import { generateNickname } from './utils/nickname';
import { saveDreamCard } from './utils/sheetClient';
import { stopSpeaking } from './utils/speech';

function getInitialClassCode(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const code = params.get('class');
  return code ? code.trim().toUpperCase().slice(0, 12) : '';
}

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [classCode, setClassCode] = useState<string>(getInitialClassCode);
  const [grade, setGrade] = useState<GradeLevel>(1);
  const [nickname, setNickname] = useState<string>(() => generateNickname());
  const [scarfColor, setScarfColor] = useState<ScarfColorId>('red');

  const [autoMove, setAutoMove] = useState<boolean>(true);
  const [lowSpec, setLowSpec] = useState<boolean>(false);
  const [resetCameraSignal, setResetCameraSignal] = useState<number>(0);

  // Teacher Mode State
  const [teacherAuthOpen, setTeacherAuthOpen] = useState(false);
  const [teacherMode, setTeacherMode] = useState(false);
  const [teacherClassCode, setTeacherClassCode] = useState('');

  // Game Progression State
  const [gameStage, setGameStage] = useState<GameStage>(1);
  const [growthStage, setGrowthStage] = useState<GrowthStageIndex>(0);
  const [growthProgress, setGrowthProgress] = useState<number>(0);

  // Stage 1: Dream Seed
  const [selectedDream, setSelectedDream] = useState<SelectedDream | null>(null);
  const [seedPlanted, setSeedPlanted] = useState(false);
  const [pendingOrb, setPendingOrb] = useState<{
    option: DreamSeedOption;
    x: number;
    z: number;
  } | null>(null);
  const [showInterestPicker, setShowInterestPicker] = useState(false);
  const [seedFlight, setSeedFlight] = useState<FlightEffect | null>(null);

  // Stage 2: 3 Snowmen Questions
  const [answeredSnowmen, setAnsweredSnowmen] = useState<Record<string, string>>({});
  const [activeSnowmanQuestion, setActiveSnowmanQuestion] =
    useState<SnowmanQuestion | null>(null);
  const [lightBurst, setLightBurst] = useState<FlightEffect | null>(null);
  const pendingStage3AfterBurstRef = useRef(false);

  // Stage 3: OX Ice Gates Quiz
  const [oxIndex, setOxIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [oxFeedback, setOxFeedback] = useState<{
    question: OxQuizQuestion;
    userChoice: 'O' | 'X';
    isCorrect: boolean;
  } | null>(null);
  const [rainShowerKey, setRainShowerKey] = useState(0);
  const [rainIsCorrect, setRainIsCorrect] = useState(true);

  // Stage 4: Gift Boxes + Frequency + Pledge
  const [openedGifts, setOpenedGifts] = useState<Record<string, boolean>>({});
  const [activeGift, setActiveGift] = useState<GiftCategory | null>(null);
  const [selectedMissions, setSelectedMissions] = useState<Record<string, string>>({});
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState('');
  const [selectedPledge, setSelectedPledge] = useState('');

  // Finale Celebration & Practice Card
  const [finaleActive, setFinaleActive] = useState(false);
  const [showPracticeCard, setShowPracticeCard] = useState(false);
  const [treeSnapshotUrl, setTreeSnapshotUrl] = useState<string | null>(null);
  const [sheetSaveNotice, setSheetSaveNotice] = useState<string>('');

  const [targetMarker, setTargetMarker] = useState<{
    x: number;
    z: number;
    visible: boolean;
  }>({ x: 0, z: 0, visible: false });

  const webglCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const finaleTimersRef = useRef<number[]>([]);
  const attemptIdRef = useRef<string>(
    (() => {
      try {
        const existing = window.sessionStorage.getItem('dream_seed_attempt_id');
        if (existing) return existing;
        const fresh = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        window.sessionStorage.setItem('dream_seed_attempt_id', fresh);
        return fresh;
      } catch {
        return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      }
    })(),
  );
  const savedAttemptSetRef = useRef<Set<string>>(new Set());

  // Preserved across low-spec Canvas remounts
  const penguinPosRef = useRef(new THREE.Vector3(0, 0, 8.2));
  const penguinYawRef = useRef(Math.PI);
  const clickTargetRef = useRef<{ x: number; z: number; active: boolean }>({
    x: 0,
    z: 0,
    active: false,
  });

  const clearFinaleTimers = useCallback(() => {
    for (const id of finaleTimersRef.current) {
      window.clearTimeout(id);
    }
    finaleTimersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      stopSpeaking();
      clearFinaleTimers();
    };
  }, [clearFinaleTimers]);

  const modalOpen = Boolean(
    pendingOrb ||
      showInterestPicker ||
      activeSnowmanQuestion ||
      oxFeedback ||
      activeGift ||
      showPlanModal ||
      showPracticeCard,
  );

  const orbPositions = useMemo(
    () => getSeedOrbPositions(DREAM_SEED_OPTIONS.length),
    [],
  );

  // Next guide target for glowing footprints & auto-move
  const guideTarget = useMemo<{ x: number; z: number } | null>(() => {
    if (!hasStarted || finaleActive) return null;

    if (gameStage === 1 && !seedPlanted) {
      return { x: 0, z: 6.8 };
    }

    if (gameStage === 2) {
      const nextSnowman = SNOWMAN_QUESTIONS.find((q) => !answeredSnowmen[q.id]);
      return nextSnowman ? { x: nextSnowman.x, z: nextSnowman.z } : null;
    }

    if (gameStage === 3) {
      return { x: 0, z: -4.2 };
    }

    if (gameStage === 4) {
      const chosenCount = Object.keys(selectedMissions).length;
      if (chosenCount >= 2) return null;
      const nextGift = GIFT_CATEGORIES.find(
        (g) => !openedGifts[g.id] && !selectedMissions[g.id],
      );
      if (nextGift) return { x: nextGift.x, z: nextGift.z };
      const unpicked = GIFT_CATEGORIES.find((g) => !selectedMissions[g.id]);
      return unpicked ? { x: unpicked.x, z: unpicked.z } : null;
    }

    return null;
  }, [
    hasStarted,
    finaleActive,
    gameStage,
    seedPlanted,
    answeredSnowmen,
    selectedMissions,
    openedGifts,
  ]);

  const { gameStageLabel, stageInstruction } = useMemo(() => {
    if (finaleActive) {
      return {
        gameStageLabel: '완성 · 꿈 꽃 피우기',
        stageInstruction: '꿈 나무에 꽃이 활짝 피었어요! 잠시 뒤 실천 카드가 열려요.',
      };
    }
    if (gameStage === 1) {
      return {
        gameStageLabel: '1단계 · 꿈 씨앗 고르기',
        stageInstruction: seedFlight
          ? '반짝이는 꿈 씨앗이 화분으로 날아가고 있어요!'
          : '마음에 드는 꿈 씨앗 구슬을 누르거나 가까이 걸어가요.',
      };
    }
    if (gameStage === 2) {
      const done = Object.keys(answeredSnowmen).length;
      return {
        gameStageLabel: `2단계 · 눈사람 질문 (${done}/3)`,
        stageInstruction: '물음표(?)가 뜬 눈사람에게 가서 질문에 답해요.',
      };
    }
    if (gameStage === 3) {
      return {
        gameStageLabel: `3단계 · OX 얼음문 (${oxIndex + 1}/5)`,
        stageInstruction: 'O 또는 X 얼음문으로 걸어가거나 버튼을 눌러 답해요.',
      };
    }
    if (gameStage === 4) {
      return {
        gameStageLabel: '4단계 · 겨울방학 선물상자',
        stageInstruction: '선물상자를 열어 겨울방학 미션 2~3개를 골라요.',
      };
    }
    return {
      gameStageLabel: '완성 · 내 꿈 꽃',
      stageInstruction: '꿈 꽃이 활짝 피었어요! 섬을 천천히 둘러보아요.',
    };
  }, [finaleActive, gameStage, seedFlight, answeredSnowmen, oxIndex]);

  const handleGradeChange = (nextGrade: GradeLevel) => {
    setGrade(nextGrade);
    setAutoMove(nextGrade <= 2);
  };

  const handleRegenerateNickname = () => {
    setNickname((prev) => generateNickname(prev));
  };

  const handleStart = () => {
    stopSpeaking();
    setHasStarted(true);
    setResetCameraSignal((n) => n + 1);
  };

  const handleSelectGroundPoint = useCallback((x: number, z: number) => {
    clickTargetRef.current = { x, z, active: true };
    setTargetMarker({ x, z, visible: true });
    setAutoMove(false);
  }, []);

  const handleReachClickTarget = useCallback(() => {
    setTargetMarker((prev) => (prev.visible ? { ...prev, visible: false } : prev));
  }, []);

  const handleToggleAutoMove = () => {
    setAutoMove((prev) => {
      const next = !prev;
      if (next) {
        clickTargetRef.current.active = false;
        setTargetMarker((m) => (m.visible ? { ...m, visible: false } : m));
      }
      return next;
    });
  };

  // Stage 1 Handlers
  const handleTriggerSeedOrb = useCallback(
    (option: DreamSeedOption, x: number, z: number) => {
      if (gameStage !== 1 || seedPlanted || seedFlight) return;
      clickTargetRef.current.active = false;
      setTargetMarker((m) => (m.visible ? { ...m, visible: false } : m));
      setPendingOrb({ option, x, z });
    },
    [gameStage, seedPlanted, seedFlight],
  );

  const launchSeedToPot = useCallback(
    (dream: SelectedDream, startX: number, startZ: number) => {
      setSelectedDream(dream);
      setPendingOrb(null);
      setShowInterestPicker(false);
      setSeedFlight({
        id: Date.now(),
        startX,
        startY: 1.05,
        startZ,
        color: dream.color,
      });
    },
    [],
  );

  const handleConfirmSeedOrb = () => {
    if (!pendingOrb) return;
    const { option, x, z } = pendingOrb;
    if (option.isUnknown) {
      setPendingOrb(null);
      setShowInterestPicker(true);
      return;
    }
    launchSeedToPot(
      {
        id: option.id,
        label: option.label,
        emoji: option.emoji,
        color: option.color,
        missions: option.missions,
      },
      x,
      z,
    );
  };

  const handleSelectInterest = (interest: InterestOption) => {
    const unknownIdx = DREAM_SEED_OPTIONS.findIndex((o) => o.isUnknown);
    const pos = orbPositions[unknownIdx >= 0 ? unknownIdx : 12] ?? { x: 0, z: 5.4 };
    launchSeedToPot(
      {
        id: interest.id,
        label: interest.label,
        emoji: interest.emoji,
        color: interest.color,
        fromUnknown: true,
        missions: interest.missions,
      },
      pos.x,
      pos.z,
    );
  };

  const handleSeedFlightComplete = useCallback(() => {
    setSeedFlight(null);
    setSeedPlanted(true);
    setGrowthStage(1);
    setGrowthProgress(1);
    setGameStage(2);
  }, []);

  // Stage 2 Handlers
  const handleTriggerSnowman = useCallback(
    (q: SnowmanQuestion) => {
      if (gameStage !== 2) return;
      clickTargetRef.current.active = false;
      setTargetMarker((m) => (m.visible ? { ...m, visible: false } : m));
      setActiveSnowmanQuestion(q);
    },
    [gameStage],
  );

  const handleAnswerSnowman = (questionId: string, choiceLabel: string) => {
    const q = SNOWMAN_QUESTIONS.find((item) => item.id === questionId);
    const updated = { ...answeredSnowmen, [questionId]: choiceLabel };
    const count = Object.keys(updated).length;

    setAnsweredSnowmen(updated);
    setActiveSnowmanQuestion(null);
    setGrowthProgress(1 + count / SNOWMAN_QUESTIONS.length);

    if (count >= SNOWMAN_QUESTIONS.length) {
      pendingStage3AfterBurstRef.current = true;
    }

    if (q) {
      setLightBurst({
        id: Date.now(),
        startX: q.x,
        startY: 1.45,
        startZ: q.z,
        color: '#F6C445',
      });
    } else if (count >= SNOWMAN_QUESTIONS.length) {
      setGrowthStage(2);
      setGameStage(3);
    }
  };

  const handleLightBurstComplete = useCallback(() => {
    setLightBurst(null);
    if (pendingStage3AfterBurstRef.current) {
      pendingStage3AfterBurstRef.current = false;
      setGrowthStage(2);
      setGrowthProgress(2);
      setGameStage(3);
    }
  }, []);

  // Stage 3 Handlers
  const currentOxQuestion =
    gameStage === 3 ? OX_QUIZ_QUESTIONS[oxIndex] ?? null : null;

  const handleAnswerOx = useCallback(
    (choice: 'O' | 'X') => {
      if (gameStage !== 3 || oxFeedback) return;
      const question = OX_QUIZ_QUESTIONS[oxIndex];
      if (!question) return;

      clickTargetRef.current.active = false;
      setTargetMarker((m) => (m.visible ? { ...m, visible: false } : m));

      const isCorrect = choice === question.answer;
      if (isCorrect) {
        setQuizScore((s) => s + 1);
      }

      setRainIsCorrect(isCorrect);
      setRainShowerKey((k) => k + 1);
      setGrowthProgress(2 + (oxIndex + 1) / OX_QUIZ_QUESTIONS.length);
      setOxFeedback({ question, userChoice: choice, isCorrect });
    },
    [gameStage, oxIndex, oxFeedback],
  );

  const handleNextOxQuestion = () => {
    setOxFeedback(null);

    if (penguinPosRef.current.z < -4.6) {
      penguinPosRef.current.z = -3.8;
    }

    if (oxIndex + 1 < OX_QUIZ_QUESTIONS.length) {
      setOxIndex((i) => i + 1);
    } else {
      setGrowthStage(3);
      setGrowthProgress(3);
      setGameStage(4);
    }
  };

  // Stage 4 Handlers
  const handleTriggerGift = useCallback(
    (gift: GiftCategory) => {
      if (gameStage !== 4) return;
      clickTargetRef.current.active = false;
      setTargetMarker((m) => (m.visible ? { ...m, visible: false } : m));
      setOpenedGifts((prev) => ({ ...prev, [gift.id]: true }));
      setActiveGift(gift);
    },
    [gameStage],
  );

  const handleToggleMission = (giftId: string, missionText: string) => {
    setSelectedMissions((prev) => {
      const next = { ...prev };
      if (next[giftId]) {
        delete next[giftId];
        return next;
      }
      if (Object.keys(next).length >= 3) {
        const firstKey = Object.keys(next)[0];
        if (firstKey) delete next[firstKey];
      }
      next[giftId] = missionText;
      return next;
    });
  };

  const captureTreeSnapshot = useCallback(() => {
    const canvas = webglCanvasRef.current;
    if (!canvas) return null;
    try {
      return canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  }, []);

  const handleCompletePlan = () => {
    clearFinaleTimers();
    setShowPlanModal(false);
    setGrowthStage(4);
    setGrowthProgress(4);
    setGameStage('complete');
    setFinaleActive(true);
    setTreeSnapshotUrl(null);

    // Move penguin nicely in front of the Dream Tree so it appears in the celebration shot
    penguinPosRef.current.set(0, 0, 3.8);
    clickTargetRef.current.active = false;
    setTargetMarker({ x: 0, z: 0, visible: false });

    // Save card via sheetClient (POST once per completed attempt)
    const currentAttemptId = attemptIdRef.current;
    if (selectedDream && !savedAttemptSetRef.current.has(currentAttemptId)) {
      savedAttemptSetRef.current.add(currentAttemptId);
      saveDreamCard({
        attemptId: currentAttemptId,
        class_code: classCode.trim().toUpperCase(),
        nickname,
        grade,
        dream: selectedDream.label,
        likes: answeredSnowmen.like || '',
        curious: answeredSnowmen.curious || '',
        good_at: answeredSnowmen['good-at'] || '',
        missions: Object.values(selectedMissions),
        frequency: selectedFrequency,
        promise: selectedPledge,
        quiz_score: quizScore,
      }).then((res) => {
        setSheetSaveNotice(res.message);
      });
    }

    // Capture crisp 3D snapshot mid-orbit once flowers have popped open
    const snapId = window.setTimeout(() => {
      const url = captureTreeSnapshot();
      if (url) setTreeSnapshotUrl(url);
    }, 2200);

    // Open Practice Card after 3.8s celebration orbit
    const openCardId = window.setTimeout(() => {
      setFinaleActive(false);
      setShowPracticeCard(true);
    }, 3800);

    finaleTimersRef.current.push(snapId, openCardId);
  };

  const handleSkipFinaleToCard = () => {
    clearFinaleTimers();
    if (!treeSnapshotUrl) {
      const url = captureTreeSnapshot();
      if (url) setTreeSnapshotUrl(url);
    }
    setFinaleActive(false);
    setShowPracticeCard(true);
  };

  const handleRestartGame = () => {
    stopSpeaking();
    clearFinaleTimers();
    setGameStage(1);
    setGrowthStage(0);
    setGrowthProgress(0);
    setSelectedDream(null);
    setSeedPlanted(false);
    setPendingOrb(null);
    setShowInterestPicker(false);
    setSeedFlight(null);
    setAnsweredSnowmen({});
    setActiveSnowmanQuestion(null);
    setLightBurst(null);
    pendingStage3AfterBurstRef.current = false;
    setOxIndex(0);
    setQuizScore(0);
    setOxFeedback(null);
    setOpenedGifts({});
    setActiveGift(null);
    setSelectedMissions({});
    setShowPlanModal(false);
    setSelectedFrequency('');
    setSelectedPledge('');
    setFinaleActive(false);
    setShowPracticeCard(false);
    setTreeSnapshotUrl(null);
    setSheetSaveNotice('');
    const nextAttempt = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    attemptIdRef.current = nextAttempt;
    try {
      window.sessionStorage.setItem('dream_seed_attempt_id', nextAttempt);
    } catch {
      // Ignore sessionStorage restriction
    }
    penguinPosRef.current.set(0, 0, 8.2);
    penguinYawRef.current = Math.PI;
    clickTargetRef.current.active = false;
    setTargetMarker({ x: 0, z: 0, visible: false });
    setResetCameraSignal((n) => n + 1);
  };

  if (teacherMode) {
    return (
      <TeacherForestView
        classCode={teacherClassCode}
        lowSpec={lowSpec}
        onToggleLowSpec={() => setLowSpec((prev) => !prev)}
        onExit={() => setTeacherMode(false)}
      />
    );
  }

  return (
    <main className="relative w-full h-full overflow-hidden select-none">
      <DreamIslandCanvas
        hasStarted={hasStarted}
        modalOpen={modalOpen}
        finaleActive={finaleActive}
        onCanvasReady={(canvas) => {
          webglCanvasRef.current = canvas;
        }}
        scarfColor={scarfColor}
        autoMove={autoMove}
        lowSpec={lowSpec}
        gameStage={gameStage}
        growthStage={growthStage}
        growthProgress={growthProgress}
        seedColor={selectedDream?.color ?? '#F4A259'}
        seedPlanted={seedPlanted}
        seedFlight={seedFlight}
        onSeedFlightComplete={handleSeedFlightComplete}
        lightBurst={lightBurst}
        onLightBurstComplete={handleLightBurstComplete}
        rainShowerKey={rainShowerKey}
        rainIsCorrect={rainIsCorrect}
        onTriggerSeedOrb={handleTriggerSeedOrb}
        answeredSnowmen={answeredSnowmen}
        onTriggerSnowman={handleTriggerSnowman}
        quizLocked={Boolean(oxFeedback)}
        onAnswerOx={handleAnswerOx}
        openedGifts={openedGifts}
        selectedMissions={selectedMissions}
        onTriggerGift={handleTriggerGift}
        guideTarget={guideTarget}
        penguinPosRef={penguinPosRef}
        penguinYawRef={penguinYawRef}
        clickTargetRef={clickTargetRef}
        targetMarker={targetMarker}
        onSelectGroundPoint={handleSelectGroundPoint}
        onReachClickTarget={handleReachClickTarget}
        onWaypointChange={() => {}}
        resetCameraSignal={resetCameraSignal}
      />

      {!hasStarted && (
        <StartScreen
          classCode={classCode}
          onClassCodeChange={setClassCode}
          grade={grade}
          onGradeChange={handleGradeChange}
          nickname={nickname}
          onRegenerateNickname={handleRegenerateNickname}
          scarfColor={scarfColor}
          onScarfColorChange={setScarfColor}
          onStart={handleStart}
          onOpenTeacherAuth={() => setTeacherAuthOpen(true)}
        />
      )}

      {teacherAuthOpen && (
        <TeacherAuthModal
          initialClassCode={classCode}
          onSuccess={(verifiedCode) => {
            setTeacherClassCode(verifiedCode);
            setTeacherAuthOpen(false);
            setTeacherMode(true);
          }}
          onClose={() => setTeacherAuthOpen(false)}
        />
      )}

      {hasStarted && !finaleActive && (
        <GrowthProgressBar
          growthStage={growthStage}
          gameStageLabel={gameStageLabel}
        />
      )}

      {!finaleActive && (
        <GameHUD
          classCode={classCode}
          grade={grade}
          nickname={nickname}
          scarfColor={scarfColor}
          onScarfColorChange={setScarfColor}
          autoMove={autoMove}
          onToggleAutoMove={handleToggleAutoMove}
          lowSpec={lowSpec}
          onToggleLowSpec={() => setLowSpec((prev) => !prev)}
          onResetCamera={() => setResetCameraSignal((n) => n + 1)}
          hasStarted={hasStarted}
          gameStage={gameStage}
          growthStage={growthStage}
          stageInstruction={stageInstruction}
          currentOxQuestion={currentOxQuestion}
          oxIndex={oxIndex}
          oxTotal={OX_QUIZ_QUESTIONS.length}
          quizLocked={Boolean(oxFeedback)}
          onAnswerOx={handleAnswerOx}
          selectedMissionCount={Object.keys(selectedMissions).length}
          onOpenPlanModal={() => setShowPlanModal(true)}
          onOpenCompletionCard={() => setShowPracticeCard(true)}
        />
      )}

      {finaleActive && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[calc(100vw-24px)] max-w-md">
          <div className="rounded-2xl bg-[#F6F8FC]/95 border-2 border-[#F4A259] shadow-xl px-5 py-3.5 flex items-center justify-between gap-3">
            <p className="font-display text-xl sm:text-2xl text-[#1E2A4A]">
              🌸 꽃이 활짝 피었어요!
            </p>
            <button
              type="button"
              onClick={handleSkipFinaleToCard}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-[#F4A259] hover:bg-[#EB9244] border border-[#D98236] text-sm font-extrabold text-[#1E2A4A] cursor-pointer whitespace-nowrap"
            >
              카드 보기
            </button>
          </div>
        </div>
      )}

      {hasStarted && (
        <StageOverlayUI
          pendingOrb={pendingOrb}
          showInterestPicker={showInterestPicker}
          onConfirmSeedOrb={handleConfirmSeedOrb}
          onCancelSeedOrb={() => setPendingOrb(null)}
          onSelectInterest={handleSelectInterest}
          onCancelInterestPicker={() => setShowInterestPicker(false)}
          activeSnowmanQuestion={activeSnowmanQuestion}
          answeredSnowmen={answeredSnowmen}
          onAnswerSnowman={handleAnswerSnowman}
          onCloseSnowman={() => setActiveSnowmanQuestion(null)}
          oxFeedback={oxFeedback}
          onNextOxQuestion={handleNextOxQuestion}
          activeGift={activeGift}
          selectedDream={selectedDream}
          selectedMissions={selectedMissions}
          onToggleMission={handleToggleMission}
          onCloseGift={() => setActiveGift(null)}
          onProceedToPlan={() => {
            setActiveGift(null);
            setShowPlanModal(true);
          }}
          showPlanModal={showPlanModal}
          selectedFrequency={selectedFrequency}
          onSelectFrequency={setSelectedFrequency}
          selectedPledge={selectedPledge}
          onSelectPledge={setSelectedPledge}
          onBackFromPlan={() => setShowPlanModal(false)}
          onCompletePlan={handleCompletePlan}
        />
      )}

      {hasStarted && showPracticeCard && selectedDream && (
        <DreamPracticeCardModal
          nickname={nickname}
          grade={grade}
          classCode={classCode}
          selectedDream={selectedDream}
          answeredSnowmen={answeredSnowmen}
          quizScore={quizScore}
          totalQuizzes={OX_QUIZ_QUESTIONS.length}
          selectedMissions={Object.values(selectedMissions)}
          selectedFrequency={selectedFrequency}
          selectedPledge={selectedPledge}
          treeSnapshotUrl={treeSnapshotUrl}
          sheetSaveNotice={sheetSaveNotice}
          onCloseToExplore={() => setShowPracticeCard(false)}
          onRestartGame={handleRestartGame}
        />
      )}
    </main>
  );
}
