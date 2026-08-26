import React from 'react';
import { GameMode } from '../types';
import { Timer } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  remainingSeconds: number;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  remainingSeconds,
}) => {
  const modes: Array<{ id: GameMode; label: string; sub: string }> = [
    { id: '30s', label: '30S', sub: 'Wingo 30s' },
    { id: '1m', label: '1M', sub: 'Wingo 1m' },
    { id: '3m', label: '3M', sub: 'Wingo 3m' },
    { id: '5m', label: '5M', sub: 'Wingo 5m' },
  ];

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5 text-cyan-400" />
          Prediction Modes
        </span>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-cyan-500/20 to-transparent" />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {modes.map((m) => {
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMode(m.id)}
              className={`relative py-2.5 px-1 rounded-xl text-center transition-all duration-200 border flex flex-col items-center justify-center ${
                isActive
                  ? 'bg-gradient-to-b from-cyan-500/20 via-cyan-500/10 to-transparent border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,230,230,0.25)] font-bold'
                  : 'bg-black/30 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="font-mono text-sm tracking-wider font-extrabold flex items-center gap-1">
                {m.label}
              </div>
              <div className="text-[9px] text-slate-400 font-sans mt-0.5">
                {isActive ? (
                  <span className="text-cyan-300 font-mono font-bold animate-pulse">
                    {remainingSeconds}s
                  </span>
                ) : (
                  m.sub
                )}
              </div>

              {isActive && (
                <span className="absolute -bottom-1 w-6 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_rgb(0,230,230)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
