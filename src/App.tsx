import { useCallback, useEffect, useRef, useState } from 'react';
import { GameHUD } from './components/GameHUD';
import { AssassinEngine } from './game/AssassinEngine';
import type {
  CameraPreset,
  DialogueMessage,
  GameSnapshot,
  HotelFloor,
  HotelRoomId,
  LanguageCode,
  OutfitId,
  ShopItemId,
  TalkTargetInfo,
  WeaponId,
} from './types/game';

const INITIAL_SNAPSHOT: GameSnapshot = {
  phase: 'intro',
  language: 'en',
  weather: 'sunny',
  weatherVisibilityPct: 128,
  inGameTimeStr: '21:35',
  currentMap: 'city',
  hasPlaneTicketTo: null,
  ticketKioskOpen: false,
  policeMenuOpen: false,
  arrestedFighters: [],
  companionCount: 0,
  inHoldingCell: false,
  holdingCellBail: 200,
  prisonNeeds: { hunger: 82, energy: 86, hygiene: 82, strength: 15 },
  prisonEscapeProgress: 0,
  planeIntegrity: 100,
  elevatorRiding: false,
  canSurrender: false,
  cash: 250,
  hasWine: false,
  wineDelivered: false,
  drunkTimer: 0,
  hotelFloor: 1,
  elevatorMenuOpen: false,
  phoneOpen: false,
  watchedVideoIds: [],
  revealedHouses: [],
  robbedHouses: [],
  peopleHelped: 0,
  suitRewardClaimed: false,
  activeSideMissions: [],
  supermarketOpen: false,
  inSupermarket: false,
  armor: 0,
  missionsCompleted: 0,
  bankDataHacked: false,
  airportBriefcaseRecovered: false,
  coastPackageRecovered: false,
  skyRelayHacked: false,
  health: 100,
  maxHealth: 100,
  stamina: 100,
  wantedLevel: 0,
  equippedWeapon: 'blades',
  outfit: 'tactical',
  appearanceMenuOpen: false,
  lockpickMinigameOpen: false,
  nearCarLocked: false,
  hotelRoomMenuOpen: false,
  chosenHotelRoom: null,
  hotelHeistState: 'none',
  policeResponding: false,
  activeCinematic: 'none',
  suspicionLevel: 0,
  policeCallProgress: 0,
  wantedPostersCount: 0,
  canSilenceWitness: false,
  weaponWheelOpen: false,
  isCrouching: false,
  isSprinting: false,
  isRegenerating: false,
  activeRegenStage: 'none',
  isRagdoll: false,
  deathReason: null,
  inVehicle: false,
  vehicleSpeedKmh: 0,
  limbs: {
    leftArm: { condition: 'intact', regenProgress: 0, stage: 'none' },
    rightArm: { condition: 'intact', regenProgress: 0, stage: 'none' },
    leftLeg: { condition: 'intact', regenProgress: 0, stage: 'none' },
    rightLeg: { condition: 'intact', regenProgress: 0, stage: 'none' },
    torso: { condition: 'intact', regenProgress: 0, stage: 'none' },
  },
  targetsRemaining: 3,
  totalTargets: 3,
  guardsEliminated: 0,
  totalEnemies: 14,
  stealthState: 'hidden',
  currentZone: 'Downtown Central Avenue',
  contextPrompt: null,
  talkTarget: null,
  cameraPreset: 'combat',
  pointerLocked: false,
  ttsStatus: 'initializing',
  caption: null,
  radarBlips: [],
  kunaiCooldown: 0,
  elapsedSeconds: 0,
};

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<AssassinEngine | null>(null);

  const [snapshot, setSnapshot] = useState<GameSnapshot>(INITIAL_SNAPSHOT);
  const [dockOpen, setDockOpen] = useState(false); // Minimal HUD by default
  const [muted, setMuted] = useState(false);
  const [contextLost, setContextLost] = useState(false);

  const [chatTarget, setChatTarget] = useState<TalkTargetInfo | null>(null);
  const [chatHistory, setChatHistory] = useState<DialogueMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatAbortRef = useRef<AbortController | null>(null);
  const snapshotRef = useRef<GameSnapshot>(INITIAL_SNAPSHOT);
  snapshotRef.current = snapshot;

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const engine = new AssassinEngine(
      mount,
      (nextSnap) => setSnapshot(nextSnap),
      () => setContextLost(true),
      (target) => {
        setChatTarget(target);
        setChatHistory([]);
      },
    );
    engineRef.current = engine;

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyH') {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        setDockOpen((prev) => !prev);
      } else if (e.code === 'Escape') {
        setChatTarget(null);
        engineRef.current?.setConversationActive(false);
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const handleStartMission = useCallback(() => {
    setChatTarget(null);
    setChatHistory([]);
    engineRef.current?.startGame();
  }, []);

  const handleRestart = useCallback(() => {
    setChatTarget(null);
    setChatHistory([]);
    engineRef.current?.startGame();
  }, []);

  const handleCameraPreset = useCallback((preset: CameraPreset) => {
    engineRef.current?.setCameraPreset(preset);
  }, []);

  const handleSelectWeapon = useCallback((weapon: WeaponId) => {
    engineRef.current?.setWeapon(weapon);
  }, []);

  const handleSelectOutfit = useCallback((outfit: OutfitId) => {
    engineRef.current?.setOutfit(outfit);
  }, []);

  const handleCloseAppearance = useCallback(() => {
    engineRef.current?.toggleAppearanceMenu(false);
  }, []);

  const handleCloseWheel = useCallback(() => {
    engineRef.current?.toggleWeaponWheel(false);
  }, []);

  const handleTriggerRegen = useCallback(() => {
    engineRef.current?.triggerRegeneration();
  }, []);

  const handleInflictTrauma = useCallback(
    (kind: 'severRightArm' | 'severLeftLeg' | 'breakLeg' | 'breakRibs') => {
      engineRef.current?.inflictTestTrauma(kind);
    },
    [],
  );

  const handleToggleMute = useCallback(() => {
    if (!engineRef.current) return;
    setMuted(engineRef.current.toggleMute());
  }, []);

  const handleLockPointer = useCallback(() => {
    engineRef.current?.requestPointerLock();
  }, []);

  const handleCloseChat = useCallback(() => {
    chatAbortRef.current?.abort();
    chatAbortRef.current = null;
    setChatTarget(null);
    setChatLoading(false);
    engineRef.current?.setConversationActive(false);
  }, []);

  const handleLanguageChange = useCallback((lang: LanguageCode) => {
    engineRef.current?.setLanguage(lang);
  }, []);

  const handleSkipIntro = useCallback(() => {
    engineRef.current?.skipIntro();
  }, []);

  const handleLockpickTick = useCallback((success: boolean) => {
    engineRef.current?.playLockpickTick(success);
  }, []);

  const handleLockpickComplete = useCallback((success: boolean) => {
    engineRef.current?.completeLockpickMinigame(success);
  }, []);

  const handleLockpickCancel = useCallback(() => {
    engineRef.current?.cancelLockpickMinigame();
  }, []);

  const handleLockpickSmash = useCallback(() => {
    engineRef.current?.triggerSmashFromMinigame();
  }, []);

  const handleSelectHotelRoom = useCallback((roomId: HotelRoomId) => {
    engineRef.current?.selectHotelRoom(roomId);
  }, []);

  const handleCloseHotelMenu = useCallback(() => {
    engineRef.current?.closeHotelRoomMenu();
  }, []);

  const handleCycleWeather = useCallback(() => {
    engineRef.current?.cycleWeather();
  }, []);

  const handleTogglePhone = useCallback(() => {
    engineRef.current?.togglePhone();
  }, []);

  const handleWatchPhoneVideo = useCallback((videoId: string) => {
    engineRef.current?.watchPhoneVideo(videoId);
  }, []);

  const handleDrinkWine = useCallback(() => {
    engineRef.current?.drinkWine();
  }, []);

  const handleUseElevator = useCallback((floor: HotelFloor) => {
    engineRef.current?.useHotelElevator(floor);
  }, []);

  const handleCloseElevator = useCallback(() => {
    engineRef.current?.closeElevatorMenu();
  }, []);

  const handleCloseTicketKiosk = useCallback(() => {
    engineRef.current?.closeTicketKiosk();
  }, []);

  const handleBuyPlaneTicket = useCallback((dest: 'coast' | 'sky') => {
    engineRef.current?.buyPlaneTicket(dest);
  }, []);

  const handleClosePoliceMenu = useCallback(() => {
    engineRef.current?.closePoliceMenu();
  }, []);

  const handlePayFighterBail = useCallback((fighterId: string) => {
    engineRef.current?.payFighterBail(fighterId);
  }, []);

  const handlePayHoldingCellBail = useCallback(() => {
    engineRef.current?.payHoldingCellBail();
  }, []);

  const handleSurrender = useCallback(() => {
    engineRef.current?.surrenderToPolice();
  }, []);

  const handleCloseSupermarket = useCallback(() => {
    engineRef.current?.closeSupermarket();
  }, []);

  const handleBuySupermarketItem = useCallback((itemId: ShopItemId) => {
    engineRef.current?.buySupermarketItem(itemId);
  }, []);

  const handleSendChat = useCallback(
    async (text: string) => {
      if (!chatTarget) return;
      chatAbortRef.current?.abort();
      const controller = new AbortController();
      chatAbortRef.current = controller;
      const timeoutId = window.setTimeout(() => controller.abort(), 5000);

      const nextHist: DialogueMessage[] = [
        ...chatHistory,
        { sender: 'player', text },
      ];
      setChatHistory(nextHist);
      setChatLoading(true);

      const upsertNpcBubble = (replyText: string) => {
        setChatHistory((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.sender === 'npc' && prev.length > nextHist.length) {
            return [...prev.slice(0, -1), { sender: 'npc', text: replyText }];
          }
          return [...prev, { sender: 'npc', text: replyText }];
        });
      };

      try {
        const snap = snapshotRef.current;
        const res = await fetch('/api/npc-chat?stream=1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            npcName: chatTarget.name,
            npcRole: chatTarget.role,
            zone: chatTarget.zone,
            wantedLevel: snap.wantedLevel,
            equippedWeapon: snap.equippedWeapon,
            language: snap.language,
            playerMessage: text,
            history: nextHist,
          }),
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('text/event-stream') && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let finalReply = '';
          let finalMood = 'calm';

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() ?? '';

            for (const block of lines) {
              const dataLine = block
                .split('\n')
                .find((l) => l.startsWith('data: '));
              if (!dataLine) continue;
              try {
                const evt = JSON.parse(dataLine.slice(6)) as {
                  partial?: string;
                  reply?: string;
                  mood?: string;
                  done?: boolean;
                  error?: string;
                };
                if (evt.partial) {
                  setChatLoading(false);
                  upsertNpcBubble(evt.partial);
                }
                if (evt.reply) finalReply = evt.reply;
                if (evt.mood) finalMood = evt.mood;
              } catch {
                // ignore malformed partial frame
              }
            }
          }

          const spokenReply =
            finalReply || 'Watch yourself out here tonight, stranger.';
          upsertNpcBubble(spokenReply);
          void engineRef.current?.speakAiReply(chatTarget.id, spokenReply, finalMood);
        } else if (res.ok) {
          const data = (await res.json()) as { reply?: string; mood?: string };
          const reply =
            data.reply || 'Watch yourself out here tonight, stranger.';
          const mood = data.mood || 'calm';
          upsertNpcBubble(reply);
          void engineRef.current?.speakAiReply(chatTarget.id, reply, mood);
        } else {
          const fallbackReply =
            snap.wantedLevel > 0
              ? "Stay back! I don't want any trouble!"
              : 'Just a quiet shift on the avenue. Keep moving.';
          upsertNpcBubble(fallbackReply);
          void engineRef.current?.speakAiReply(
            chatTarget.id,
            fallbackReply,
            snap.wantedLevel > 0 ? 'nervous' : 'calm',
          );
        }
      } catch {
        const fallback = 'Keep moving along, friend.';
        upsertNpcBubble(fallback);
        void engineRef.current?.speakAiReply(chatTarget.id, fallback, 'calm');
      } finally {
        window.clearTimeout(timeoutId);
        if (chatAbortRef.current === controller) {
          chatAbortRef.current = null;
        }
        setChatLoading(false);
      }
    },
    [chatTarget, chatHistory],
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#070a11]">
      {/* Isolated WebGL canvas mount container */}
      <div ref={canvasMountRef} className="h-full w-full" />

      {contextLost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070a11]/95 p-6 text-center">
          <div className="max-w-sm rounded-xl border border-white/15 bg-[#0d1320] p-6">
            <h2 className="font-display text-lg font-semibold text-white">
              Graphics Context Interrupted
            </h2>
            <p className="mt-2 text-xs text-slate-300">
              WebGL context was paused by the browser. Reload the mission to
              resume rendering.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950"
            >
              Reload Game
            </button>
          </div>
        </div>
      )}

      <GameHUD
        snapshot={snapshot}
        dockOpen={dockOpen}
        muted={muted}
        chatTarget={chatTarget}
        chatHistory={chatHistory}
        chatLoading={chatLoading}
        onToggleDock={() => setDockOpen((prev) => !prev)}
        onStartMission={handleStartMission}
        onRestart={handleRestart}
        onCameraPreset={handleCameraPreset}
        onSelectWeapon={handleSelectWeapon}
        onSelectOutfit={handleSelectOutfit}
        onCloseAppearance={handleCloseAppearance}
        onCloseWheel={handleCloseWheel}
        onTriggerRegen={handleTriggerRegen}
        onInflictTrauma={handleInflictTrauma}
        onToggleMute={handleToggleMute}
        onLockPointer={handleLockPointer}
        onSendChat={handleSendChat}
        onCloseChat={handleCloseChat}
        onLanguageChange={handleLanguageChange}
        onSkipIntro={handleSkipIntro}
        onLockpickTick={handleLockpickTick}
        onLockpickComplete={handleLockpickComplete}
        onLockpickCancel={handleLockpickCancel}
        onLockpickSmash={handleLockpickSmash}
        onSelectHotelRoom={handleSelectHotelRoom}
        onCloseHotelMenu={handleCloseHotelMenu}
        onCycleWeather={handleCycleWeather}
        onTogglePhone={handleTogglePhone}
        onWatchPhoneVideo={handleWatchPhoneVideo}
        onDrinkWine={handleDrinkWine}
        onUseElevator={handleUseElevator}
        onCloseElevator={handleCloseElevator}
        onCloseTicketKiosk={handleCloseTicketKiosk}
        onBuyPlaneTicket={handleBuyPlaneTicket}
        onClosePoliceMenu={handleClosePoliceMenu}
        onPayFighterBail={handlePayFighterBail}
        onPayHoldingCellBail={handlePayHoldingCellBail}
        onSurrender={handleSurrender}
        onCloseSupermarket={handleCloseSupermarket}
        onBuySupermarketItem={handleBuySupermarketItem}
      />
    </div>
  );
}
