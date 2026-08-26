import React, { useState, useMemo } from 'react';
import { Engine, GameMode } from '../types';
import { get24hStats } from '../logic/engines';
import { ArrowLeft, Search, SlidersHorizontal, ArrowUpDown, ChevronRight, Activity } from 'lucide-react';

interface ServerGridViewProps {
  engines: Engine[];
  currentMode: GameMode;
  onSelectEngine: (id: number) => void;
  onBack: () => void;
  timeStr: string;
}

export const ServerGridView: React.FC<ServerGridViewProps> = ({
  engines,
  currentMode,
  onSelectEngine,
  onBack,
  timeStr,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'BIG' | 'SMALL'>('ALL');
  const [sortBy, setSortBy] = useState<'PROFIT' | 'WINRATE' | 'STREAK' | 'NUMBER_WR'>('PROFIT');

  const filteredEngines = useMemo(() => {
    let list = [...engines];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.id.toString().includes(q) ||
          e.currentPrediction?.logicName.toLowerCase().includes(q)
      );
    }

    if (filterType === 'BIG') {
      list = list.filter((e) => e.currentPrediction?.type === 'Big');
    } else if (filterType === 'SMALL') {
      list = list.filter((e) => e.currentPrediction?.type === 'Small');
    }

    list.sort((a, b) => {
      const a24 = get24hStats(a);
      const b24 = get24hStats(b);
      if (sortBy === 'PROFIT') {
        return b24.profit24 - a24.profit24 || b.winRate - a.winRate;
      }
      if (sortBy === 'WINRATE') {
        return b.winRate - a.winRate || b24.wins24 - a24.wins24;
      }
      if (sortBy === 'STREAK') {
        return b.consecutiveWins - a.consecutiveWins || b.maxConsecutive - a.maxConsecutive;
      }
      if (sortBy === 'NUMBER_WR') {
        return b.numberWinRate - a.numberWinRate || b.colorWinRate - a.colorWinRate;
      }
      return a.id - b.id;
    });

    return list;
  }, [engines, searchQuery, filterType, sortBy]);

  const totalPredictions = engines.reduce((s, e) => s + e.wins + e.losses, 0);
  const totalWins = engines.reduce((s, e) => s + e.wins, 0);
  const overallWR = totalPredictions > 0 ? Math.round((totalWins / totalPredictions) * 100) : 0;

  return (
    <div className="pb-8 animate-fadeIn">
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
            <h2 className="text-lg font-black tracking-tight text-white font-['Space_Grotesk'] flex items-center gap-2">
              <span>All 27 AI Engine Servers</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {currentMode.toUpperCase()}
              </span>
            </h2>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>Real-time Multi-Logic Grid</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400">{timeStr}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase font-mono text-slate-500">Overall Win Rate</div>
          <div className="text-base font-mono font-black text-cyan-300">{overallWR}%</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3 border border-white/10 mb-4 flex flex-col sm:flex-row gap-2.5">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search server name or ID (e.g. Tiger, 15)..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Signal Filter Buttons */}
        <div className="flex items-center gap-1.5">
          {(['ALL', 'BIG', 'SMALL'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                filterType === t
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(0,230,230,0.2)]'
                  : 'bg-black/40 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-black/50 border border-white/10 text-xs font-mono text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            <option value="PROFIT">Sort: 24h Profit</option>
            <option value="WINRATE">Sort: Win Rate %</option>
            <option value="STREAK">Sort: Win Streak</option>
            <option value="NUMBER_WR">Sort: Number Accuracy</option>
          </select>
        </div>
      </div>

      {/* Grid of 27 Servers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filteredEngines.map((eng) => {
          const stats24 = get24hStats(eng);
          const pred = eng.currentPrediction;
          const recent10 = (eng.history || []).slice(0, 8);

          return (
            <div
              key={eng.id}
              onClick={() => onSelectEngine(eng.id)}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0a1220]/80 via-[#070e1c]/85 to-[#040810]/95 border border-white/8 hover:border-cyan-500/40 p-3.5 transition-all duration-200 cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:shadow-[0_0_15px_rgba(0,230,230,0.15)] flex flex-col justify-between"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-xl flex-shrink-0 group-hover:border-cyan-500/30">
                      {eng.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {eng.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">#{eng.id}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        W/R: <span className="text-cyan-300 font-bold">{eng.winRate}%</span> | 24h:{' '}
                        <span className="text-emerald-400">{stats24.wins24}W</span>/
                        <span className="text-rose-400">{stats24.losses24}L</span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
                </div>

                {/* Prediction Chip Full Row */}
                <div className="flex items-center gap-2 mb-2.5">
                  <span
                    className={`flex-1 py-1.5 px-3 rounded-xl font-mono text-center text-xs font-black border tracking-wider ${
                      pred?.type === 'Big'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(46,200,110,0.2)]'
                        : pred?.type === 'Small'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(255,80,80,0.2)]'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {pred?.type ? `${pred.type.toUpperCase()} ${pred.type === 'Big' ? '(5-9)' : '(0-4)'}` : 'WAITING'}
                  </span>

                  <span className="font-mono text-xs font-bold px-2.5 py-1.5 rounded-xl bg-black/50 border border-white/10 text-amber-300">
                    #{pred?.number ?? '-'}
                  </span>
                </div>
              </div>

              {/* Pattern Sequence */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono">
                <span className="text-slate-500">Recent Runs:</span>
                <div className="flex items-center gap-1">
                  {recent10.map((h, i) => (
                    <span
                      key={i}
                      className={`w-3 h-3 rounded text-[8px] font-mono font-black flex items-center justify-center ${
                        h.status === 'WIN'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {h.status === 'WIN' ? 'W' : 'L'}
                    </span>
                  ))}
                  {recent10.length === 0 && <span className="text-slate-600">No data</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEngines.length === 0 && (
        <div className="text-center py-12 text-slate-500 font-mono text-sm">
          No engine servers matched your search criteria.
        </div>
      )}
    </div>
  );
};
