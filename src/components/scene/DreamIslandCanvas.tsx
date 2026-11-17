import { Canvas } from '@react-three/fiber';
import { AlertCircle } from 'lucide-react';
import { MutableRefObject, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import {
  DreamSeedOption,
  GiftCategory,
  SnowmanQuestion,
} from '../../data/careerGameData';
import { GameStage, GrowthStageIndex, ScarfColorId } from '../../types/game';
import { detectDeviceCapabilities } from '../../utils/device';
import { SpeakButton } from '../SpeakButton';
import { FlightEffect } from './DreamPlant';
import { FollowCamera } from './FollowCamera';
import { PenguinCharacter } from './PenguinCharacter';
import { SkyAndSnow } from './SkyAndSnow';
import { StageProps3D } from './StageProps3D';
import { WinterIsland } from './WinterIsland';

interface DreamIslandCanvasProps {
  hasStarted: boolean;
  modalOpen: boolean;
  finaleActive: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  scarfColor: ScarfColorId;
  autoMove: boolean;
  lowSpec: boolean;
  gameStage: GameStage;
  growthStage: GrowthStageIndex;
  growthProgress: number;
  seedColor: string;
  seedPlanted: boolean;
  seedFlight: FlightEffect | null;
  onSeedFlightComplete: () => void;
  lightBurst: FlightEffect | null;
  onLightBurstComplete: () => void;
  rainShowerKey: number;
  rainIsCorrect: boolean;
  onTriggerSeedOrb: (option: DreamSeedOption, x: number, z: number) => void;
  answeredSnowmen: Record<string, string>;
  onTriggerSnowman: (q: SnowmanQuestion) => void;
  quizLocked: boolean;
  onAnswerOx: (choice: 'O' | 'X') => void;
  openedGifts: Record<string, boolean>;
  selectedMissions: Record<string, string>;
  onTriggerGift: (gift: GiftCategory) => void;
  guideTarget: { x: number; z: number } | null;
  penguinPosRef: MutableRefObject<THREE.Vector3>;
  penguinYawRef: MutableRefObject<number>;
  clickTargetRef: MutableRefObject<{ x: number; z: number; active: boolean }>;
  targetMarker: { x: number; z: number; visible: boolean };
  onSelectGroundPoint: (x: number, z: number) => void;
  onReachClickTarget: () => void;
  onWaypointChange: (label: string, description: string) => void;
  resetCameraSignal: number;
}

const WEBGL_FALLBACK_TEXT =
  '이 기기에서는 3D가 안 돼요. 다른 기기로 들어와 주세요';

export function DreamIslandCanvas({
  hasStarted,
  modalOpen,
  finaleActive,
  onCanvasReady,
  scarfColor,
  autoMove,
  lowSpec,
  gameStage,
  growthStage,
  growthProgress,
  seedColor,
  seedPlanted,
  seedFlight,
  onSeedFlightComplete,
  lightBurst,
  onLightBurstComplete,
  rainShowerKey,
  rainIsCorrect,
  onTriggerSeedOrb,
  answeredSnowmen,
  onTriggerSnowman,
  quizLocked,
  onAnswerOx,
  openedGifts,
  selectedMissions,
  onTriggerGift,
  guideTarget,
  penguinPosRef,
  penguinYawRef,
  clickTargetRef,
  targetMarker,
  onSelectGroundPoint,
  onReachClickTarget,
  onWaypointChange,
  resetCameraSignal,
}: DreamIslandCanvasProps) {
  const caps = useMemo(() => detectDeviceCapabilities(), []);
  const [contextLost, setContextLost] = useState(false);

  const enableShadows = caps.isDesktopPC && !lowSpec && !caps.isSoftwareGl;

  useEffect(() => {
    setContextLost(false);
  }, [lowSpec]);

  if (!caps.webglSupported) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-6 bg-[#E3EEFA] text-[#1E2A4A]">
        <div className="max-w-md w-full rounded-3xl bg-[#F6F8FC] border-2 border-[#C8DCF0] shadow-xl p-7 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF5EA] border-2 border-[#F4A259] flex items-center justify-center text-[#F4A259]">
            <AlertCircle className="w-9 h-9" aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-[#1E2A4A] leading-snug">
            {WEBGL_FALLBACK_TEXT}
          </h1>
          <p className="text-base font-bold text-[#1E2A4A]/75">
            크롬 브라우저나 다른 태블릿, 컴퓨터로 접속해 보세요.
          </p>
          <SpeakButton text={WEBGL_FALLBACK_TEXT} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-[#DCEBFA]">
      <Canvas
        key={lowSpec ? 'low-spec' : 'standard'}
        dpr={lowSpec ? 1 : [1, 1.5]}
        shadows={enableShadows}
        gl={{
          antialias: !lowSpec,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
        }}
        camera={{
          position: [0, 8.2, 16.5],
          fov: 46,
          near: 0.2,
          far: 240,
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;

          const canvas = gl.domElement;
          onCanvasReady?.(canvas);
          const handleLost = (e: Event) => {
            e.preventDefault();
            setContextLost(true);
          };
          const handleRestored = () => {
            setContextLost(false);
          };
          canvas.addEventListener('webglcontextlost', handleLost);
          canvas.addEventListener('webglcontextrestored', handleRestored);
        }}
      >
        <color attach="background" args={['#DCEBFA']} />
        <fog attach="fog" args={['#DCEBFA', 28, 105]} />

        <hemisphereLight args={['#E3EEFA', '#9EB6D2', 0.95]} />
        <directionalLight
          position={[14, 22, 12]}
          intensity={1.35}
          color="#FFF4E0"
          castShadow={enableShadows}
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0005}
          shadow-normalBias={0.02}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-camera-near={1}
          shadow-camera-far={60}
        />
        <directionalLight
          position={[-12, 10, -14]}
          intensity={0.45}
          color="#B8D6F6"
        />

        <SkyAndSnow lowSpec={lowSpec} />

        <WinterIsland
          hasStarted={hasStarted}
          modalOpen={modalOpen}
          finaleActive={finaleActive}
          gameStage={gameStage}
          growthStage={growthStage}
          growthProgress={growthProgress}
          seedColor={seedColor}
          seedFlight={seedFlight}
          onSeedFlightComplete={onSeedFlightComplete}
          lightBurst={lightBurst}
          onLightBurstComplete={onLightBurstComplete}
          rainShowerKey={rainShowerKey}
          rainIsCorrect={rainIsCorrect}
          onSelectGroundPoint={onSelectGroundPoint}
          targetMarker={targetMarker}
          enableShadows={enableShadows}
        />

        <StageProps3D
          hasStarted={hasStarted}
          modalOpen={modalOpen}
          gameStage={gameStage}
          penguinPosRef={penguinPosRef}
          seedPlanted={seedPlanted}
          onTriggerSeedOrb={onTriggerSeedOrb}
          answeredSnowmen={answeredSnowmen}
          onTriggerSnowman={onTriggerSnowman}
          quizLocked={quizLocked}
          onAnswerOx={onAnswerOx}
          openedGifts={openedGifts}
          selectedMissions={selectedMissions}
          onTriggerGift={onTriggerGift}
          guideTarget={guideTarget}
          enableShadows={enableShadows}
        />

        <PenguinCharacter
          scarfColor={scarfColor}
          hasStarted={hasStarted}
          modalOpen={modalOpen}
          autoMove={autoMove}
          guideTarget={guideTarget}
          penguinPosRef={penguinPosRef}
          penguinYawRef={penguinYawRef}
          clickTargetRef={clickTargetRef}
          onReachClickTarget={onReachClickTarget}
          onWaypointChange={onWaypointChange}
          enableShadows={enableShadows}
          isCelebrating={finaleActive}
        />

        <FollowCamera
          hasStarted={hasStarted}
          finaleActive={finaleActive}
          penguinPosRef={penguinPosRef}
          penguinYawRef={penguinYawRef}
          resetCameraSignal={resetCameraSignal}
        />
      </Canvas>

      {contextLost && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-[#E3EEFA]/95 text-[#1E2A4A]">
          <div className="max-w-md w-full rounded-3xl bg-[#F6F8FC] border-2 border-[#C8DCF0] shadow-xl p-6 text-center flex flex-col items-center gap-3">
            <h2 className="font-display text-2xl">화면이 잠시 쉬고 있어요</h2>
            <p className="text-base font-bold text-[#1E2A4A]/80">
              잠시 후 다시 열리거나 저사양 모드를 켜 보세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
