import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Cloud,
  CloudFog,
  CloudRain,
  DollarSign,
  Play,
  Smartphone,
  Sun,
  Wine,
  X,
} from 'lucide-react';
import type { GameSnapshot, WeatherType } from '../types/game';
import { UI_STRINGS } from '../i18n/translations';

interface PhoneOverlayProps {
  snapshot: GameSnapshot;
  onClose: () => void;
  onWatchVideo: (videoId: string) => void;
  onDrinkWine: () => void;
}

const CLIP_DURATION_SEC = 3.2;

function renderWeatherIcon(weather: WeatherType) {
  if (weather === 'sunny') return <Sun className="w-3.5 h-3.5 text-amber-400" />;
  if (weather === 'overcast') return <Cloud className="w-3.5 h-3.5 text-slate-300" />;
  if (weather === 'rain') return <CloudRain className="w-3.5 h-3.5 text-sky-400" />;
  return <CloudFog className="w-3.5 h-3.5 text-slate-400" />;
}

export const PhoneOverlay: React.FC<PhoneOverlayProps> = ({
  snapshot,
  onClose,
  onWatchVideo,
  onDrinkWine,
}) => {
  const t = UI_STRINGS[snapshot.language];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string>(t.phoneVideos[0]?.id ?? 'vid_maple');
  const [playProgress, setPlayProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeVideo =
    t.phoneVideos.find((v) => v.id === activeVideoId) ?? t.phoneVideos[0];

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const drawFrame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;

      if (isPlaying) {
        setPlayProgress((prev) => {
          const next = prev + dt / CLIP_DURATION_SEC;
          if (next >= 1) {
            setIsPlaying(false);
            onWatchVideo(activeVideoId);
            return 1;
          }
          return next;
        });
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          const sec = now * 0.001;

          // Dark CCTV / Syndicate Feed Background
          ctx.fillStyle = '#070b14';
          ctx.fillRect(0, 0, w, h);

          // Grid lines
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
          ctx.lineWidth = 1;
          for (let gx = 0; gx < w; gx += 28) {
            ctx.beginPath();
            ctx.moveTo(gx, 0);
            ctx.lineTo(gx, h);
            ctx.stroke();
          }
          for (let gy = 0; gy < h; gy += 28) {
            ctx.beginPath();
            ctx.moveTo(0, gy);
            ctx.lineTo(w, gy);
            ctx.stroke();
          }

          if (activeVideoId === 'vid_maple' || activeVideoId === 'vid_cedar') {
            const isCedar = activeVideoId === 'vid_cedar';
            const panX = Math.sin(sec * 1.1) * 14;
            // House silhouette + roof
            ctx.fillStyle = isCedar ? '#291c15' : '#1e293b';
            ctx.fillRect(72 + panX, 58, 176, 76);
            ctx.fillStyle = isCedar ? '#422006' : '#0f172a';
            ctx.beginPath();
            ctx.moveTo(60 + panX, 60);
            ctx.lineTo(160 + panX, 24);
            ctx.lineTo(260 + panX, 60);
            ctx.closePath();
            ctx.fill();

            // Glowing vault safe highlight inside house
            const pulse = 0.5 + 0.5 * Math.sin(sec * 5);
            ctx.fillStyle = `rgba(245, 158, 11, ${0.35 + pulse * 0.45})`;
            ctx.fillRect(184 + panX, 88, 34, 34);
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.strokeRect(182 + panX, 86, 38, 38);

            ctx.fillStyle = '#fde68a';
            ctx.font = 'bold 11px monospace';
            ctx.fillText(isCedar ? 'SW SAFE · $425' : 'SW SAFE · $350', 155 + panX, 78);
          } else if (activeVideoId === 'vid_oak') {
            const panX = Math.cos(sec * 0.9) * 10;
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(54 + panX, 54, 212, 82);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.strokeRect(54 + panX, 54, 212, 82);

            // Animated encrypted drive node
            const rot = sec * 2.2;
            ctx.save();
            ctx.translate(145 + panX, 95);
            ctx.rotate(rot);
            ctx.fillStyle = '#0ea5e9';
            ctx.fillRect(-14, -14, 28, 28);
            ctx.restore();

            ctx.fillStyle = '#7dd3fc';
            ctx.font = 'bold 11px monospace';
            ctx.fillText('OAK #42 · ENCRYPTED DRIVE', 74 + panX, 46);
          } else if (activeVideoId === 'vid_bank') {
            // Meridian Bank Vault & Server Audit feed
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(46, 42, 228, 92);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.strokeRect(46, 42, 228, 92);

            // Vault circular lock door + spinning dial
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(110, 88, 28, 0, Math.PI * 2);
            ctx.stroke();
            const dialAngle = sec * 1.8;
            ctx.beginPath();
            ctx.moveTo(110, 88);
            ctx.lineTo(110 + Math.cos(dialAngle) * 20, 88 + Math.sin(dialAngle) * 20);
            ctx.stroke();

            // Server rack + pulsing breach indicator
            ctx.fillStyle = '#0ea5e9';
            ctx.fillRect(172, 58, 72, 56);
            const blink = Math.sin(sec * 7) > 0;
            ctx.fillStyle = blink ? '#22d3ee' : '#0284c7';
            ctx.fillRect(182, 68, 52, 10);
            ctx.fillRect(182, 86, 52, 10);

            ctx.fillStyle = '#7dd3fc';
            ctx.font = 'bold 11px monospace';
            ctx.fillText('MERIDIAN VAULT · $850', 84, 34);
          } else if (activeVideoId === 'vid_airport') {
            // Obsidian International North Hangar Contraband Case feed
            const panX = Math.sin(sec * 0.8) * 10;
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.arc(160 + panX, 112, 96, Math.PI, 0);
            ctx.fill();
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 2;
            ctx.stroke();

            const pulse = 0.5 + 0.5 * Math.sin(sec * 5.5);
            ctx.fillStyle = `rgba(251, 191, 36, ${0.45 + pulse * 0.45})`;
            ctx.fillRect(138 + panX, 82, 44, 28);
            ctx.strokeStyle = '#fbbf24';
            ctx.strokeRect(138 + panX, 82, 44, 28);

            ctx.fillStyle = '#fde68a';
            ctx.font = 'bold 11px monospace';
            ctx.fillText('HANGAR CASE · $550', 98 + panX, 42);
          } else if (activeVideoId === 'vid_coast') {
            // Solstice Coast West Pier Smuggler Drop feed
            ctx.fillStyle = '#0c4a6e';
            ctx.fillRect(24, 96, 272, 40);
            ctx.fillStyle = '#78350f';
            ctx.fillRect(48, 78, 170, 20);
            for (let wx = 0; wx < 6; wx++) {
              const wy = 110 + Math.sin(sec * 3 + wx) * 3;
              ctx.strokeStyle = '#38bdf8';
              ctx.beginPath();
              ctx.moveTo(32 + wx * 44, wy);
              ctx.lineTo(64 + wx * 44, wy);
              ctx.stroke();
            }
            const pulse = 0.5 + 0.5 * Math.sin(sec * 4.5);
            ctx.fillStyle = `rgba(52, 211, 153, ${0.4 + pulse * 0.5})`;
            ctx.fillRect(184, 56, 28, 22);
            ctx.strokeStyle = '#34d399';
            ctx.strokeRect(184, 56, 28, 22);

            ctx.fillStyle = '#6ee7b7';
            ctx.font = 'bold 11px monospace';
            ctx.fillText('WEST PIER CRATE · $500', 84, 38);
          } else if (activeVideoId === 'vid_sky') {
            // Aether Sky City Observatory Core Relay feed
            ctx.fillStyle = '#1e1b4b';
            ctx.fillRect(58, 78, 204, 48);
            ctx.fillStyle = '#312e81';
            ctx.beginPath();
            ctx.arc(160, 78, 42, Math.PI, 0);
            ctx.fill();

            // Pulsing radar wave arcs
            const ringR = 14 + ((sec * 24) % 28);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(160, 44, ringR, -Math.PI * 0.85, -Math.PI * 0.15);
            ctx.stroke();

            ctx.fillStyle = '#a5f3fc';
            ctx.font = 'bold 11px monospace';
            ctx.fillText('OBSERVATORY RELAY · $750', 76, 26);
          } else {
            // vid_wine: Neon Lounge Bottle -> Ravenscroft Villa Weapon Crate
            ctx.fillStyle = '#111827';
            ctx.fillRect(28, 36, 115, 96);
            ctx.fillRect(177, 36, 115, 96);
            ctx.strokeStyle = '#38bdf8';
            ctx.strokeRect(28, 36, 115, 96);
            ctx.strokeStyle = '#fbbf24';
            ctx.strokeRect(177, 36, 115, 96);

            // Wine bottle silhouette
            ctx.fillStyle = '#991b1b';
            ctx.fillRect(77, 68, 16, 44);
            ctx.fillRect(82, 54, 6, 16);

            // Animated transfer arrow
            const arrowX = 148 + ((sec * 24) % 22);
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 14px monospace';
            ctx.fillText('>>', arrowX, 88);

            // Suit & Weapon icon on Villa side
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(216, 68, 38, 14);
            ctx.fillRect(216, 82, 12, 20);
            ctx.fillStyle = '#fde68a';
            ctx.font = '10px monospace';
            ctx.fillText('BAR WINE', 60, 124);
            ctx.fillText('NW VILLA ARMS', 194, 124);
          }

          // Scanline & REC indicator
          const scanY = (sec * 52) % h;
          ctx.fillStyle = 'rgba(255,255,255,0.06)';
          ctx.fillRect(0, scanY, w, 2);

          ctx.fillStyle = isPlaying ? '#ef4444' : '#64748b';
          ctx.beginPath();
          ctx.arc(16, 16, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#e2e8f0';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(isPlaying ? 'LIVE FEED' : 'STANDBY', 26, 20);
          ctx.fillText(snapshot.inGameTimeStr, w - 44, 20);
        }
      }

      raf = requestAnimationFrame(drawFrame);
    };

    raf = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(raf);
  }, [activeVideoId, isPlaying, onWatchVideo, snapshot.inGameTimeStr]);

  const handleStartVideo = (id: string) => {
    setActiveVideoId(id);
    setPlayProgress(0);
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 pointer-events-auto">
      <div className="w-[380px] max-w-[94vw] rounded-2xl border-2 border-slate-700 bg-[#080c15] shadow-2xl overflow-hidden text-slate-100">
        {/* Top Notch & Status Bar (Time, Weather, Cash) */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0c1220]">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-200">
              {t.phoneTitle}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition"
            aria-label="Close Phone"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Clock, Weather & Wallet Strip */}
        <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800 bg-[#0a0f1a] text-[11px]">
          <div className="px-3 py-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <div>
              <div className="text-[9px] uppercase text-slate-400">{t.phoneClockLabel}</div>
              <div className="font-mono-num font-bold text-slate-100">{snapshot.inGameTimeStr}</div>
            </div>
          </div>
          <div className="px-3 py-2 flex items-center gap-1.5">
            {renderWeatherIcon(snapshot.weather)}
            <div>
              <div className="text-[9px] uppercase text-slate-400">{t.weatherLabel}</div>
              <div className="font-mono-num font-semibold text-slate-100">
                {t.weatherNames[snapshot.weather]} · {snapshot.weatherVisibilityPct}%
              </div>
            </div>
          </div>
          <div className="px-3 py-2 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <div className="text-[9px] uppercase text-slate-400">{t.cashLabel}</div>
              <div className="font-mono-num font-bold text-emerald-300">${snapshot.cash}</div>
            </div>
          </div>
        </div>

        {/* Video Feed Player */}
        <div className="p-3 border-b border-slate-800">
          <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-black">
            <canvas ref={canvasRef} width={320} height={152} className="w-full h-[146px] block" />
            <div className="h-1 bg-slate-800">
              <div
                className="h-full bg-amber-400 transition-all duration-75"
                style={{ width: `${Math.round(playProgress * 100)}%` }}
              />
            </div>
          </div>

          {activeVideo && (
            <div className="mt-2.5 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{activeVideo.title}</div>
                <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  {activeVideo.subtitle}
                </div>
                <div className="text-[10px] font-semibold text-amber-300 mt-1">
                  {activeVideo.revealHint}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleStartVideo(activeVideo.id)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold uppercase tracking-wider transition"
              >
                <Play className="w-3 h-3" />
                {isPlaying ? t.phonePlayingBtn : t.phoneWatchBtn}
              </button>
            </div>
          )}
        </div>

        {/* Underground Video List */}
        <div className="p-3 space-y-1.5 max-h-[210px] overflow-y-auto">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
            {t.phoneVideosTitle}
          </div>
          {t.phoneVideos.map((vid) => {
            const watched = snapshot.watchedVideoIds.includes(vid.id);
            const selected = vid.id === activeVideoId;
            return (
              <button
                key={vid.id}
                type="button"
                onClick={() => handleStartVideo(vid.id)}
                className={`w-full text-left px-3 py-2 rounded border transition flex items-center justify-between gap-2 ${
                  selected
                    ? 'border-amber-500/70 bg-amber-950/25'
                    : 'border-slate-800 bg-[#0d1424] hover:border-slate-600'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-100 truncate">{vid.title}</div>
                  <div className="text-[10px] text-slate-400 truncate">{vid.revealHint}</div>
                </div>
                {watched ? (
                  <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t.phoneWatchedTag}
                  </span>
                ) : (
                  <span className="shrink-0 text-[10px] font-semibold text-sky-400">
                    {t.phoneRevealTag}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Inventory Quick Action: Drink Wine if carrying */}
        {snapshot.hasWine && (
          <div className="px-3 py-2.5 border-t border-slate-800 bg-[#0d1322] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-rose-300 font-semibold">
              <Wine className="w-4 h-4" />
              {t.hasWineTag}
            </div>
            <button
              type="button"
              onClick={onDrinkWine}
              className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold uppercase tracking-wider"
            >
              {t.drinkWineBtn}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
