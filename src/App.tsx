import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GameMode, LotteryResult, Engine, MasterVote } from './types';
import {
  createInitialEngines,
  generateSeedHistory,
  simulateHistoryBackfill,
  processNewPeriodResult,
  getRemainingSeconds,
  fetchLiveLotteryData,
  LIVE_DRAW_ENDPOINTS,
  MODE_SECONDS,
  MODE_LABELS,
} from './logic/lotteryStore';
import { finalVote, sortEngines } from './logic/engines';
import { soundManager } from './utils/audio';

import { Header } from './components/Header';
import { ModeSelector } from './components/ModeSelector';
import { MasterConsensusCard } from './components/MasterConsensusCard';
import { ServerLeaderboard } from './components/ServerLeaderboard';
import { ServerGridView } from './components/ServerGridView';
import { EngineDetailView } from './components/EngineDetailView';
import { ManualAnalyzerModal } from './components/ManualAnalyzerModal';
import { HistoryModal } from './components/HistoryModal';
import { LiveEndpointModal } from './components/LiveEndpointModal';

export default function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>('30s');
  const [currentView, setCurrentView] = useState<'HOME' | 'GRID' | 'ENGINE_DETAIL'>('HOME');
  const [selectedEngineId, setSelectedEngineId] = useState<number>(1);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [timeStr, setTimeStr] = useState<string>(new Date().toLocaleTimeString());
  const [isFastSim, setIsFastSim] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // Modals
  const [isTesterOpen, setIsTesterOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isEndpointModalOpen, setIsEndpointModalOpen] = useState<boolean>(false);
  const [lastSyncedPeriod, setLastSyncedPeriod] = useState<string>('');

  // Per-mode state storage
  const [modeData, setModeData] = useState<Record<GameMode, { engines: Engine[]; history: LotteryResult[] }>>(() => {
    // Try restoring from localStorage or generate fresh
    const saved = localStorage.getItem('lah_lottery_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed['30s'] && parsed['1m'] && parsed['3m'] && parsed['5m']) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }

    // Initialize with rich backfilled simulation
    const initData: Record<GameMode, { engines: Engine[]; history: LotteryResult[] }> = {
      '30s': { engines: [], history: [] },
      '1m': { engines: [], history: [] },
      '3m': { engines: [], history: [] },
      '5m': { engines: [], history: [] },
    };

    (['30s', '1m', '3m', '5m'] as GameMode[]).forEach((m) => {
      const initialEngines = createInitialEngines();
      const seedHistory = generateSeedHistory(40);
      const readyEngines = simulateHistoryBackfill(initialEngines, seedHistory);
      initData[m] = {
        engines: readyEngines,
        history: seedHistory,
      };
    });

    return initData;
  });

  const [remainingSecs, setRemainingSecs] = useState<number>(() => getRemainingSeconds('30s'));
  const fastTimerRef = useRef<number>(30);

  // Poll live draw endpoint whenever currentMode changes or on interval
  const syncLiveDraw = useCallback(async (mode: GameMode) => {
    try {
      const liveResults = await fetchLiveLotteryData(mode);
      if (liveResults && liveResults.length > 0) {
        setIsOnline(true);
        setModeData((prev) => {
          const current = prev[mode];
          if (!current) return prev;

          // Check if latest period in liveResults is newer
          const newestLive = liveResults[0];
          const currentTopPeriod = current.history[0]?.period;

          if (currentTopPeriod && newestLive.period === currentTopPeriod) {
            return prev;
          }

          // Merge live history into engine backfill
          const initialEngines = createInitialEngines();
          const readyEngines = simulateHistoryBackfill(initialEngines, [...liveResults].reverse());

          return {
            ...prev,
            [mode]: {
              engines: readyEngines,
              history: liveResults,
            },
          };
        });
      }
    } catch {
      // Keep offline/simulated loop running seamlessly
    }
  }, []);

  // Poll live endpoint on mount & when mode changes
  useEffect(() => {
    syncLiveDraw(currentMode);
    const livePoll = setInterval(() => {
      syncLiveDraw(currentMode);
    }, 6000);
    return () => clearInterval(livePoll);
  }, [currentMode, syncLiveDraw]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lah_lottery_v1', JSON.stringify(modeData));
    } catch {
      // ignore
    }
  }, [modeData]);

  // Current mode slice
  const currentEngines = modeData[currentMode]?.engines || [];
  const currentHistory = modeData[currentMode]?.history || [];

  const sortedEngines = useMemo(() => {
    return sortEngines(currentEngines);
  }, [currentEngines]);

  const nextPeriod = useMemo(() => {
    if (!currentHistory.length) return '20260826010001';
    return (BigInt(currentHistory[0].period) + 1n).toString();
  }, [currentHistory]);

  const masterVote = useMemo(() => {
    return finalVote(currentHistory, nextPeriod);
  }, [currentHistory, nextPeriod]);

  // Trigger New Round Calculation
  const triggerNewPeriod = useCallback((mode: GameMode) => {
    setModeData((prev) => {
      const modeSlice = prev[mode];
      if (!modeSlice || !modeSlice.history.length) return prev;

      const lastP = modeSlice.history[0];
      const newPeriodId = (BigInt(lastP.period) + 1n).toString();
      const newNumber = Math.floor(Math.random() * 10);
      const isBigType = newNumber >= 5 ? 'Big' : 'Small';
      const newColor =
        [1, 3, 7, 9].includes(newNumber)
          ? 'Green'
          : [2, 4, 6, 8].includes(newNumber)
          ? 'Red'
          : newNumber === 0
          ? 'Red/Violet'
          : 'Green/Violet';

      const newResult: LotteryResult = {
        period: newPeriodId,
        number: newNumber,
        type: isBigType,
        color: newColor,
        timestamp: Date.now(),
      };

      const { updatedEngines, updatedHistory, winsCount } = processNewPeriodResult(
        modeSlice.engines,
        modeSlice.history,
        newResult
      );

      // Play sound
      if (winsCount > 13) {
        soundManager.playWin();
      } else {
        soundManager.playTick();
      }

      return {
        ...prev,
        [mode]: {
          engines: updatedEngines,
          history: updatedHistory,
        },
      };
    });
  }, []);

  // Main real-time clock & timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString());

      if (isFastSim) {
        fastTimerRef.current -= 1;
        if (fastTimerRef.current <= 0) {
          fastTimerRef.current = 10;
          triggerNewPeriod(currentMode);
        }
        setRemainingSecs(fastTimerRef.current);
      } else {
        const sec = getRemainingSeconds(currentMode);
        setRemainingSecs(sec);
        if (sec === MODE_SECONDS[currentMode]) {
          triggerNewPeriod(currentMode);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentMode, isFastSim, triggerNewPeriod]);

  // Audio mute handler
  const handleToggleAudio = (val: boolean) => {
    setAudioEnabled(val);
    soundManager.setEnabled(val);
  };

  const handleRefresh = () => {
    triggerNewPeriod(currentMode);
  };

  return (
    <main className="min-h-screen bg-[#03060c] text-[#eef2ff] px-3 sm:px-4 py-3 sm:py-6 font-sans relative selection:bg-cyan-500 selection:text-black">
      {/* Background Ambience Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[540px] mx-auto relative z-10">
        {/* Top Header */}
        <Header
          isOnline={isOnline}
          timeStr={timeStr}
          isSimulatingFast={isFastSim}
          onToggleFastSim={() => setIsFastSim((prev) => !prev)}
          onOpenTester={() => setIsTesterOpen(true)}
          onRefresh={handleRefresh}
          audioEnabled={audioEnabled}
          onToggleAudio={handleToggleAudio}
          onOpenEndpointModal={() => setIsEndpointModalOpen(true)}
        />

        {/* View Routing */}
        {currentView === 'HOME' && (
          <div className="animate-fadeIn">
            {/* Mode Tabs */}
            <ModeSelector
              currentMode={currentMode}
              onSelectMode={(m) => {
                setCurrentMode(m);
                fastTimerRef.current = 10;
              }}
              remainingSeconds={remainingSecs}
            />

            {/* Master AI Consensus Card */}
            <MasterConsensusCard
              vote={masterVote}
              currentPeriod={nextPeriod}
              remainingSeconds={remainingSecs}
              currentMode={currentMode}
              onOpenHistory={() => setIsHistoryOpen(true)}
            />

            {/* Top 5 Leaderboard */}
            <ServerLeaderboard
              engines={sortedEngines}
              onSelectEngine={(id) => {
                setSelectedEngineId(id);
                setCurrentView('ENGINE_DETAIL');
              }}
              onViewAllServers={() => setCurrentView('GRID')}
            />
          </div>
        )}

        {currentView === 'GRID' && (
          <ServerGridView
            engines={sortedEngines}
            currentMode={currentMode}
            onSelectEngine={(id) => {
              setSelectedEngineId(id);
              setCurrentView('ENGINE_DETAIL');
            }}
            onBack={() => setCurrentView('HOME')}
            timeStr={timeStr}
          />
        )}

        {currentView === 'ENGINE_DETAIL' && (
          <EngineDetailView
            engine={currentEngines.find((e) => e.id === selectedEngineId) || currentEngines[0]}
            currentMode={currentMode}
            onSelectMode={(m) => {
              setCurrentMode(m);
              fastTimerRef.current = 10;
            }}
            remainingSeconds={remainingSecs}
            globalHistory={currentHistory}
            onBack={() => setCurrentView('HOME')}
          />
        )}

        {/* Modals */}
        <ManualAnalyzerModal
          isOpen={isTesterOpen}
          onClose={() => setIsTesterOpen(false)}
        />

        <HistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          history={currentHistory}
          currentMode={currentMode}
        />

        <LiveEndpointModal
          isOpen={isEndpointModalOpen}
          onClose={() => setIsEndpointModalOpen(false)}
          currentMode={currentMode}
          onRefresh={handleRefresh}
        />

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-white/5 text-center">
          <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
            2026 V1 © VERSION-X HGNICE || DK HACK
          </div>
          <div className="text-[9px] font-mono text-cyan-500/60 mt-1">
            27 Multi-Engine AI Signal Framework • High Probability Forecast
          </div>
        </footer>
      </div>
    </main>
  );
}
