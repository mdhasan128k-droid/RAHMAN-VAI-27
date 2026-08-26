import React from 'react';
import { LotteryResult, GameMode } from '../types';
import { X, Download, History, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: LotteryResult[];
  currentMode: GameMode;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  currentMode,
}) => {
  if (!isOpen) return null;

  const handleExportCSV = () => {
    const headers = ['Period', 'Number', 'Big/Small', 'Color', 'Time'];
    const rows = history.map((h) => [
      h.period,
      h.number,
      h.type,
      h.color,
      new Date(h.timestamp).toLocaleTimeString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `lottery_history_${currentMode}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getColorBadge = (color?: string) => {
    if (!color) return 'bg-slate-800 text-slate-300';
    if (color.includes('/')) return 'bg-purple-950/60 text-purple-200 border-purple-500/30';
    if (color === 'Green') return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';
    if (color === 'Red') return 'bg-rose-950/60 text-rose-300 border-rose-500/40';
    if (color === 'Violet') return 'bg-purple-950/60 text-purple-300 border-purple-500/40';
    return 'bg-slate-800 text-slate-300';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#09111e] border border-cyan-500/30 p-5 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-black text-white font-['Space_Grotesk']">
              {currentMode.toUpperCase()} Lottery History Logs
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              title="Export to CSV"
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 text-xs font-mono flex items-center gap-1 border border-white/10"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase text-cyan-400 sticky top-0 bg-[#09111e]">
                <th className="py-2 px-2">Period</th>
                <th className="py-2 px-2">Num</th>
                <th className="py-2 px-2">Type</th>
                <th className="py-2 px-2">Color</th>
                <th className="py-2 px-2 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {history.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/5">
                  <td className="py-2 px-2 text-slate-400 font-bold">
                    {item.period ? (item.period.length > 8 ? '...' + item.period.slice(-6) : item.period) : '---'}
                  </td>
                  <td className="py-2 px-2 font-black text-white text-sm">
                    {item.number}
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        item.type === 'Big' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {item.type === 'Big' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {item.type}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] border ${getColorBadge(
                        item.color
                      )}`}
                    >
                      {item.color}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right text-slate-500 text-[10px]">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
