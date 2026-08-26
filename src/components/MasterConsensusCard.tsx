import React, { useState } from 'react';
import { MasterVote, GameMode } from '../types';
import { MODE_SECONDS } from '../logic/lotteryStore';
import { Flame, CheckCircle2, Copy, ShieldCheck, Zap } from 'lucide-react';

interface MasterConsensusCardProps {
  vote: MasterVote | null;
  currentPeriod: string;
  remainingSeconds: number;
  currentMode: GameMode;
  onOpenHistory: () => void;
}

export const MasterConsensusCard: React.FC<MasterConsensusCardProps> = ({
  vote,
  currentPeriod,
  remainingSeconds,
  currentMode,
  onOpenHistory,
}) => {
  const [copied, setCopied] = useState(false);

  const totalSecs = MODE_SECONDS[currentMode];
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (remainingSeconds / totalSecs) * circumference;

  const totalVotes = (vote?.bigCount || 0) + (vote?.smallCount || 0);
  const bigPercent = totalVotes > 0 ? Math.round(((vote?.bigCount || 0) / totalVotes) * 100) : 50;

  const getColorBadge = (color?: string) => {
    if (!color) return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    if (color.includes('/')) return 'bg-gradient-to-r from-rose-500/20 to-purple-500/20 text-purple-200 border-purple-400/40';
    if (color === 'Green') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(46,200,110,0.15)]';
    if (color === 'Red') return 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(255,80,80,0.15)]';
    if (color === 'Violet') return 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(170,80,255,0.15)]';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  const handleCopySignal = () => {
    if (!vote) return;
    const text = `🎯 LAH VIP SIGNAL [${currentMode.toUpperCase()}]\n📌 Period: ${currentPeriod}\n⚡ Choice: ${vote.type.toUpperCase()}\n🎨 Color: ${vote.color}\n🔢 Number: #${vote.number}\n🔥 Accuracy: ${vote.confidence}%\n🛡️ 27 Engines Consensus`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSureShot = vote && (vote.sureShotPercent >= 90);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0a1424]/90 via-[#070e1c]/90 to-[#040810]/95 backdrop-blur-xl border border-cyan-500/25 p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] mb-4">
      {/* Background Neon Flare */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Row: Period & Circular Timer */}
      <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400/90 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              UPCOMING PERIOD
            </span>
            <button
              type="button"
              onClick={onOpenHistory}
              className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 underline"
            >
              Logs
            </button>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold tracking-wider bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
            {currentPeriod ? (currentPeriod.length > 8 ? '...' + currentPeriod.slice(-6) : currentPeriod) : '100001'}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Full: <span className="text-slate-300">{currentPeriod}</span>
          </div>
        </div>

        {/* Circular Dial Timer */}
        <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            {/* Background ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="rgba(0, 230, 230, 0.12)"
              strokeWidth="5"
              fill="none"
            />
            {/* Animated progress ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="rgb(0, 230, 230)"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(0, 230, 230, 0.8))',
                transition: 'stroke-dashoffset 0.3s linear',
              }}
            />
          </svg>

          {/* Centered Countdown Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-mono font-black text-xl text-white tracking-tight drop-shadow-[0_0_8px_rgba(0,230,230,0.6)]">
              {remainingSeconds}
            </span>
            <span className="text-[9px] font-mono text-cyan-400 uppercase -mt-1 font-bold">SEC</span>
          </div>

          {/* Live pulsing dot */}
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgb(255,80,80)] animate-ping" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500" />
        </div>
      </div>

      {/* Main Signal Display */}
      <div className="bg-black/50 backdrop-blur-md rounded-xl p-3.5 border border-white/10 mb-3 relative z-10">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              AI Consensus Signal
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold">
              27 ENGINES
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopySignal}
            className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-200 border border-white/10 transition-all"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? 'COPIED' : 'COPY'}</span>
          </button>
        </div>

        {/* Big/Small Badge + Number + Color */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xl sm:text-2xl font-black tracking-wider border shadow-md ${
              vote?.type === 'Big'
                ? 'bg-gradient-to-r from-emerald-950/80 to-emerald-900/60 border-emerald-500/60 text-emerald-400 shadow-[0_0_20px_rgba(46,200,110,0.25)]'
                : vote?.type === 'Small'
                ? 'bg-gradient-to-r from-rose-950/80 to-rose-900/60 border-rose-500/60 text-rose-400 shadow-[0_0_20px_rgba(255,80,80,0.25)]'
                : 'bg-slate-900/80 border-slate-700 text-slate-400'
            }`}
          >
            <span>{vote?.type || 'WAITING'}</span>
            <span className="text-sm px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-white font-mono">
              {vote?.type === 'Big' ? '5-9' : '0-4'}
            </span>
          </div>

          {/* Color Chip */}
          <div
            className={`px-3 py-2 rounded-xl font-mono text-xs sm:text-sm font-bold border ${getColorBadge(
              vote?.color
            )}`}
          >
            🎨 {vote?.color || 'Analyzing...'}
          </div>

          {/* Exact Number Pick */}
          <div className="px-3 py-2 rounded-xl font-mono text-xs sm:text-sm font-bold bg-amber-500/10 border border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(255,191,0,0.15)] flex items-center gap-1">
            <span>🔢 NUM:</span>
            <span className="text-base text-white font-black">#{vote?.number ?? '-'}</span>
          </div>

          {/* Accuracy Score */}
          <div className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs sm:text-sm font-bold">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>{vote?.confidence || 75}% ACC</span>
          </div>
        </div>
      </div>

      {/* Engine Vote Progress Bar */}
      <div className="bg-black/30 rounded-xl p-3 border border-white/5 mb-3">
        <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
          <span className="text-emerald-400 font-bold">
            BIG: {vote?.bigCount || 0} ({bigPercent}%)
          </span>
          <span className="text-slate-400">
            Colors: <span className="text-rose-400">R:{vote?.redCount || 0}</span> |{' '}
            <span className="text-emerald-400">G:{vote?.greenCount || 0}</span> |{' '}
            <span className="text-purple-400">V:{vote?.violetCount || 0}</span>
          </span>
          <span className="text-rose-400 font-bold">
            SMALL: {vote?.smallCount || 0} ({100 - bigPercent}%)
          </span>
        </div>

        <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10 flex">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_rgba(46,200,110,0.5)]"
            style={{ width: `${bigPercent}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-500 shadow-[0_0_10px_rgba(255,80,80,0.5)] flex-1"
          />
        </div>
      </div>

      {/* Sure Shot Trigger Alert */}
      {isSureShot && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-600/20 border border-amber-400/50 p-2.5 text-center shadow-[0_0_20px_rgba(255,191,0,0.25)] animate-pulse">
          <div className="flex items-center justify-center gap-2 font-mono font-black text-amber-300 text-sm tracking-wider">
            <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>🎯 100% SURE SHOT CONFIRMED ({vote.sureShotPercent}%)</span>
            <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
          </div>
          <div className="text-[10px] text-amber-200/80 font-sans mt-0.5">
            25+ Engines in strong consensus. High probability payout trigger.
          </div>
        </div>
      )}
    </div>
  );
};
