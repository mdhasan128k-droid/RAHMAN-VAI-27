export type GameMode = '30s' | '1m' | '3m' | '5m';

export interface LotteryResult {
  period: string;
  number: number;
  type: 'Big' | 'Small';
  color: string;
  timestamp: number;
}

export interface Prediction {
  type: 'Big' | 'Small';
  number: number;
  color: string;
  calcNumber: number;
  confidence: number;
  logicName: string;
  emoji: string;
  note?: string;
}

export interface HistoryItem {
  ts: number;
  period?: string;
  prediction: 'Big' | 'Small';
  actual: 'Big' | 'Small';
  predictedColor: string;
  actualColor: string;
  predictedNumber: number;
  result: number;
  status: 'WIN' | 'LOSS';
  colorStatus: 'WIN' | 'LOSS';
  numberStatus: 'WIN' | 'LOSS';
  profit: number;
}

export interface Engine {
  id: number;
  name: string;
  emoji: string;
  wins: number;
  losses: number;
  colorWins: number;
  colorLosses: number;
  numberWins: number;
  numberLosses: number;
  consecutiveWins: number;
  maxConsecutive: number;
  history: HistoryItem[];
  currentPrediction: Prediction | null;
  winRate: number;
  colorWinRate: number;
  numberWinRate: number;
}

export interface Engine24hStats {
  wins24: number;
  losses24: number;
  total24: number;
  cw24: number;
  nw24: number;
  profit24: number;
  wr24: number;
}

export interface MasterVote {
  type: 'Big' | 'Small';
  number: number;
  color: string;
  confidence: number;
  bigCount: number;
  smallCount: number;
  redCount: number;
  greenCount: number;
  violetCount: number;
  sureShotPercent: number;
}
