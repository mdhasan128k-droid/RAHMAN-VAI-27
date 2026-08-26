import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, RefreshCw, Zap, SlidersHorizontal, Activity } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  isOnline: boolean;
  timeStr: string;
  isSimulatingFast: boolean;
  onToggleFastSim: () => void;
  onOpenTester: () => void;
  onRefresh: () => void;
  audioEnabled: boolean;
  onToggleAudio: (enabled: boolean) => void;
  onOpenEndpointModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  timeStr,
  isSimulatingFast,
  onToggleFastSim,
  onOpenTester,
  onRefresh,
  audioEnabled,
  onToggleAudio,
  onOpenEndpointModal,
}) => {
  const [isRotating, setIsRotating] = useState(false);

  const handleRefresh = () => {
    setIsRotating(true);
    onRefresh();
    setTimeout(() => setIsRotating(false), 600);
  };

  return (
    <header className="mb-4 pt-1">
      {/* Top Brand Bar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-cyan-500/10">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/30 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,230,230,0.15)] overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,230,230,0.3),transparent_70%)] pointer-events-none" />
            <Sparkles className="w-6 h-6 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white font-['Space_Grotesk']">
                LOTTERY ALL HACK
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                PRO V1
              </span>
            </div>
            <div className="text-[11px] text-cyan-400/80 font-mono tracking-wider flex items-center gap-1.5 mt-0.5">
              <Activity className="w-3 h-3 text-cyan-400 inline" />
              <span>AI SIGNAL DASHBOARD</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400">27 SERVERS</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleAudio(!audioEnabled)}
            title={audioEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            className={`p-2 rounded-xl border transition-all text-xs flex items-center justify-center ${
              audioEnabled
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-[0_0_10px_rgba(0,230,230,0.15)]'
                : 'bg-black/40 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onToggleFastSim}
            title={isSimulatingFast ? 'Fast Mode Active (10s)' : 'Live Real-Time Clock Mode'}
            className={`px-2.5 py-1.5 rounded-xl border transition-all text-xs font-mono font-bold flex items-center gap-1.5 ${
              isSimulatingFast
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(255,191,0,0.2)]'
                : 'bg-black/40 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulatingFast ? 'text-amber-300 animate-bounce' : ''}`} />
            <span className="hidden sm:inline">{isSimulatingFast ? '10s' : 'LIVE'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenTester}
            title="Custom Pattern & Algorithm Calculator"
            className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-all text-xs flex items-center justify-center"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            title="Sync Server Prediction Feed"
            className="p-2 rounded-xl bg-black/40 border border-white/10 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-all text-xs flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${isRotating ? 'animate-spin text-cyan-300' : ''}`} />
          </button>
        </div>
      </div>

      {/* Real-time Status Banner */}
      <div
        onClick={onOpenEndpointModal}
        role="button"
        tabIndex={0}
        className="mt-3 flex items-center justify-between px-3 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/5 text-xs cursor-pointer hover:border-cyan-500/30 transition-all group"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isOnline ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgb(46,200,110)]' : 'bg-rose-500'
              }`}
            />
          </span>
          <span className="font-semibold tracking-wide text-slate-200 group-hover:text-cyan-300 transition-colors">
            {isOnline ? 'LIVE DRAW FEED' : 'RECONNECTING...'}
          </span>
          <span className="text-slate-600 font-mono">|</span>
          <span className="text-cyan-400 font-mono text-[11px] hidden sm:inline">
            draw.ar-lottery01.com
          </span>
          <span className="text-cyan-400 font-mono text-[11px] sm:hidden">
            27 SERVERS
          </span>
        </div>

        <div className="font-mono text-[11px] text-slate-300 tracking-wider bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/5">
          {timeStr}
        </div>
      </div>
    </header>
  );
};
