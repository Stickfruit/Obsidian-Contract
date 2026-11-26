import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BedDouble,
  Building2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cloud,
  CloudFog,
  CloudRain,
  Crosshair,
  DollarSign,
  Eye,
  FileKey2,
  KeyRound,
  Lock,
  MessageSquare,
  Music,
  PhoneCall,
  Plane,
  RotateCcw,
  Send,
  Shield,
  ShieldAlert,
  Shirt,
  ShoppingCart,
  Smartphone,
  Star,
  Sun,
  Users,
  Volume2,
  VolumeX,
  Wine,
  X,
} from 'lucide-react';
import type {
  CameraPreset,
  DialogueMessage,
  GameSnapshot,
  HotelFloor,
  HotelRoomId,
  LanguageCode,
  LimbId,
  OutfitId,
  ShopItemId,
  TalkTargetInfo,
  WeaponId,
} from '../types/game';
import { LANGUAGE_OPTIONS, UI_STRINGS } from '../i18n/translations';
import { PhoneOverlay } from './PhoneOverlay';

interface GameHUDProps {
  snapshot: GameSnapshot;
  dockOpen: boolean;
  muted: boolean;
  chatTarget: TalkTargetInfo | null;
  chatHistory: DialogueMessage[];
  chatLoading: boolean;
  onToggleDock: () => void;
  onStartMission: () => void;
  onRestart: () => void;
  onCameraPreset: (preset: CameraPreset) => void;
  onSelectWeapon: (weapon: WeaponId) => void;
  onSelectOutfit: (outfit: OutfitId) => void;
  onCloseAppearance: () => void;
  onCloseWheel: () => void;
  onTriggerRegen: () => void;
  onInflictTrauma: (
    kind: 'severRightArm' | 'severLeftLeg' | 'breakLeg' | 'breakRibs',
  ) => void;
  onToggleMute: () => void;
  onLockPointer: () => void;
  onSendChat: (text: string) => void;
  onCloseChat: () => void;
  onLanguageChange: (lang: LanguageCode) => void;
  onSkipIntro: () => void;
  onLockpickTick: (success: boolean) => void;
  onLockpickComplete: (success: boolean) => void;
  onLockpickCancel: () => void;
  onLockpickSmash: () => void;
  onSelectHotelRoom: (roomId: HotelRoomId) => void;
  onCloseHotelMenu: () => void;
  onCycleWeather: () => void;
  onTogglePhone: () => void;
  onWatchPhoneVideo: (videoId: string) => void;
  onDrinkWine: () => void;
  onUseElevator: (floor: HotelFloor) => void;
  onCloseElevator: () => void;
  onCloseTicketKiosk: () => void;
  onBuyPlaneTicket: (dest: 'coast' | 'sky') => void;
  onClosePoliceMenu: () => void;
  onPayFighterBail: (fighterId: string) => void;
  onPayHoldingCellBail: () => void;
  onSurrender: () => void;
  onCloseSupermarket: () => void;
  onBuySupermarketItem: (itemId: ShopItemId) => void;
}

const OUTFIT_SWATCHES: Array<{ id: OutfitId; color: string }> = [
  { id: 'tactical', color: '#1a202c' },
  { id: 'street', color: '#d8d6cf' },
  { id: 'suit', color: '#7f1d1d' },
  { id: 'worker', color: '#eab308' },
  { id: 'leather', color: '#6b141a' },
  { id: 'coastal', color: '#0f766e' },
  { id: 'trench', color: '#a17c52' },
  { id: 'cyber', color: '#38bdf8' },
];

const WEAPON_WHEEL_LAYOUT: Array<{
  id: WeaponId;
  key: string;
  angleDeg: number;
}> = [
  { id: 'blades', key: '2', angleDeg: -90 },
  { id: 'pistol', key: '4', angleDeg: -38.6 },
  { id: 'shotgun', key: '5', angleDeg: 12.8 },
  { id: 'lockpick', key: '6', angleDeg: 64.3 },
  { id: 'phone', key: '7', angleDeg: 115.7 },
  { id: 'kunai', key: '3', angleDeg: 167.1 },
  { id: 'unarmed', key: '1', angleDeg: 218.6 },
];

function limbColor(snapshot: GameSnapshot, id: LimbId): string {
  const st = snapshot.limbs[id];
  if (st.condition === 'intact') return '#94a3b8';
  if (st.regenProgress > 0) {
    if (st.stage === 'bone') return '#fde047';
    if (st.stage === 'flesh') return '#ef4444';
    if (st.stage === 'skin') return '#fdba74';
    return '#38bdf8';
  }
  return st.condition === 'severed' ? '#ef4444' : '#f59e0b';
}

interface LockpickModalProps {
  title: string;
  subtitle: string;
  setPinLabel: string;
  cancelLabel: string;
  smashLabel: string;
  pinLabel: string;
  onTick: (success: boolean) => void;
  onComplete: (success: boolean) => void;
  onCancel: () => void;
  onSmashInstead: () => void;
}

const LockpickMinigameOverlay: React.FC<LockpickModalProps> = ({
  title,
  subtitle,
  setPinLabel,
  cancelLabel,
  smashLabel,
  pinLabel,
  onTick,
  onComplete,
  onCancel,
  onSmashInstead,
}) => {
  const [pinIndex, setPinIndex] = useState(0);
  const [cursor, setCursor] = useState(18);
  const [missFlash, setMissFlash] = useState(false);
  const [zones] = useState<Array<[number, number]>>(() => [
    [26 + Math.random() * 14, 24],
    [44 + Math.random() * 18, 21],
    [22 + Math.random() * 44, 19],
  ]);

  const cursorRef = useRef(18);
  const dirRef = useRef(1);
  const pinRef = useRef(0);
  pinRef.current = pinIndex;

  useEffect(() => {
    let rafId = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const speed = 105 + pinRef.current * 24;
      let next = cursorRef.current + dirRef.current * speed * dt;
      if (next >= 98) {
        next = 98;
        dirRef.current = -1;
      } else if (next <= 2) {
        next = 2;
        dirRef.current = 1;
      }
      cursorRef.current = next;
      setCursor(next);
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const attemptPin = useCallback(() => {
    const idx = pinRef.current;
    if (idx >= 3) return;
    const [zStart, zWidth] = zones[idx];
    const pos = cursorRef.current;
    const hit = pos >= zStart - 2 && pos <= zStart + zWidth + 2;
    if (hit) {
      onTick(true);
      const nextPin = idx + 1;
      setPinIndex(nextPin);
      if (nextPin >= 3) {
        window.setTimeout(() => onComplete(true), 160);
      }
    } else {
      onTick(false);
      setMissFlash(true);
      window.setTimeout(() => setMissFlash(false), 240);
    }
  }, [onComplete, onTick, zones]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        attemptPin();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [attemptPin, onCancel]);

  const activeZone = zones[Math.min(2, pinIndex)];

  return (
    <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-[#05080f]/68 p-4">
      <div className="w-full max-w-md rounded-2xl border border-amber-400/35 bg-[#090d16]/96 p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <KeyRound className="h-4 w-4" />
              {title}
            </div>
            <p className="mt-1 text-xs text-slate-300">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Cancel lockpick"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 3 Lock Tumbler Cylinders */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[0, 1, 2].map((idx) => {
            const unlocked = idx < pinIndex;
            const current = idx === pinIndex;
            return (
              <div
                key={idx}
                className={`flex flex-col items-center rounded-xl border py-3 px-2 transition-colors ${
                  unlocked
                    ? 'border-emerald-400/50 bg-emerald-500/15'
                    : current
                      ? 'border-amber-400/60 bg-amber-500/10'
                      : 'border-white/10 bg-slate-900/70'
                }`}
              >
                <div className="relative flex h-12 w-5 items-end justify-center overflow-hidden rounded-full border border-white/15 bg-slate-950 p-1">
                  <div
                    className={`w-full rounded-full transition-all duration-150 ${
                      unlocked
                        ? 'h-9 bg-emerald-400'
                        : current
                          ? 'h-5 bg-amber-400'
                          : 'h-3 bg-slate-600'
                    }`}
                  />
                </div>
                <span className="mt-2 font-mono-num text-[11px] font-semibold text-slate-200">
                  {pinLabel} {idx + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* Sweet-Spot Timing Bar */}
        <div
          className={`mt-5 rounded-xl border p-3 transition-colors ${
            missFlash
              ? 'border-red-500/80 bg-red-950/40'
              : 'border-white/15 bg-slate-950/90'
          }`}
        >
          <div className="relative h-6 w-full overflow-hidden rounded-lg bg-slate-900">
            <div
              className="absolute inset-y-0 rounded-md bg-emerald-500/35 border-x border-emerald-400"
              style={{
                left: `${activeZone[0]}%`,
                width: `${activeZone[1]}%`,
              }}
            />
            <div
              className="absolute inset-y-0 w-1.5 -translate-x-1/2 rounded-full bg-amber-300 shadow-[0_0_10px_#fcd34d]"
              style={{ left: `${cursor}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={attemptPin}
            className="flex-1 rounded-lg bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
          >
            {setPinLabel}
          </button>
          <button
            type="button"
            onClick={onSmashInstead}
            className="rounded-lg border border-red-500/40 bg-red-950/45 px-3 py-2.5 text-xs font-semibold text-red-200 hover:bg-red-900/60 transition-colors"
          >
            {smashLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export const GameHUD: React.FC<GameHUDProps> = ({
  snapshot,
  dockOpen,
  muted,
  chatTarget,
  chatHistory,
  chatLoading,
  onToggleDock,
  onStartMission,
  onRestart,
  onCameraPreset,
  onSelectWeapon,
  onSelectOutfit,
  onCloseAppearance,
  onCloseWheel,
  onTriggerRegen,
  onInflictTrauma,
  onToggleMute,
  onLockPointer,
  onSendChat,
  onCloseChat,
  onLanguageChange,
  onSkipIntro,
  onLockpickTick,
  onLockpickComplete,
  onLockpickCancel,
  onLockpickSmash,
  onSelectHotelRoom,
  onCloseHotelMenu,
  onCycleWeather,
  onTogglePhone,
  onWatchPhoneVideo,
  onDrinkWine,
  onUseElevator,
  onCloseElevator,
  onCloseTicketKiosk,
  onBuyPlaneTicket,
  onClosePoliceMenu,
  onPayFighterBail,
  onPayHoldingCellBail,
  onSurrender,
  onCloseSupermarket,
  onBuySupermarketItem,
}) => {
  const [chatInput, setChatInput] = useState('');
  const t = UI_STRINGS[snapshot.language];

  const anyInjured = (
    ['leftArm', 'rightArm', 'leftLeg', 'rightLeg', 'torso'] as LimbId[]
  ).some((id) => snapshot.limbs[id].condition !== 'intact');

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || chatLoading) return;
    setChatInput('');
    onSendChat(trimmed);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between">
      {/* Subtle Drunk Wine Edge Vignette */}
      {snapshot.phase === 'playing' && snapshot.drunkTimer > 0 && (
        <div
          className="pointer-events-none fixed inset-0 z-10"
          style={{
            boxShadow: 'inset 0 0 110px rgba(159, 18, 57, 0.42)',
          }}
        />
      )}

      {/* Persistent "MADE BY NEURON" Banner throughout Intro & Title Reveal */}
      {(snapshot.phase === 'intro' || snapshot.phase === 'briefing') && (
        <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex flex-col items-center justify-center px-4 text-center">
          <div className="rounded-md border border-amber-400/35 bg-[#070a12]/85 px-5 py-1.5 shadow-xl">
            <span className="font-display text-xs font-bold tracking-[0.42em] text-amber-300 sm:text-sm">
              MADE BY NEURON
            </span>
          </div>
        </div>
      )}

      {/* Minimal Skip Control during Intro Cutscene */}
      {snapshot.phase === 'intro' && (
        <div className="pointer-events-auto fixed bottom-6 right-6 z-50 flex items-center gap-2">
          <button
            type="button"
            onClick={onSkipIntro}
            className="rounded-lg border border-white/15 bg-[#090d16]/80 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:border-amber-400/60 hover:text-white transition-colors"
          >
            {t.skipIntro}
          </button>
        </div>
      )}

      {/* Subtle Cinematic Letterbox Framing */}
      {snapshot.phase === 'playing' && snapshot.activeCinematic !== 'none' && (
        <>
          <div className="pointer-events-none fixed inset-x-0 top-0 z-20 h-10 bg-[#05070d]/92 border-b border-white/10" />
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-10 bg-[#05070d]/92 border-t border-white/10" />
        </>
      )}

      {/* Top Row: Minimal Vitals + Wanted Stars + Radar */}
      {snapshot.phase === 'playing' && snapshot.activeCinematic === 'none' && (
        <div className="flex items-start justify-between p-4">
          <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-white/10 bg-[#090d16]/85 px-3 py-2.5 shadow-xl">
            {/* Compact Anatomical Silhouette */}
            <svg
              width="32"
              height="48"
              viewBox="0 0 44 64"
              fill="none"
              aria-label="Assassin body status"
              className="shrink-0"
            >
              <circle cx="22" cy="8" r="5" fill="#94a3b8" />
              <rect
                x="16"
                y="15"
                width="12"
                height="20"
                rx="2"
                fill={limbColor(snapshot, 'torso')}
              />
              <rect
                x="7"
                y="16"
                width="6"
                height="18"
                rx="2"
                fill={limbColor(snapshot, 'leftArm')}
                opacity={
                  snapshot.limbs.leftArm.condition === 'severed' &&
                  snapshot.limbs.leftArm.regenProgress === 0
                    ? 0.25
                    : 1
                }
              />
              <rect
                x="31"
                y="16"
                width="6"
                height="18"
                rx="2"
                fill={limbColor(snapshot, 'rightArm')}
                opacity={
                  snapshot.limbs.rightArm.condition === 'severed' &&
                  snapshot.limbs.rightArm.regenProgress === 0
                    ? 0.25
                    : 1
                }
              />
              <rect
                x="15"
                y="37"
                width="6"
                height="22"
                rx="2"
                fill={limbColor(snapshot, 'leftLeg')}
                opacity={
                  snapshot.limbs.leftLeg.condition === 'severed' &&
                  snapshot.limbs.leftLeg.regenProgress === 0
                    ? 0.25
                    : 1
                }
              />
              <rect
                x="23"
                y="37"
                width="6"
                height="22"
                rx="2"
                fill={limbColor(snapshot, 'rightLeg')}
                opacity={
                  snapshot.limbs.rightLeg.condition === 'severed' &&
                  snapshot.limbs.rightLeg.regenProgress === 0
                    ? 0.25
                    : 1
                }
              />
            </svg>

            <div className="flex min-w-[165px] flex-col gap-1.5">
              {/* Health & Wanted Stars */}
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono-num text-xs font-semibold text-slate-100">
                  {snapshot.health} {t.hp}
                </span>
                <div className="flex items-center gap-0.5" title={t.wanted}>
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${
                        s <= snapshot.wantedLevel
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full origin-left bg-red-500 transition-transform duration-150"
                  style={{
                    transform: `scaleX(${Math.max(0, snapshot.health / snapshot.maxHealth)})`,
                  }}
                />
              </div>

              {snapshot.armor > 0 && (
                <div className="flex items-center gap-2 text-[10px] text-sky-300">
                  <span className="inline-flex items-center gap-1 font-semibold shrink-0">
                    <Shield className="h-3 w-3" />
                    {t.armorLabel} {Math.round(snapshot.armor)}%
                  </span>
                  <div className="h-1 flex-1 overflow-hidden rounded bg-slate-800">
                    <div
                      className="h-full origin-left bg-sky-400 transition-transform duration-150"
                      style={{
                        transform: `scaleX(${Math.min(1, Math.max(0, snapshot.armor / 100))})`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <span className="font-mono-num text-amber-300">
                  {snapshot.targetsRemaining}/{snapshot.totalTargets} {t.targets}
                </span>
                <span aria-hidden="true">·</span>
                <span className="uppercase tracking-wide text-slate-400">
                  {snapshot.inVehicle
                    ? `${snapshot.vehicleSpeedKmh} KM/H`
                    : t.weapons[snapshot.equippedWeapon].label}
                </span>
              </div>
              <div className="max-w-[235px] truncate text-[10px] text-slate-400">
                <span className="font-semibold text-amber-300">
                  {t.mapNames[snapshot.currentMap]}
                </span>{' '}
                · {snapshot.currentZone}
                {snapshot.currentZone.includes('Hotel')
                  ? ` · ${t.hotelFloorLabel} ${snapshot.hotelFloor}F`
                  : ''}{' '}
                · {t.outfits[snapshot.outfit].label}
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="inline-flex items-center gap-1 font-mono-num text-amber-300">
                  <Clock className="h-3 w-3" />
                  {snapshot.inGameTimeStr}
                </span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span className="inline-flex items-center gap-0.5 font-mono-num font-semibold text-emerald-300">
                  <DollarSign className="h-3 w-3" />
                  {snapshot.cash}
                </span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <button
                  type="button"
                  onClick={onCycleWeather}
                  title={t.cycleWeather}
                  className="inline-flex items-center gap-1 text-slate-200 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
                >
                  {snapshot.weather === 'sunny' ? (
                    <Sun className="h-3 w-3 text-amber-400" />
                  ) : snapshot.weather === 'rain' ? (
                    <CloudRain className="h-3 w-3 text-sky-400" />
                  ) : snapshot.weather === 'fog' ? (
                    <CloudFog className="h-3 w-3 text-slate-300" />
                  ) : (
                    <Cloud className="h-3 w-3 text-slate-400" />
                  )}
                  <span>{t.weatherNames[snapshot.weather]}</span>
                </button>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span className="font-mono-num text-slate-400">
                  {snapshot.weatherVisibilityPct}% {t.weatherVisLabel}
                </span>
              </div>
              {snapshot.inSupermarket && (
                <div className="flex items-center gap-1.5 rounded border border-emerald-400/30 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  <Music className="h-3 w-3 shrink-0" />
                  <span>{t.supermarketMusicBadge}</span>
                </div>
              )}
              {snapshot.hasWine && (
                <div className="flex items-center justify-between gap-2 text-[10px] text-rose-300">
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <Wine className="h-3 w-3 shrink-0" />
                    {t.hasWineTag}
                  </span>
                  <button
                    type="button"
                    onClick={onDrinkWine}
                    className="rounded border border-rose-400/40 bg-rose-950/60 px-1.5 py-0.5 text-[9px] font-bold uppercase text-rose-200 hover:bg-rose-800/70 transition-colors"
                  >
                    {t.drinkWineBtn}
                  </button>
                </div>
              )}
              {(snapshot.activeSideMissions.length > 0 ||
                snapshot.robbedHouses.length > 0 ||
                snapshot.peopleHelped > 0) && (
                <div className="space-y-0.5 border-t border-white/10 pt-1 text-[10px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-semibold uppercase tracking-wider text-sky-300">
                      {t.sideMissionsTitle}
                    </span>
                    <span className="font-mono-num">
                      {t.missionBurglaryLabel}: {snapshot.robbedHouses.length}/3 ·{' '}
                      {t.missionPoorTitle}: {snapshot.peopleHelped}/3
                    </span>
                  </div>
                  {snapshot.activeSideMissions.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[205px] truncate ${
                        m.done
                          ? 'text-emerald-400 line-through'
                          : 'text-amber-200'
                      }`}
                    >
                      {m.title}
                    </div>
                  ))}
                </div>
              )}
              {snapshot.wantedPostersCount > 0 && (
                <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                  {t.postersPostedTag} ({snapshot.wantedPostersCount})
                </div>
              )}
              {snapshot.hotelHeistState !== 'none' && (
                <div
                  className={`flex items-center gap-1 text-[10px] font-semibold ${
                    snapshot.hotelHeistState === 'completed'
                      ? 'text-emerald-400'
                      : 'text-amber-300'
                  }`}
                >
                  <FileKey2 className="h-3 w-3 shrink-0" />
                  <span className="max-w-[180px] truncate">
                    {snapshot.hotelHeistState === 'completed'
                      ? t.hotelHeistDone
                      : t.hotelHeistActive}
                  </span>
                </div>
              )}
              {snapshot.policeResponding && (
                <div className="flex items-center gap-1 text-[10px] font-semibold text-sky-400">
                  <ShieldAlert className="h-3 w-3 shrink-0" />
                  <span className="max-w-[180px] truncate">
                    {t.policeArrivingTag}
                  </span>
                </div>
              )}
              {snapshot.elevatorRiding && (
                <div className="text-[10px] font-semibold text-sky-300">
                  {t.elevatorRidingTag}
                </div>
              )}
              {snapshot.hasPlaneTicketTo && (
                <div className="flex items-center gap-1 text-[10px] font-semibold text-sky-300">
                  <Plane className="h-3 w-3 shrink-0" />
                  <span>
                    {t.ticketOwnedTag}:{' '}
                    {snapshot.hasPlaneTicketTo === 'coast'
                      ? t.mapNames.coast
                      : t.mapNames.sky}
                  </span>
                </div>
              )}
              {snapshot.companionCount > 0 && (
                <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                  <Users className="h-3 w-3 shrink-0" />
                  <span>
                    {t.policeCompanionsActive}: {snapshot.companionCount}
                  </span>
                </div>
              )}
              {snapshot.canSurrender && (
                <button
                  type="button"
                  onClick={onSurrender}
                  className="mt-0.5 flex items-center justify-center rounded border border-sky-400/40 bg-sky-950/60 px-2 py-0.5 text-[10px] font-semibold text-sky-200 hover:bg-sky-800/70 transition-colors"
                >
                  {t.surrenderHint}
                </button>
              )}
              {snapshot.inHoldingCell && (
                <div className="mt-1 space-y-1 rounded border border-amber-400/35 bg-amber-950/40 p-1.5 text-[10px]">
                  <div className="font-semibold text-amber-300">
                    {t.policeCellTitle}
                  </div>
                  <button
                    type="button"
                    onClick={onPayHoldingCellBail}
                    className="w-full rounded bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-slate-950 hover:bg-amber-400 transition-colors"
                  >
                    {t.policeCellBailBtn} (${snapshot.holdingCellBail})
                  </button>
                </div>
              )}
              {snapshot.currentMap === 'prison' && (
                <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 border-t border-white/10 pt-1 text-[10px] font-mono-num">
                  <span className="text-amber-300">
                    {t.prisonHunger}: {Math.round(snapshot.prisonNeeds.hunger)}%
                  </span>
                  <span className="text-sky-300">
                    {t.prisonEnergy}: {Math.round(snapshot.prisonNeeds.energy)}%
                  </span>
                  <span className="text-cyan-300">
                    {t.prisonHygiene}: {Math.round(snapshot.prisonNeeds.hygiene)}%
                  </span>
                  <span className="text-emerald-300">
                    {t.prisonStrength}: {Math.round(snapshot.prisonNeeds.strength)}
                  </span>
                  <span className="col-span-2 text-rose-300">
                    {t.prisonEscape}: {snapshot.prisonEscapeProgress}%
                  </span>
                </div>
              )}
            </div>

            {/* Minimal Proximity Radar */}
            <div
              className="relative hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#060910] sm:flex"
              aria-label="District proximity radar"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
              {snapshot.radarBlips.map((b) => {
                if (b.alertState === 'eliminated') return null;
                const left = 50 + b.x * 42;
                const top = 50 + b.z * 42;
                const color =
                  b.role === 'target'
                    ? 'bg-amber-400'
                    : b.role === 'police'
                      ? 'bg-blue-400'
                      : b.alertState === 'fighting'
                        ? 'bg-fuchsia-400'
                        : b.alertState === 'combat' ||
                            b.alertState === 'threaten' ||
                            b.alertState === 'calling_police'
                          ? 'bg-red-500'
                          : b.alertState === 'staring'
                            ? 'bg-orange-400'
                            : b.role === 'gentleman'
                              ? 'bg-indigo-400'
                              : b.role === 'civilian' ||
                                  b.role === 'clerk' ||
                                  b.role === 'collector' ||
                                  b.role === 'poor'
                                ? 'bg-emerald-400'
                                : 'bg-sky-400';
                return (
                  <span
                    key={b.id}
                    className={`absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${color}`}
                    style={{ left: `${left}%`, top: `${top}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Top-Right Language Selector + Aim Trigger */}
          <div className="flex items-center gap-2">
            <div
              className="pointer-events-auto flex items-center gap-0.5 rounded-lg border border-white/15 bg-[#090d16]/85 p-0.5"
              role="group"
              aria-label={t.langLabel}
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => onLanguageChange(opt.code)}
                  className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                    snapshot.language === opt.code
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {!snapshot.pointerLocked &&
              !snapshot.weaponWheelOpen &&
              !snapshot.appearanceMenuOpen &&
              !snapshot.lockpickMinigameOpen &&
              !snapshot.hotelRoomMenuOpen &&
              !snapshot.elevatorMenuOpen &&
              !snapshot.ticketKioskOpen &&
              !snapshot.policeMenuOpen &&
              !snapshot.phoneOpen &&
              !snapshot.supermarketOpen &&
              !chatTarget && (
                <button
                  type="button"
                  onClick={onLockPointer}
                  className="pointer-events-auto flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#090d16]/85 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-amber-400/60 hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <Eye className="h-3.5 w-3.5 text-amber-400" />
                  {t.aimCamera}
                </button>
              )}
          </div>
        </div>
      )}

      {/* Top-Center Flight 409 Fuselage Integrity Warning */}
      {snapshot.phase === 'playing' &&
        snapshot.activeCinematic === 'none' &&
        snapshot.currentMap === 'plane_incident' && (
          <div className="pointer-events-none fixed inset-x-0 top-20 z-20 flex justify-center px-4">
            <div className="w-full max-w-md rounded-xl border border-rose-500/60 bg-[#1a070b]/92 px-4 py-2 text-center shadow-xl">
              <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                <span>{t.planeIntegrityLabel}</span>
                <span className="font-mono-num">{snapshot.planeIntegrity}%</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-200">
                {t.planeMarshalsHint}
              </div>
            </div>
          </div>
        )}

      {/* Top-Center Staring Recognition & 911 Police Call Meter */}
      {snapshot.phase === 'playing' &&
        snapshot.activeCinematic === 'none' &&
        (snapshot.suspicionLevel >= 0.35 || snapshot.policeCallProgress > 0) && (
          <div className="pointer-events-none fixed inset-x-0 top-20 z-20 flex justify-center px-4">
            <div
              className={`w-full max-w-sm rounded-xl border px-3.5 py-2 shadow-xl ${
                snapshot.policeCallProgress > 0
                  ? 'border-red-500/60 bg-[#1a070b]/92'
                  : 'border-amber-400/50 bg-[#141008]/90'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                <span
                  className={`flex items-center gap-1.5 ${
                    snapshot.policeCallProgress > 0
                      ? 'text-red-400'
                      : 'text-amber-300'
                  }`}
                >
                  <PhoneCall className="h-3.5 w-3.5 shrink-0" />
                  {snapshot.policeCallProgress > 0
                    ? t.policeCalling
                    : t.suspicionStaring}
                </span>
                <span className="font-mono-num text-[10px] text-slate-300">
                  {Math.round(
                    (snapshot.policeCallProgress > 0
                      ? snapshot.policeCallProgress
                      : snapshot.suspicionLevel) * 100,
                  )}
                  %
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full origin-left transition-transform duration-100 ${
                    snapshot.policeCallProgress > 0
                      ? 'bg-red-500'
                      : 'bg-amber-400'
                  }`}
                  style={{
                    transform: `scaleX(${Math.min(
                      1,
                      snapshot.policeCallProgress > 0
                        ? snapshot.policeCallProgress
                        : snapshot.suspicionLevel,
                    )})`,
                  }}
                />
              </div>
              <div className="mt-1 text-[10px] text-slate-300">
                {t.silenceHint}
              </div>
            </div>
          </div>
        )}

      {/* Center Reticle & Context Prompt */}
      {snapshot.phase === 'playing' &&
        snapshot.activeCinematic === 'none' &&
        !snapshot.weaponWheelOpen &&
        !snapshot.appearanceMenuOpen &&
        !snapshot.lockpickMinigameOpen &&
        !snapshot.hotelRoomMenuOpen &&
        !snapshot.elevatorMenuOpen &&
        !snapshot.ticketKioskOpen &&
        !snapshot.policeMenuOpen &&
        !snapshot.phoneOpen &&
        !snapshot.supermarketOpen &&
        !chatTarget && (
          <div className="pointer-events-none fixed inset-0 flex flex-col items-center justify-center">
            {!snapshot.inVehicle && (
              <Crosshair className="h-4 w-4 text-white/40" strokeWidth={1.5} />
            )}

            {snapshot.isRegenerating &&
              snapshot.activeRegenStage !== 'none' && (
                <div className="mt-6 rounded-md border border-amber-400/40 bg-[#090d16]/90 px-3 py-1 text-xs font-medium text-amber-300">
                  {t.regenStages[snapshot.activeRegenStage]}
                </div>
              )}

            {!snapshot.isRegenerating && snapshot.contextPrompt && (
              <div className="mt-6 flex items-center gap-1.5 rounded-md border border-white/15 bg-[#090d16]/85 px-3 py-1 text-xs font-medium text-slate-100">
                {snapshot.nearCarLocked && !snapshot.inVehicle && (
                  <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                )}
                <span>{snapshot.contextPrompt}</span>
              </div>
            )}
          </div>
        )}

      {/* 'G' Slow-Motion Radial Weapon Wheel */}
      {snapshot.phase === 'playing' && snapshot.weaponWheelOpen && (
        <div className="pointer-events-auto fixed inset-0 z-30 flex items-center justify-center bg-[#05080f]/55">
          <div className="relative h-[352px] w-[352px] rounded-full border border-amber-400/35 bg-[#090d16]/92 shadow-2xl">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">
                {t.slowMotion}
              </div>
              <div className="font-display mt-0.5 text-sm font-bold text-white">
                {t.selectGear}
              </div>
              <button
                type="button"
                onClick={onCloseWheel}
                className="mt-2 rounded border border-white/15 px-2.5 py-0.5 text-[11px] text-slate-300 hover:text-white"
              >
                {t.closeWheel}
              </button>
            </div>

            {WEAPON_WHEEL_LAYOUT.map((w) => {
              const rad = (w.angleDeg * Math.PI) / 180;
              const r = 128;
              const x = 176 + Math.cos(rad) * r;
              const y = 176 + Math.sin(rad) * r;
              const active = snapshot.equippedWeapon === w.id;
              const info = t.weapons[w.id];
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => onSelectWeapon(w.id)}
                  style={{ left: `${x}px`, top: `${y}px` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-24 rounded-xl border px-2 py-2 text-center transition-colors ${
                    active
                      ? 'border-amber-400 bg-amber-500 text-slate-950'
                      : 'border-white/15 bg-slate-900/95 text-slate-200 hover:border-amber-400/60'
                  }`}
                >
                  <div className="text-xs font-bold leading-tight">
                    {info.label}
                  </div>
                  <div
                    className={`mt-0.5 text-[10px] ${active ? 'text-slate-900' : 'text-slate-400'}`}
                  >
                    [{w.key}] {info.sub}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Car-Unlock Tool Silent Lockpick Minigame */}
      {snapshot.phase === 'playing' && snapshot.lockpickMinigameOpen && (
        <LockpickMinigameOverlay
          title={t.lockpickTitle}
          subtitle={t.lockpickSubtitle}
          setPinLabel={t.lockpickSetPin}
          cancelLabel={t.lockpickCancel}
          smashLabel={t.lockpickSmashInstead}
          pinLabel={t.lockpickPinLabel}
          onTick={onLockpickTick}
          onComplete={onLockpickComplete}
          onCancel={onLockpickCancel}
          onSmashInstead={onLockpickSmash}
        />
      )}

      {/* Hotel Vex Room Selection Modal */}
      {snapshot.phase === 'playing' && snapshot.hotelRoomMenuOpen && (
        <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-[#05080f]/68 p-4">
          <div className="w-full max-w-md rounded-2xl border border-amber-400/35 bg-[#090d16]/96 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                  <BedDouble className="h-4 w-4" />
                  {t.hotelTitle}
                </div>
                <p className="mt-1 text-xs leading-snug text-slate-300">
                  {t.hotelSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseHotelMenu}
                className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Close hotel menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3.5 space-y-2">
              {(['201', '202', '203'] as HotelRoomId[]).map((roomId) => {
                const room = t.hotelRooms[roomId];
                const chosen = snapshot.chosenHotelRoom === roomId;
                return (
                  <button
                    key={roomId}
                    type="button"
                    onClick={() => onSelectHotelRoom(roomId)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                      chosen
                        ? 'border-amber-400 bg-amber-500/15 text-white'
                        : 'border-white/12 bg-slate-900/85 text-slate-100 hover:border-amber-400/60'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold">{room.name}</div>
                      <div className="text-[11px] text-slate-400">{room.desc}</div>
                    </div>
                    <span className="rounded-md bg-amber-500/20 px-2 py-0.5 font-mono-num text-[11px] font-semibold text-amber-300 shrink-0">
                      {chosen ? `${t.hotelRoomCheckedIn} ${roomId}` : roomId}
                    </span>
                  </button>
                );
              })}

              {/* Suite 204 Occupied Heist Target Card */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-red-500/35 bg-red-950/30 px-3.5 py-2.5 text-left">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-red-200">
                    {t.hotelSuite204.name}
                  </div>
                  <div className="text-[11px] text-red-300/80">
                    {t.hotelSuite204.desc}
                  </div>
                </div>
                <span className="rounded-md border border-red-500/40 bg-red-500/20 px-2 py-0.5 text-[10px] font-bold tracking-wide text-red-300 shrink-0">
                  {t.hotelOccupiedTag}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hotel Vex Glass Elevator Modal (1F .. 6F) */}
      {snapshot.phase === 'playing' && snapshot.elevatorMenuOpen && (
        <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-[#05080f]/68 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-sky-400/35 bg-[#090d16]/96 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
                  <Building2 className="h-4 w-4" />
                  {t.elevatorTitle}
                </div>
                <p className="mt-1 text-xs leading-snug text-slate-300">
                  {t.elevatorSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseElevator}
                className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Close elevator menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3.5 max-h-[340px] space-y-2 overflow-y-auto pr-1">
              {([6, 5, 4, 3, 2, 1] as HotelFloor[]).map((floorNum) => {
                const info = t.elevatorFloors[floorNum];
                const active = snapshot.hotelFloor === floorNum;
                return (
                  <button
                    key={floorNum}
                    type="button"
                    onClick={() => onUseElevator(floorNum)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2 text-left transition-colors ${
                      active
                        ? 'border-sky-400 bg-sky-500/15 text-white'
                        : 'border-white/12 bg-slate-900/85 text-slate-100 hover:border-sky-400/60'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold">{info.name}</div>
                      <div className="text-[11px] text-slate-400">{info.desc}</div>
                    </div>
                    <span className="rounded border border-sky-400/35 bg-sky-500/15 px-2 py-0.5 font-mono-num text-[11px] font-bold text-sky-300 shrink-0">
                      {floorNum}F
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Obsidian Airport Ticket Kiosk Modal */}
      {snapshot.phase === 'playing' && snapshot.ticketKioskOpen && (
        <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-[#05080f]/68 p-4">
          <div className="w-full max-w-md rounded-2xl border border-amber-400/35 bg-[#090d16]/96 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                  <Plane className="h-4 w-4" />
                  {t.ticketKioskTitle}
                </div>
                <p className="mt-1 text-xs leading-snug text-slate-300">
                  {t.ticketKioskSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseTicketKiosk}
                className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Close ticket kiosk"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              <button
                type="button"
                disabled={snapshot.cash < 250}
                onClick={() => onBuyPlaneTicket('coast')}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/12 bg-slate-900/90 px-4 py-3 text-left text-slate-100 hover:border-sky-400/60 disabled:opacity-45"
              >
                <div>
                  <div className="text-xs font-bold">{t.mapNames.coast}</div>
                  <div className="text-[11px] text-slate-400">{t.ticketBuyCoast}</div>
                </div>
                <span className="font-mono-num text-xs font-bold text-emerald-300">
                  $250
                </span>
              </button>
              <button
                type="button"
                disabled={snapshot.cash < 400}
                onClick={() => onBuyPlaneTicket('sky')}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/12 bg-slate-900/90 px-4 py-3 text-left text-slate-100 hover:border-amber-400/60 disabled:opacity-45"
              >
                <div>
                  <div className="text-xs font-bold">{t.mapNames.sky}</div>
                  <div className="text-[11px] text-slate-400">{t.ticketBuySky}</div>
                </div>
                <span className="font-mono-num text-xs font-bold text-emerald-300">
                  $400
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Police Precinct Booking Desk & Bail Companion Modal */}
      {snapshot.phase === 'playing' && snapshot.policeMenuOpen && (
        <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-[#05080f]/68 p-4">
          <div className="w-full max-w-md rounded-2xl border border-sky-400/35 bg-[#090d16]/96 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
                  <ShieldAlert className="h-4 w-4" />
                  {t.policeTitle}
                </div>
                <p className="mt-1 text-xs leading-snug text-slate-300">
                  {t.policeSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={onClosePoliceMenu}
                className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Close police desk"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
              {snapshot.arrestedFighters.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4 text-center text-xs text-slate-400">
                  {t.policeEmptyFighters}
                </div>
              ) : (
                snapshot.arrestedFighters.map((fighter) => (
                  <div
                    key={fighter.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/12 bg-slate-900/85 px-3.5 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-slate-100">
                        {fighter.name}
                      </div>
                      <div className="font-mono-num text-[11px] text-emerald-300">
                        ${fighter.bailCost}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={snapshot.cash < fighter.bailCost}
                      onClick={() => onPayFighterBail(fighter.id)}
                      className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-sky-400 disabled:opacity-45 shrink-0"
                    >
                      {t.policePayBailBtn}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 24H SuperMart Checkout & Supplies Modal */}
      {snapshot.phase === 'playing' && snapshot.supermarketOpen && (
        <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-[#05080f]/68 p-4">
          <div className="w-full max-w-md rounded-2xl border border-emerald-400/35 bg-[#090d16]/96 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <ShoppingCart className="h-4 w-4" />
                  {t.supermarketTitle}
                </div>
                <p className="mt-1 text-xs leading-snug text-slate-300">
                  {t.supermarketSubtitle}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="rounded border border-emerald-400/30 bg-emerald-950/50 px-2 py-0.5 font-mono-num text-xs font-bold text-emerald-300">
                  ${snapshot.cash}
                </span>
                <button
                  type="button"
                  onClick={onCloseSupermarket}
                  className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                  aria-label="Close supermarket checkout"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
              {(
                [
                  'energy_drink',
                  'bento_meal',
                  'medkit',
                  'kevlar_vest',
                  'ammo_lockpick',
                ] as ShopItemId[]
              ).map((itemId) => {
                const item = t.supermarketItems[itemId];
                const canAfford = snapshot.cash >= item.price;
                return (
                  <div
                    key={itemId}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/12 bg-slate-900/90 px-3.5 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-100">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.desc}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onBuySupermarketItem(itemId)}
                      className="rounded-lg bg-emerald-500 px-3 py-1.5 font-mono-num text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-40 transition-colors shrink-0"
                    >
                      ${item.price}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Phone Overlay (Clock, Weather, Watchable Videos, Wine Action) */}
      {snapshot.phase === 'playing' && snapshot.phoneOpen && (
        <PhoneOverlay
          snapshot={snapshot}
          onClose={onTogglePhone}
          onWatchVideo={onWatchPhoneVideo}
          onDrinkWine={onDrinkWine}
        />
      )}

      {/* Atelier Vex Side Appearance & Disguise Drawer (keeps center 3D character visible!) */}
      {snapshot.phase === 'playing' && snapshot.appearanceMenuOpen && (
        <div className="pointer-events-auto fixed right-5 top-1/2 z-30 w-80 -translate-y-1/2 rounded-2xl border border-amber-400/35 bg-[#090d16]/95 p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Shirt className="h-3.5 w-3.5" />
                {t.appearanceTitle}
              </div>
              <p className="mt-1 text-[11px] leading-snug text-slate-300">
                {t.appearanceSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={onCloseAppearance}
              className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Close appearance menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 max-h-[340px] space-y-2 overflow-y-auto pr-1">
            {OUTFIT_SWATCHES.map(({ id, color }) => {
              const active = snapshot.outfit === id;
              const info = t.outfits[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectOutfit(id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    active
                      ? 'border-amber-400 bg-amber-500/15 text-white'
                      : 'border-white/10 bg-slate-900/80 text-slate-200 hover:border-white/30'
                  }`}
                >
                  <span
                    className="h-6 w-6 shrink-0 rounded-md border border-white/25"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold">{info.label}</div>
                    <div className="text-[10px] text-slate-400">{info.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onCloseAppearance}
            className="mt-4 w-full rounded-lg bg-amber-500 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
          >
            {t.appearanceConfirm}
          </button>
        </div>
      )}

      {/* 'T' Live AI NPC Conversation Panel */}
      {snapshot.phase === 'playing' && chatTarget && (
        <div className="pointer-events-auto fixed bottom-20 right-5 z-30 w-[min(390px,92vw)] rounded-xl border border-white/15 bg-[#0a0f1a]/96 p-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-amber-400" />
              <div>
                <div className="text-xs font-semibold text-white">
                  {chatTarget.name}
                </div>
                <div className="text-[10px] text-slate-400">
                  {chatTarget.role.toUpperCase()} · {chatTarget.zone}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onCloseChat}
              className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="End conversation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 max-h-44 space-y-2 overflow-y-auto pr-1 text-xs">
            {chatHistory.length === 0 && (
              <div className="text-slate-400 italic">
                {t.speakPrompt}
              </div>
            )}
            {chatHistory.map((m, i) => (
              <div
                key={i}
                className={`rounded-lg px-3 py-1.5 ${
                  m.sender === 'player'
                    ? 'ml-6 bg-amber-500/15 text-amber-100 border border-amber-400/25'
                    : 'mr-6 bg-slate-800/90 text-slate-100 border border-white/10'
                }`}
              >
                <span className="mr-1.5 font-semibold text-slate-400">
                  {m.sender === 'player'
                    ? t.youLabel
                    : `${chatTarget.name.split(' ')[0]}:`}
                </span>
                {m.text}
              </div>
            ))}
            {chatLoading && (
              <div className="text-[11px] text-amber-300">
                {chatTarget.name.split(' ')[0]} {t.responding}
              </div>
            )}
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {t.quickPrompts.map((q) => (
              <button
                key={q}
                type="button"
                disabled={chatLoading}
                onClick={() => onSendChat(q)}
                className="rounded-md border border-white/10 bg-slate-900 px-2 py-1 text-[10px] text-slate-300 hover:border-amber-400/50 hover:text-white transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          <form onSubmit={handleChatSubmit} className="mt-3 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={t.saySomething}
              className="flex-1 rounded-lg border border-white/15 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Bottom Area: Subtitles + Minimal Collapsed Dock */}
      <div className="flex flex-col items-center px-4 pb-3">
        {snapshot.caption && (
          <div className="mb-2 max-w-xl rounded-lg border border-white/10 bg-[#090d16]/88 px-3.5 py-1.5 text-center shadow-lg">
            <span
              className={`mr-2 text-xs font-semibold ${
                snapshot.caption.role === 'assassin'
                  ? 'text-amber-400'
                  : snapshot.caption.role === 'target'
                    ? 'text-rose-400'
                    : snapshot.caption.role === 'civilian'
                      ? 'text-emerald-400'
                      : 'text-sky-400'
              }`}
            >
              {snapshot.caption.speaker}:
            </span>
            <span className="text-xs text-slate-100">
              “{snapshot.caption.text}”
            </span>
          </div>
        )}

        {snapshot.phase === 'playing' && snapshot.activeCinematic === 'none' && (
          <div
            className="pointer-events-auto flex flex-col items-center transition-transform duration-200 ease-out"
            style={{
              transform: dockOpen ? 'translateY(0)' : 'translateY(calc(100% - 26px))',
            }}
          >
            <button
              type="button"
              onClick={onToggleDock}
              className="flex items-center gap-1.5 rounded-t-lg border border-b-0 border-white/12 bg-[#0a0f1a]/90 px-3 py-0.5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              {dockOpen ? (
                <>
                  <ChevronDown className="h-3 w-3" />
                  {t.hideControls}
                </>
              ) : (
                <>
                  <ChevronUp className="h-3 w-3" />
                  {t.showControls}
                </>
              )}
            </button>

            <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#090d16]/94 px-3.5 py-2.5 shadow-2xl max-w-[min(1040px,95vw)]">
              <div className="flex items-center gap-1 rounded-lg bg-slate-900/90 p-1 border border-white/10">
                {(
                  [
                    ['combat', t.camCombat],
                    ['wide', t.camWide],
                    ['regen', t.camRegen],
                  ] as Array<[CameraPreset, string]>
                ).map(([preset, label]) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onCameraPreset(preset)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      snapshot.cameraPreset === preset
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onInflictTrauma('severRightArm')}
                  className="rounded-lg border border-white/12 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-200 hover:border-red-400/60"
                >
                  {t.severArm}
                </button>
                <button
                  type="button"
                  onClick={() => onInflictTrauma('breakLeg')}
                  className="rounded-lg border border-white/12 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-200 hover:border-amber-400/60"
                >
                  {t.breakLeg}
                </button>
                <button
                  type="button"
                  onClick={onTriggerRegen}
                  disabled={!anyInjured || snapshot.isRegenerating}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                    anyInjured && !snapshot.isRegenerating
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      : 'border border-white/10 bg-slate-900/60 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {snapshot.isRegenerating ? t.regenerating : t.regenerate}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onTogglePhone}
                  className="flex items-center gap-1.5 rounded-lg border border-sky-400/30 bg-slate-900 px-2.5 py-1 text-xs font-medium text-sky-300 hover:border-sky-400 hover:text-white whitespace-nowrap shrink-0"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  {t.phoneOpenBtn}
                </button>
                <button
                  type="button"
                  onClick={onCycleWeather}
                  className="flex items-center gap-1.5 rounded-lg border border-white/12 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-200 hover:text-white whitespace-nowrap shrink-0"
                >
                  {snapshot.weather === 'sunny' ? (
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                  ) : snapshot.weather === 'rain' ? (
                    <CloudRain className="h-3.5 w-3.5 text-sky-400" />
                  ) : snapshot.weather === 'fog' ? (
                    <CloudFog className="h-3.5 w-3.5 text-slate-300" />
                  ) : (
                    <Cloud className="h-3.5 w-3.5 text-slate-400" />
                  )}
                  {t.cycleWeather}
                </button>
                <button
                  type="button"
                  onClick={onToggleMute}
                  className="flex items-center gap-1.5 rounded-lg border border-white/12 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-200 hover:text-white"
                >
                  {muted ? (
                    <>
                      <VolumeX className="h-3.5 w-3.5 text-rose-400" />
                      {t.muted}
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5 text-amber-400" />
                      {t.audioOn}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onRestart}
                  className="flex items-center gap-1.5 rounded-lg border border-white/12 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-200 hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t.restart}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mission Briefing Overlay */}
      {snapshot.phase === 'briefing' && (
        <div className="pointer-events-auto fixed inset-0 flex items-center justify-center bg-[#060911]/75 p-6">
          <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#0a0f1a] p-7 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-medium text-amber-400">
                {t.briefingTag}
              </div>
              <div
                className="flex items-center gap-1 rounded-lg border border-white/15 bg-slate-900 p-0.5"
                role="group"
                aria-label={t.langLabel}
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => onLanguageChange(opt.code)}
                    className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                      snapshot.language === opt.code
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-white">
              {t.briefingTitle}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              {t.briefingDesc}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 border-y border-white/10 py-4 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">{t.ctrlMove}</span>
                <span className="font-mono-num text-white">WASD · Shift</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.ctrlCar}</span>
                <span className="font-mono-num text-amber-400">E</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.ctrlWheel}</span>
                <span className="font-mono-num text-amber-400">G</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.ctrlTalk}</span>
                <span className="font-mono-num text-amber-400">T</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.ctrlAttack}</span>
                <span className="font-mono-num text-white">LMB · RMB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.ctrlRegen}</span>
                <span className="font-mono-num text-white">R</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                {t.briefingHint}
              </span>
              <button
                type="button"
                onClick={onStartMission}
                className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0"
              >
                {t.enterCity}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dramatic "WASTED" Death Screen (Ragdoll + Slow-Mo) */}
      {snapshot.phase === 'defeat' && (
        <div className="pointer-events-auto fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#180407]/55 p-6 text-center">
          <div className="rounded-2xl border border-red-500/35 bg-[#090407]/90 px-12 py-8 shadow-2xl">
            <h2 className="font-display text-6xl font-black tracking-[0.18em] text-red-500 drop-shadow-lg sm:text-7xl">
              {t.wastedTitle}
            </h2>
            <p className="mt-3 text-sm font-medium text-slate-300">
              {snapshot.deathReason || t.deathCombat}
            </p>
            <div className="mt-3 font-mono-num text-xs text-slate-400">
              {t.survived} {formatTime(snapshot.elapsedSeconds)} · {t.wanted}{' '}
              {snapshot.wantedLevel}
            </div>
            <button
              type="button"
              onClick={onRestart}
              className="mt-6 rounded-lg bg-red-600 px-7 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
            >
              {t.respawn}
            </button>
          </div>
        </div>
      )}

      {/* Victory Overlay */}
      {snapshot.phase === 'victory' && (
        <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-[#060911]/80 p-6">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0a0f1a] p-7 text-center shadow-2xl">
            <div className="text-xs font-semibold text-amber-400">
              {t.victoryTag}
            </div>
            <h2 className="font-display mt-2 text-3xl font-bold text-white">
              {t.victoryTitle}
            </h2>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-300 font-mono-num">
              <span>
                {t.timeLabel} {formatTime(snapshot.elapsedSeconds)}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {t.eliminatedLabel} {snapshot.guardsEliminated}/
                {snapshot.totalEnemies}
              </span>
            </div>
            <button
              type="button"
              onClick={onRestart}
              className="mt-6 w-full rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
            >
              {t.playAgain}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
