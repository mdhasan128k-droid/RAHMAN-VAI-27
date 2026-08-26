import { GameMode, LotteryResult, Engine, HistoryItem } from '../types';
import {
  ENGINE_DEFINITIONS,
  getAllPreds,
  isBig,
  getColor,
  get24hStats,
  finalVote,
} from './engines';

export const LIVE_DRAW_ENDPOINTS: Record<GameMode, string> = {
  '30s': 'https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json',
  '1m': 'https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json',
  '3m': 'https://draw.ar-lottery01.com/WinGo/WinGo_3M/GetHistoryIssuePage.json',
  '5m': 'https://draw.ar-lottery01.com/WinGo/WinGo_5M/GetHistoryIssuePage.json',
};

export const BACKUP_DRAW_ENDPOINTS: Record<GameMode, string> = {
  '30s': 'https://draw.ar-lottery02.com/WinGo/WinGo_30S/GetHistoryIssuePage.json',
  '1m': 'https://draw.ar-lottery02.com/WinGo/WinGo_1M/GetHistoryIssuePage.json',
  '3m': 'https://draw.ar-lottery02.com/WinGo/WinGo_3M/GetHistoryIssuePage.json',
  '5m': 'https://draw.ar-lottery02.com/WinGo/WinGo_5M/GetHistoryIssuePage.json',
};

export function incrementPeriod(periodStr: string): string {
  try {
    const clean = (periodStr || '').replace(/\D/g, '');
    if (!clean) return Date.now().toString();
    return (BigInt(clean) + 1n).toString();
  } catch {
    const num = parseInt(periodStr || '0', 10);
    return isNaN(num) ? `${Date.now()}` : `${num + 1}`;
  }
}

export function sortLotteryResultsDesc(list: LotteryResult[]): LotteryResult[] {
  return list.sort((a, b) => {
    try {
      const aNum = BigInt((a.period || '').replace(/\D/g, '') || '0');
      const bNum = BigInt((b.period || '').replace(/\D/g, '') || '0');
      if (bNum > aNum) return 1;
      if (bNum < aNum) return -1;
      return 0;
    } catch {
      return (b.period || '').localeCompare(a.period || '');
    }
  });
}

export interface RawDrawItem {
  issueNumber?: string;
  period?: string;
  issue?: string;
  number?: string | number;
  openNum?: string | number;
  color?: string;
  openTime?: string;
  createTime?: string;
  [key: string]: any;
}

export function parseRawDrawItem(raw: RawDrawItem): LotteryResult | null {
  const periodStr = String(raw.issueNumber || raw.period || raw.issue || '');
  if (!periodStr) return null;

  const rawNum = raw.number !== undefined ? raw.number : raw.openNum;
  const numVal = parseInt(String(rawNum ?? '0'), 10);
  if (isNaN(numVal) || numVal < 0 || numVal > 9) return null;

  const type = isBig(numVal);
  const color = getColor(numVal);
  let timestamp = Date.now();
  if (raw.openTime || raw.createTime) {
    const parsedTs = new Date(raw.openTime || raw.createTime || '').getTime();
    if (!isNaN(parsedTs)) timestamp = parsedTs;
  }

  return {
    period: periodStr,
    number: numVal,
    type,
    color,
    timestamp,
  };
}

export async function fetchLiveLotteryData(mode: GameMode): Promise<LotteryResult[] | null> {
  const targetUrl = LIVE_DRAW_ENDPOINTS[mode];
  const urlsToTry = [
    targetUrl,
    `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
  ];

  for (const url of urlsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) continue;
      const json = await res.json();

      let list: any[] = [];
      if (Array.isArray(json)) {
        list = json;
      } else if (json.data && Array.isArray(json.data.list)) {
        list = json.data.list;
      } else if (json.data && Array.isArray(json.data.items)) {
        list = json.data.items;
      } else if (json.data && Array.isArray(json.data)) {
        list = json.data;
      } else if (Array.isArray(json.list)) {
        list = json.list;
      }

      if (list && list.length > 0) {
        const parsedResults: LotteryResult[] = [];
        for (const item of list) {
          const parsed = parseRawDrawItem(item);
          if (parsed) parsedResults.push(parsed);
        }
        if (parsedResults.length > 0) {
          // sort descending (latest first)
          return sortLotteryResultsDesc(parsedResults);
        }
      }
    } catch {
      // try next proxy / url
    }
  }
  return null;
}

export const MODE_SECONDS: Record<GameMode, number> = {
  '30s': 30,
  '1m': 60,
  '3m': 180,
  '5m': 300,
};

export const MODE_LABELS: Record<GameMode, string> = {
  '30s': 'Wingo 30 Second',
  '1m': 'Wingo 1 Minute',
  '3m': 'Wingo 3 Minute',
  '5m': 'Wingo 5 Minute',
};

export function createInitialEngines(): Engine[] {
  return ENGINE_DEFINITIONS.map((def, i) => ({
    id: i + 1,
    name: def.name,
    emoji: def.emoji,
    wins: 0,
    losses: 0,
    colorWins: 0,
    colorLosses: 0,
    numberWins: 0,
    numberLosses: 0,
    consecutiveWins: 0,
    maxConsecutive: 0,
    history: [],
    currentPrediction: null,
    winRate: 0,
    colorWinRate: 0,
    numberWinRate: 0,
  }));
}

export function recalcEngineRates(engines: Engine[]): void {
  engines.forEach((eng) => {
    const t = eng.wins + eng.losses;
    const ct = eng.colorWins + eng.colorLosses;
    const nt = eng.numberWins + eng.numberLosses;
    eng.winRate = t ? Math.round((eng.wins / t) * 100) : 0;
    eng.colorWinRate = ct ? Math.round((eng.colorWins / ct) * 100) : 0;
    eng.numberWinRate = nt ? Math.round((eng.numberWins / nt) * 100) : 0;
  });
}

export function generateSeedHistory(count = 45): LotteryResult[] {
  const list: LotteryResult[] = [];
  const now = Date.now();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const startPeriod = 1000 + Math.floor(Math.random() * 500);

  for (let i = count - 1; i >= 0; i--) {
    const periodNumber = startPeriod + (count - 1 - i);
    const period = `${dateStr}010${periodNumber}`;
    // Weighted natural lottery distribution
    const number = Math.floor(Math.random() * 10);
    list.push({
      period,
      number,
      type: isBig(number),
      color: getColor(number),
      timestamp: now - i * 30000,
    });
  }
  return list;
}

export function simulateHistoryBackfill(
  initialEngines: Engine[],
  history: LotteryResult[]
): Engine[] {
  const engines = initialEngines.map((e) => ({
    ...e,
    history: [] as HistoryItem[],
    wins: 0,
    losses: 0,
    colorWins: 0,
    colorLosses: 0,
    numberWins: 0,
    numberLosses: 0,
    consecutiveWins: 0,
    maxConsecutive: 0,
  }));

  // Replay history from oldest to newest to build realistic stats
  for (let i = 3; i < history.length; i++) {
    const currentItem = history[i];
    const pastSlice = history.slice(0, i).reverse();
    const preds = getAllPreds(pastSlice, currentItem.period);
    const actualType = isBig(currentItem.number);
    const actualColor = getColor(currentItem.number);

    engines.forEach((eng, idx) => {
      const pred = preds[idx];
      if (pred) {
        const status = pred.type === actualType ? 'WIN' : 'LOSS';
        const isColorMatch =
          pred.color === actualColor ||
          (pred.color.includes('/') && pred.color.split('/').includes(actualColor.split('/')[0]));
        const colorStatus = isColorMatch ? 'WIN' : 'LOSS';
        const numberStatus = pred.number === currentItem.number ? 'WIN' : 'LOSS';

        let profit = 0;
        if (status === 'WIN') profit += 1;
        else profit -= 1;
        if (colorStatus === 'WIN') profit += 0.5;
        if (numberStatus === 'WIN') profit += 1.5;

        eng.history.unshift({
          ts: currentItem.timestamp || Date.now() - (history.length - i) * 30000,
          period: currentItem.period,
          prediction: pred.type,
          actual: actualType,
          predictedColor: pred.color,
          actualColor,
          predictedNumber: pred.number,
          result: currentItem.number,
          status,
          colorStatus,
          numberStatus,
          profit,
        });

        if (status === 'WIN') {
          eng.wins++;
          eng.consecutiveWins++;
          if (eng.consecutiveWins > eng.maxConsecutive) {
            eng.maxConsecutive = eng.consecutiveWins;
          }
        } else {
          eng.losses++;
          eng.consecutiveWins = 0;
        }

        if (colorStatus === 'WIN') eng.colorWins++;
        else eng.colorLosses++;

        if (numberStatus === 'WIN') eng.numberWins++;
        else eng.numberLosses++;

        eng.history = eng.history.slice(0, 150);
      }
    });
  }

  recalcEngineRates(engines);

  // Compute prediction for next period
  const reversedHistory = [...history].reverse();
  const nextPeriod = incrementPeriod(reversedHistory[0]?.period || '0');
  const nextPreds = getAllPreds(reversedHistory, nextPeriod);
  engines.forEach((eng, idx) => {
    eng.currentPrediction = nextPreds[idx] || null;
  });

  return engines;
}

export function processNewPeriodResult(
  currentEngines: Engine[],
  currentHistory: LotteryResult[],
  newResult: LotteryResult
): { updatedEngines: Engine[]; updatedHistory: LotteryResult[]; winsCount: number } {
  const nextHistory = [newResult, ...currentHistory].slice(0, 70);
  const olderSlice = currentHistory; // History before this result
  const preds = getAllPreds(olderSlice, newResult.period);
  const actualType = isBig(newResult.number);
  const actualColor = getColor(newResult.number);

  let winsCount = 0;

  const updatedEngines = currentEngines.map((eng, idx) => {
    const newEng = { ...eng, history: [...eng.history] };
    const pred = preds[idx];
    if (pred) {
      const status = pred.type === actualType ? 'WIN' : 'LOSS';
      if (status === 'WIN') winsCount++;
      const isColorMatch =
        pred.color === actualColor ||
        (pred.color.includes('/') && pred.color.split('/').includes(actualColor.split('/')[0]));
      const colorStatus = isColorMatch ? 'WIN' : 'LOSS';
      const numberStatus = pred.number === newResult.number ? 'WIN' : 'LOSS';

      let profit = 0;
      if (status === 'WIN') profit += 1;
      else profit -= 1;
      if (colorStatus === 'WIN') profit += 0.5;
      if (numberStatus === 'WIN') profit += 1.5;

      newEng.history.unshift({
        ts: Date.now(),
        period: newResult.period,
        prediction: pred.type,
        actual: actualType,
        predictedColor: pred.color,
        actualColor,
        predictedNumber: pred.number,
        result: newResult.number,
        status,
        colorStatus,
        numberStatus,
        profit,
      });

      if (status === 'WIN') {
        newEng.wins++;
        newEng.consecutiveWins++;
        if (newEng.consecutiveWins > newEng.maxConsecutive) {
          newEng.maxConsecutive = newEng.consecutiveWins;
        }
      } else {
        newEng.losses++;
        newEng.consecutiveWins = 0;
      }

      if (colorStatus === 'WIN') newEng.colorWins++;
      else newEng.colorLosses++;

      if (numberStatus === 'WIN') newEng.numberWins++;
      else newEng.numberLosses++;

      newEng.history = newEng.history.slice(0, 150);
    }
    return newEng;
  });

  recalcEngineRates(updatedEngines);

  // Compute prediction for upcoming period
  const upcomingPeriod = incrementPeriod(newResult.period);
  const nextPreds = getAllPreds(nextHistory, upcomingPeriod);
  updatedEngines.forEach((eng, idx) => {
    eng.currentPrediction = nextPreds[idx] || null;
  });

  return {
    updatedEngines,
    updatedHistory: nextHistory,
    winsCount,
  };
}

export function getRemainingSeconds(mode: GameMode): number {
  const now = new Date();
  const total = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const mod = MODE_SECONDS[mode];
  return mod - (total % mod);
}
