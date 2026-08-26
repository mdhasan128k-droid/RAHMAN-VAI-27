import React from 'react';
import { Engine } from '../types';
import { get24hStats } from '../logic/engines';
import { Trophy, ChevronRight, Award, TrendingUp, Sparkles } from 'lucide-react';

interface ServerLeaderboardProps {
  engines: Engine[];
  onSelectEngine: (engineId: number) => void;
  onViewAllServers: () => void;
}

export const ServerLeaderboard: React.FC<ServerLeaderboardProps> = ({
  engines,
  onSelectEngine,
  onViewAllServers,
}) => {
  const topEngines = engines.slice(0, 5);

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-black font-black text-xs flex items-center justify-center shadow-[0_0_12px_rgba(255,191,0,0.5)] flex-shrink-0">
          1
        </span>
      );
    }
    if (index === 1) {
      return (
        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-black font-black text-xs flex items-center justify-center shadow-[0_0_10px_rgba(200,200,200,0.4)] flex-shrink-0">
          2
        </span>
      );
    }
    if (index === 2) {
      return (
        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 text-amber-200 font-black text-xs flex items-center justify-center border border-amber-500/50 flex-shrink-0">
          3
        </span>
      );
    }
    return (
      <span className="w-6 h-6 rounded-full bg-black/50 text-slate-400 font-mono font-bold text-xs flex items-center justify-center border border-white/10 flex-shrink-0">
        {index + 1}
      </span>
    );
  };

  const getColorClass = (color?: string) => {
    if (!color) return 'bg-slate-800 text-slate-300 border-slate-700';
    if (color.includes('/')) return 'bg-purple-950/60 text-purple-200 border-purple-500/30';
    if (color === 'Green') return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';
    if (color === 'Red') return 'bg-rose-950/60 text-rose-300 border-rose-500/40';
    if (color === 'Violet') return 'bg-purple-950/60 text-purple-300 border-purple-500/40';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Top Ranked Servers
          </span>
          <div className="w-12 h-[1px] bg-gradient-to-r from-amber-500/30 to-transparent" />
        </div>

        <button
          type="button"
          onClick={onViewAllServers}
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1 rounded-lg border border-cyan-500/20 transition-all font-semibold"
        >
          <span>All 27 Servers</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {topEngines.map((eng, idx) => {
          const stats24 = get24hStats(eng);
          const pred = eng.currentPrediction;
          const recent10 = (eng.history || []).slice(0, 10);
          const isTop1 = idx === 0;

          return (
            <div
              key={eng.id}
              onClick={() => onSelectEngine(eng.id)}
              className={`group relative overflow-hidden rounded-2xl p-3.5 transition-all duration-200 cursor-pointer border ${
                isTop1
                  ? 'bg-gradient-to-r from-amber-950/25 via-[#0d1726]/80 to-[#070e1c]/90 border-amber-400/40 shadow-[0_0_20px_rgba(255,191,0,0.12)] hover:border-amber-400/70'
                  : 'bg-gradient-to-b from-[#0a1220]/75 to-[#060b14]/85 border-white/8 hover:border-cyan-500/30 hover:bg-[#0c182a]/90 shadow-[0_4px_16px_rgba(0,0,0,0.2)]'
              }`}
            >
              {/* Subtle top-1 glow ambient background */}
              {isTop1 && (
                <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              )}

              <div className="flex items-start gap-3 relative z-10">
                {/* Emoji Avatar & Rank Badge */}
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border flex-shrink-0 ${
                      isTop1
                        ? 'bg-gradient-to-br from-amber-500/20 to-amber-900/40 border-amber-400/40 shadow-[0_0_12px_rgba(255,191,0,0.2)]'
                        : 'bg-cyan-500/10 border-white/10 group-hover:border-cyan-500/30'
                    }`}
                  >
                    {eng.emoji}
                  </div>
                  <div className="absolute -top-1.5 -left-1.5">{getRankBadge(idx)}</div>
                </div>

                {/* Main Engine Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className={`font-bold text-sm truncate ${
                          isTop1 ? 'text-amber-300 font-sans' : 'text-slate-100'
                        }`}
                      >
                        {eng.name}
                      </span>
                      {isTop1 && <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                      <span className="text-[10px] font-mono text-slate-500">#{eng.id}</span>
                    </div>

                    {/* Live Signal Badge */}
                    <span
                      className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg border flex-shrink-0 ${
                        pred?.type === 'Big'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(46,200,110,0.2)]'
                          : pred?.type === 'Small'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_8px_rgba(255,80,80,0.2)]'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {pred?.type || 'WAIT'}
                    </span>
                  </div>

                  {/* Chips: Color, Number, Confidence */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${getColorClass(
                        pred?.color
                      )}`}
                    >
                      {pred?.color || 'Color --'}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/40 text-slate-200 border border-white/10">
                      #{pred?.number ?? '-'}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {pred?.confidence ?? 70}% Conf
                    </span>
                    {eng.consecutiveWins >= 2 && (
                      <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        🔥 {eng.consecutiveWins} Streak
                      </span>
                    )}
                  </div>

                  {/* Bottom Stats: 24h & W/L Sequence Pattern */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <span>
                        W/R: <strong className="text-cyan-300">{eng.winRate}%</strong>
                      </span>
                      <span className="text-slate-600">|</span>
                      <span>
                        24h:{' '}
                        <strong className="text-emerald-400">{stats24.wins24}W</strong>/
                        <strong className="text-rose-400">{stats24.losses24}L</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500">Pattern:</span>
                      <div className="flex items-center gap-0.5">
                        {recent10.length > 0 ? (
                          recent10.slice(0, 7).map((h, i) => (
                            <span
                              key={i}
                              className={`w-3.5 h-3.5 rounded text-[9px] font-mono font-black flex items-center justify-center ${
                                h.status === 'WIN'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              {h.status === 'WIN' ? 'W' : 'L'}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-600">Pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
