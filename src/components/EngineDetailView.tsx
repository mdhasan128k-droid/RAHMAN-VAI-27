import React, { useState } from 'react';
import { Engine, GameMode, LotteryResult } from '../types';
import { get24hStats, getAllPreds, getNumberPredictions } from '../logic/engines';
import { MODE_SECONDS } from '../logic/lotteryStore';
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  Clock,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface EngineDetailViewProps {
  engine: Engine;
  currentMode: GameMode;
  onSelectMode: (m: GameMode) => void;
  remainingSeconds: number;
  globalHistory: LotteryResult[];
  onBack: () => void;
}

export const EngineDetailView: React.FC<EngineDetailViewProps> = ({
  engine,
  currentMode,
  onSelectMode,
  remainingSeconds,
  globalHistory,
  onBack,
}) => {
  const [copied, setCopied] = useState(false);

  const stats24 = get24hStats(engine);
  const nextPeriod = globalHistory[0]?.period
    ? (BigInt(globalHistory[0].period) + 1n).toString()
    : '---';

  const allPreds = getAllPreds(globalHistory, nextPeriod);
  const pred = allPreds[engine.id - 1] || engine.currentPrediction;
  const numPreds = getNumberPredictions(globalHistory, nextPeriod);

  const totalSecs = MODE_SECONDS[currentMode];
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (remainingSeconds / totalSecs) * circumference;

  const handleCopy = () => {
    if (!pred) return;
    const text = `🎯 ${engine.name} Server #${engine.id} [${currentMode.toUpperCase()}]\n📌 Period: ${nextPeriod}\n⚡ Choice: ${pred.type.toUpperCase()}\n🎨 Color: ${pred.color}\n🔢 Number: #${pred.number}\n🔥 Confidence: ${pred.confidence}%\n📊 WR: ${engine.winRate}%`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getColorClass = (color?: string) => {
    if (!color) return 'bg-slate-800 text-slate-300 border-slate-700';
    if (color.includes('/')) return 'bg-purple-950/60 text-purple-200 border-purple-500/30';
    if (color === 'Green') return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';
    if (color === 'Red') return 'bg-rose-950/60 text-rose-300 border-rose-500/40';
    if (color === 'Violet') return 'bg-purple-950/60 text-purple-300 border-purple-500/40';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  const recentHistory = (engine.history || []).slice(0, 10);

  return (
    <div className="pb-10 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{engine.emoji}</span>
              <h2 className="text-lg font-black tracking-tight text-white font-['Space_Grotesk']">
                {engine.name}
              </h2>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span className="text-cyan-400 font-bold">SERVER #{engine.id}</span>
              <span className="text-slate-600">•</span>
              <span className="text-purple-300">{pred?.logicName || 'Mathematical Engine'}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold transition-all shadow-[0_0_10px_rgba(0,230,230,0.15)]"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'COPIED' : 'SHARE'}</span>
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-4 gap-1.5 mb-4">
        {(['30s', '1m', '3m', '5m'] as GameMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onSelectMode(m)}
            className={`py-1.5 rounded-xl text-center text-xs font-mono font-bold border transition-all ${
              currentMode === m
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,230,230,0.2)]'
                : 'bg-black/30 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Active Round Prediction Card with Circular Timer */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0c1626]/90 via-[#070e1a]/95 to-[#040810]/95 border border-cyan-500/30 p-4 sm:p-5 mb-4 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>CURRENT TARGET PERIOD</span>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-black bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent mb-3">
              {nextPeriod}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-4 py-1.5 rounded-xl font-mono text-xl font-black border tracking-wider ${
                  pred?.type === 'Big'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(46,200,110,0.25)]'
                    : pred?.type === 'Small'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_15px_rgba(255,80,80,0.25)]'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {pred?.type || 'WAIT'}
              </span>

              <span
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border ${getColorClass(
                  pred?.color
                )}`}
              >
                {pred?.color || 'Color --'}
              </span>

              <span className="px-3 py-1.5 rounded-xl font-mono text-xs font-bold bg-black/50 border border-white/10 text-amber-300">
                Num #{pred?.number ?? '-'}
              </span>
            </div>
          </div>

          {/* Circular Countdown Timer */}
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
              <circle
                cx="35"
                cy="35"
                r={radius}
                stroke="rgba(0, 230, 230, 0.15)"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="35"
                cy="35"
                r={radius}
                stroke="rgb(0, 230, 230)"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                style={{
                  filter: 'drop-shadow(0 0 5px rgba(0, 230, 230, 0.7))',
                  transition: 'stroke-dashoffset 0.3s linear',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
              <span className="text-xl font-black text-white">{remainingSeconds}</span>
              <span className="text-[8px] text-cyan-400 uppercase -mt-1 font-bold">SEC</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stats Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-black/40 rounded-xl p-2.5 text-center border border-white/5">
          <div className="text-base sm:text-lg font-mono font-black text-cyan-300">
            {engine.winRate}%
          </div>
          <div className="text-[9px] uppercase font-mono text-slate-500 tracking-wider mt-0.5">
            BS Win Rate
          </div>
        </div>

        <div className="bg-black/40 rounded-xl p-2.5 text-center border border-white/5">
          <div className="text-base sm:text-lg font-mono font-black text-purple-300">
            {engine.colorWinRate}%
          </div>
          <div className="text-[9px] uppercase font-mono text-slate-500 tracking-wider mt-0.5">
            Color WR
          </div>
        </div>

        <div className="bg-black/40 rounded-xl p-2.5 text-center border border-white/5">
          <div className="text-base sm:text-lg font-mono font-black text-amber-300">
            {engine.numberWinRate}%
          </div>
          <div className="text-[9px] uppercase font-mono text-slate-500 tracking-wider mt-0.5">
            Num WR
          </div>
        </div>

        <div className="bg-black/40 rounded-xl p-2.5 text-center border border-white/5">
          <div
            className={`text-base sm:text-lg font-mono font-black ${
              stats24.profit24 >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {stats24.profit24 >= 0 ? `+${stats24.profit24.toFixed(1)}` : stats24.profit24.toFixed(1)}
          </div>
          <div className="text-[9px] uppercase font-mono text-slate-500 tracking-wider mt-0.5">
            24h Profit
          </div>
        </div>
      </div>

      {/* Confidence & Top 3 Numbers */}
      <div className="bg-black/40 rounded-2xl p-4 border border-white/10 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              ALGORITHM CONFIDENCE
            </div>
            <div className="text-2xl font-mono font-black text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{pred?.confidence || 75}%</span>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-[10px] text-slate-400 uppercase">24H PERFORMANCE</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">
              <span className="text-emerald-400">{stats24.wins24}W</span> /{' '}
              <span className="text-rose-400">{stats24.losses24}L</span>
            </div>
          </div>
        </div>

        {/* Top 3 Predicted Numbers */}
        <div className="pt-3 border-t border-white/5">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            🔢 TOP NUMBER PICKS (ZONE ANALYSIS)
          </div>
          <div className="flex items-center gap-2">
            {numPreds.map((n, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-xl font-mono text-sm font-black bg-white/5 border border-cyan-500/30 text-cyan-200"
              >
                #{n}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Table: Last 10 Results */}
      <div className="rounded-2xl bg-black/40 border border-white/10 overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <div className="text-xs font-mono font-bold text-slate-200">
            📋 Server #{engine.id} Verification Log (Last 10)
          </div>
          <span className="text-[10px] font-mono text-slate-500">Live Checked</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase text-cyan-400 bg-black/30">
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-2">Result</th>
                <th className="py-2.5 px-2">Pred</th>
                <th className="py-2.5 px-2">Color</th>
                <th className="py-2.5 px-2">Num</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {/* Upcoming Target Row */}
              {pred && (
                <tr className="bg-cyan-500/5">
                  <td className="py-2.5 px-3 text-amber-300 font-bold">
                    {nextPeriod.length > 8 ? '...' + nextPeriod.slice(-6) : nextPeriod}
                  </td>
                  <td className="py-2.5 px-2 text-slate-500">-</td>
                  <td
                    className={`py-2.5 px-2 font-bold ${
                      pred.type === 'Big' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {pred.type}
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${getColorClass(pred.color)}`}>
                      {pred.color}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 font-bold">#{pred.number}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      PENDING
                    </span>
                  </td>
                </tr>
              )}

              {/* Historical Rows */}
              {recentHistory.map((h, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400">
                    {h.period ? (h.period.length > 8 ? '...' + h.period.slice(-6) : h.period) : '---'}
                  </td>
                  <td className="py-2.5 px-2 font-black text-white">{h.result}</td>
                  <td
                    className={`py-2.5 px-2 font-bold ${
                      h.prediction === 'Big' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {h.prediction}
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${getColorClass(h.actualColor)}`}>
                      {h.actualColor}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 font-bold text-slate-300">
                    {h.predictedNumber >= 0 ? `#${h.predictedNumber}` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider ${
                        h.status === 'WIN'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All 27 Logics Comparison */}
      <div className="rounded-2xl bg-black/40 border border-white/10 p-4">
        <div className="text-xs font-mono font-bold text-slate-200 mb-3 flex items-center justify-between">
          <span>📊 Full 27 Algorithms Forecast for Period {nextPeriod}</span>
        </div>

        <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
          {allPreds.map((p, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg border text-xs font-mono ${
                idx + 1 === engine.id
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-white font-bold'
                  : 'bg-black/30 border-white/5 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{p.emoji}</span>
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  #{idx + 1} {p.logicName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`font-bold ${p.type === 'Big' ? 'text-emerald-400' : 'text-rose-400'}`}
                >
                  {p.type}
                </span>
                <span className="text-amber-300">#{p.number}</span>
                <span className="text-cyan-400/80 text-[10px]">{p.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
