import React, { useState } from 'react';
import { GameMode } from '../types';
import { LIVE_DRAW_ENDPOINTS } from '../logic/lotteryStore';
import { Globe, X, Check, Copy, Activity, RefreshCw } from 'lucide-react';

interface LiveEndpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: GameMode;
  onRefresh: () => void;
}

export const LiveEndpointModal: React.FC<LiveEndpointModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onRefresh,
}) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl = LIVE_DRAW_ENDPOINTS[currentMode];

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#09111e] border border-cyan-500/30 p-5 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-black text-white font-['Space_Grotesk']">
              Live Data Source & API Stream
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

        {/* Current Active Endpoint */}
        <div className="bg-black/50 rounded-xl p-3.5 border border-cyan-500/30 mb-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Active Feed ({currentMode.toUpperCase()})
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              CONNECTED
            </span>
          </div>

          <div className="font-mono text-xs text-slate-200 bg-black/60 p-2.5 rounded-lg border border-white/10 break-all select-all flex items-center justify-between gap-2">
            <span>{currentUrl}</span>
            <button
              type="button"
              onClick={() => handleCopy(currentUrl)}
              className="p-1.5 rounded bg-white/10 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-all flex-shrink-0"
              title="Copy URL"
            >
              {copiedUrl === currentUrl ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* All Mode Endpoints */}
        <div className="space-y-2 mb-4">
          <div className="text-[11px] font-mono uppercase text-slate-400 font-bold tracking-wider">
            All Synced Wingo Endpoints:
          </div>

          {(['30s', '1m', '3m', '5m'] as GameMode[]).map((m) => {
            const url = LIVE_DRAW_ENDPOINTS[m];
            const isActive = currentMode === m;
            return (
              <div
                key={m}
                className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between gap-2 ${
                  isActive
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                    : 'bg-black/30 border-white/5 text-slate-400'
                }`}
              >
                <div className="truncate flex-1">
                  <span className="font-bold text-white mr-2">[{m.toUpperCase()}]:</span>
                  <span className="text-slate-300 truncate">{url}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(url)}
                  className="p-1 rounded bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white"
                  title="Copy"
                >
                  {copiedUrl === url ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={() => {
            onRefresh();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-black text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(0,230,230,0.3)] flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Force Poll Live Draw Server</span>
        </button>
      </div>
    </div>
  );
};
