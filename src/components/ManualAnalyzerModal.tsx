import React, { useState } from 'react';
import { LotteryResult, Prediction, MasterVote } from '../types';
import { getAllPreds, finalVote, isBig, getColor } from '../logic/engines';
import { X, Play, Sparkles, RefreshCw, Zap } from 'lucide-react';

interface ManualAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualAnalyzerModal: React.FC<ManualAnalyzerModalProps> = ({ isOpen, onClose }) => {
  const [inputNumbers, setInputNumbers] = useState('7, 2, 8, 4, 1, 9, 5, 0, 3, 6');
  const [customPeriod, setCustomPeriod] = useState('20260826010500');
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [vote, setVote] = useState<MasterVote | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = () => {
    const rawList = inputNumbers
      .split(/[\s,]+/)
      .map((x) => parseInt(x.trim(), 10))
      .filter((n) => !isNaN(n) && n >= 0 && n <= 9);

    if (rawList.length < 3) {
      alert('Please provide at least 3 historical numbers (0-9) separated by commas.');
      return;
    }

    const mockHistory: LotteryResult[] = rawList.map((n, idx) => ({
      period: (BigInt(customPeriod || '20260826010500') - BigInt(idx + 1)).toString(),
      number: n,
      type: isBig(n),
      color: getColor(n),
      timestamp: Date.now() - idx * 30000,
    }));

    const nextPreds = getAllPreds(mockHistory, customPeriod);
    const calculatedVote = finalVote(mockHistory, customPeriod);

    setPredictions(nextPreds);
    setVote(calculatedVote);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#09111e] border border-cyan-500/30 p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-black text-white font-['Space_Grotesk']">
              Custom Pattern & Logic Calculator
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Form */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              Historical Numbers (Latest First, comma separated 0-9)
            </label>
            <input
              type="text"
              value={inputNumbers}
              onChange={(e) => setInputNumbers(e.target.value)}
              placeholder="e.g. 7, 2, 8, 4, 1, 9, 5"
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              Target Period ID
            </label>
            <input
              type="text"
              value={customPeriod}
              onChange={(e) => setCustomPeriod(e.target.value)}
              placeholder="e.g. 20260826010500"
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-black text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(0,230,230,0.3)] flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Execute 27 Algorithmic Logics</span>
          </button>
        </div>

        {/* Results Output */}
        {vote && predictions && (
          <div className="space-y-3 pt-3 border-t border-white/10 animate-fadeIn">
            {/* Consensus Banner */}
            <div className="rounded-xl bg-black/50 border border-cyan-500/40 p-3.5">
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">
                CONSENSUS PREDICTION FOR {customPeriod}
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`px-3 py-1 rounded-lg font-mono text-lg font-black ${
                    vote.type === 'Big'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {vote.type.toUpperCase()}
                </span>
                <span className="px-2.5 py-1 rounded-lg font-mono text-xs font-bold bg-white/5 border border-white/10 text-purple-300">
                  {vote.color}
                </span>
                <span className="px-2.5 py-1 rounded-lg font-mono text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  #{vote.number}
                </span>
                <span className="ml-auto font-mono text-xs text-cyan-300 font-bold">
                  {vote.confidence}% ACC
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-400 flex justify-between">
                <span>BIG: {vote.bigCount}</span>
                <span>SMALL: {vote.smallCount}</span>
                <span>SURE SHOT: {vote.sureShotPercent}%</span>
              </div>
            </div>

            {/* Individual Logics */}
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
              {predictions.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1 px-2 rounded bg-black/30 border border-white/5"
                >
                  <span className="text-slate-300">
                    {p.emoji} #{i + 1} {p.logicName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold ${
                        p.type === 'Big' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {p.type}
                    </span>
                    <span className="text-amber-300">#{p.number}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
