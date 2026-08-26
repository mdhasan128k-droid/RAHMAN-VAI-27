import { LotteryResult, Prediction, Engine, Engine24hStats, MasterVote } from '../types';

export function digitRoot(n: number): number {
  let v = Math.abs(Math.floor(Number(n) || 0));
  while (v >= 10) {
    v = String(v)
      .split('')
      .reduce((s, d) => s + parseInt(d, 10), 0);
  }
  return v;
}

export function isBig(n: number): 'Big' | 'Small' {
  return Number(n) >= 5 ? 'Big' : 'Small';
}

export function opposite(t: 'Big' | 'Small'): 'Big' | 'Small' {
  return t === 'Big' ? 'Small' : 'Big';
}

export function getColor(n: number): string {
  const v = Number(n);
  if ([1, 3, 7, 9].includes(v)) return 'Green';
  if ([2, 4, 6, 8].includes(v)) return 'Red';
  if (v === 0) return 'Red/Violet';
  if (v === 5) return 'Green/Violet';
  return 'Red';
}

export function numFromZone(type: 'Big' | 'Small', seed: number, pref?: number[] | null): number {
  const big = [5, 6, 7, 8, 9];
  const small = [0, 1, 2, 3, 4];
  const src = type === 'Big' ? big : small;
  if (Array.isArray(pref) && pref.length) {
    return pref[Math.abs(seed) % pref.length];
  }
  return src[Math.abs(seed) % src.length];
}

export function mkPred(
  type: 'Big' | 'Small',
  seed: number,
  logicName: string,
  emoji: string,
  confidence = 70,
  pref: number[] | null = null,
  note = ''
): Prediction {
  const number = numFromZone(type, seed, pref);
  return {
    type,
    number,
    color: getColor(number),
    calcNumber: number,
    confidence: confidence || 70,
    logicName,
    emoji,
    note: note || '',
  };
}

// Logic 1 to 27
export function L1(h: LotteryResult[]): Prediction | null {
  if (h.length < 3) return null;
  const [a, b, c] = h.slice(0, 3).map((x) => x.number);
  const d = digitRoot(Math.abs(a + b - c));
  return mkPred(d >= 5 ? 'Big' : 'Small', d, 'Logic 1: Subtraction Root', '🐯', 66);
}

export function L2(h: LotteryResult[]): Prediction | null {
  if (h.length < 3) return null;
  const s = h.slice(0, 3).reduce((t, x) => t + x.number, 0);
  const d = digitRoot(s);
  return mkPred(d >= 5 ? 'Big' : 'Small', d, 'Logic 2: Triangular Sum', '🐉', 67);
}

export function L3(h: LotteryResult[]): Prediction | null {
  if (h.length < 10) return null;
  let big = 0;
  let small = 0;
  h.slice(0, 10).forEach((x) => (isBig(x.number) === 'Big' ? big++ : small++));
  const d = big === small ? digitRoot(h.slice(0, 10).reduce((s, x) => s + x.number, 0)) : big > small ? 7 : 2;
  return mkPred(big >= small ? 'Big' : 'Small', d, 'Logic 3: Dominance Wave', '🔥', 68);
}

export function L4(h: LotteryResult[]): Prediction | null {
  if (h.length < 10) return null;
  let sB = 0;
  let sS = 0;
  h.slice(0, 10).forEach((x) => (isBig(x.number) === 'Big' ? (sB += x.number) : (sS += x.number)));
  const d = digitRoot(Math.abs(sB - sS));
  return mkPred(d >= 5 ? 'Big' : 'Small', d, 'Logic 4: Delta Balance', '🦅', 68);
}

export function L5(h: LotteryResult[]): Prediction | null {
  if (h.length < 10) return null;
  const d = digitRoot(h.slice(0, 10).reduce((s, x) => s + x.number, 0));
  return mkPred(d >= 5 ? 'Big' : 'Small', d, 'Logic 5: Decade Sum', '🦁', 68);
}

export function L6(h: LotteryResult[]): Prediction | null {
  if (h.length < 3) return null;
  const d = digitRoot(Math.abs(h[0].number * 2 + h[1].number - h[2].number));
  return mkPred(d >= 5 ? 'Big' : 'Small', d, 'Logic 6: Weighted Slope', '⚡', 68);
}

export function L7(h: LotteryResult[]): Prediction | null {
  if (h.length < 4) return null;
  const d = digitRoot(h.slice(0, 4).reduce((s, x) => s + x.number, 0));
  return mkPred(d >= 5 ? 'Big' : 'Small', d, 'Logic 7: Quad Matrix', '🌀', 68);
}

export function L8(h: LotteryResult[], pid?: string): Prediction | null {
  const digits = String(pid || '')
    .slice(-4)
    .split('')
    .map(Number)
    .filter((d) => d !== 0);
  if (!digits.length) return h.length ? mkPred(isBig(h[0].number), h[0].number, 'Logic 8: Seed Remainder', '🐍', 65) : null;
  const product = digits.reduce((p, d) => p * d, 1);
  const fd = Math.abs(product - digitRoot(product)) % 10;
  return mkPred(fd >= 5 ? 'Big' : 'Small', fd, 'Logic 8: Seed Remainder', '🐍', 69);
}

export function L9(h: LotteryResult[], pid?: string): Prediction | null {
  const digits = String(pid || '')
    .slice(-4)
    .split('')
    .map(Number)
    .filter((d) => d !== 0);
  if (!digits.length) return h.length ? mkPred(isBig(h[0].number), h[0].number, 'Logic 9: Product Harmonic', '🐺', 65) : null;
  const product = digits.reduce((p, d) => p * d, 1);
  const d = digitRoot(Math.abs(product - digitRoot(product)));
  return mkPred(d >= 5 ? 'Big' : 'Small', d, 'Logic 9: Product Harmonic', '🐺', 69);
}

export function L10(h: LotteryResult[]): Prediction | null {
  const a = L1(h);
  const b = L2(h);
  if (!a || !b) return null;
  const d = digitRoot(Math.abs(a.number - b.number));
  return mkPred(d >= 5 ? 'Big' : 'Small', d, 'Logic 10: Dual Cross Diff', '💥', 71);
}

export function L11(h: LotteryResult[]): Prediction | null {
  const a = L1(h);
  const b = L2(h);
  if (!a || !b) return null;
  const d = digitRoot(a.number + b.number);
  return mkPred(d >= 5 ? 'Big' : 'Small', d, 'Logic 11: Dual Cross Sum', '🚀', 71);
}

export function L12(h: LotteryResult[]): Prediction | null {
  if (h.length < 5) return null;
  const arr = h.slice(0, 5).map((x) => x.number);
  const d = digitRoot(arr[0] * arr[1] + arr[2] + arr[3] - arr[4]);
  return mkPred(d >= 5 ? 'Big' : 'Small', d, 'Logic 12: Polynomial Flux', '🌪️', 70);
}

export function L13(h: LotteryResult[]): Prediction | null {
  const a = L5(h);
  const b = L6(h);
  if (!a || !b) return null;
  const d = digitRoot(a.number + b.number);
  return mkPred(d >= 5 ? 'Big' : 'Small', d, 'Logic 13: Ninja Synthesis', '🥷', 72);
}

export function L14(h: LotteryResult[]): Prediction | null {
  const a = L5(h);
  const b = L6(h);
  if (!a || !b) return null;
  const d = digitRoot(Math.abs(a.number - b.number));
  return mkPred(d >= 5 ? 'Big' : 'Small', d, 'Logic 14: Crown Divergence', '👑', 72);
}

export function L15(h: LotteryResult[], pid?: string): Prediction | null {
  const all = [
    L1(h), L2(h), L3(h), L4(h), L5(h), L6(h), L7(h),
    L8(h, pid), L9(h, pid), L10(h), L11(h), L12(h), L13(h), L14(h),
  ].filter(Boolean) as Prediction[];
  if (!all.length) return null;
  let big = 0;
  let small = 0;
  all.forEach((x) => (x.type === 'Big' ? big++ : small++));
  const type = big >= small ? 'Big' : 'Small';
  return mkPred(type, Math.max(big, small), 'VIP Prediction: Consensus', '⛰️', 74);
}

export function L16(h: LotteryResult[]): Prediction | null {
  if (h.length < 5) return null;
  const rec = h.slice(0, Math.min(10, h.length)).map((x) => isBig(x.number));
  let streak = 1;
  for (let i = 1; i < rec.length && rec[i] === rec[0]; i++) streak++;
  const type = streak >= 3 ? opposite(rec[0]) : opposite(isBig(h[0].number));
  return mkPred(type, streak + h[0].number, 'Logic 16: Streak Breaker', '🧠', 73);
}

export function L17(h: LotteryResult[]): Prediction | null {
  if (h.length < 6) return null;
  const arr = h.slice(0, 10).map((x) => isBig(x.number));
  const big = arr.filter((v) => v === 'Big').length;
  const small = arr.length - big;
  const type = big > small ? 'Small' : 'Big';
  return mkPred(type, Math.abs(big - small) + h[0].number, 'Logic 17: Shield Reversal', '🛡️', 74);
}

export function L18(h: LotteryResult[]): Prediction | null {
  if (!h.length) return null;
  const top = h[0].number;
  const type = top >= 5 ? 'Small' : 'Big';
  return mkPred(
    type,
    top,
    'Tiger Tapas: Pivot Zone',
    '🐅',
    top === 0 || top === 5 ? 88 : 76,
    top === 0 ? [0, 1, 2] : top === 5 ? [5, 7, 9] : null,
    'Top opposite'
  );
}

export function L19(h: LotteryResult[]): Prediction | null {
  if (!h.length) return null;
  const top = h[0].number;
  const type = top >= 5 ? 'Small' : 'Big';
  return mkPred(
    type,
    top + 2,
    'Dragon King: Sector Reverse',
    '🐲',
    top === 0 || top === 5 ? 87 : 77,
    top === 0 ? [0, 2, 4] : top === 5 ? [5, 7, 9] : null,
    'Zone reversal'
  );
}

export function L20(h: LotteryResult[]): Prediction | null {
  if (h.length < 3) return null;
  const arr = h.slice(0, 3).map((x) => isBig(x.number));
  const same3 = arr.every((v) => v === arr[0]);
  const type = same3 ? opposite(arr[0]) : isBig(h[0].number);
  return mkPred(
    type,
    h[0].number + h[1].number,
    'Phoenix Fire: Tri-Burst',
    '🕊️',
    h[0].number === 0 ? 89 : same3 ? 81 : 72,
    h[0].number === 0 ? [0, 1, 2, 3, 4] : null,
    '3x break'
  );
}

export function L21(h: LotteryResult[]): Prediction | null {
  if (h.length < 3) return null;
  const latest = h[0].number;
  const flow = h.slice(0, 5).reduce((s, x, i) => s + (isBig(x.number) === 'Big' ? 5 - i : -(5 - i)), 0);
  const power = latest * 0.6 + flow * 0.4;
  return mkPred(
    opposite(power >= 0 ? 'Big' : 'Small'),
    Math.abs(Math.round(power)) + latest,
    'Eagle Eye X: Momentum Flow',
    '🦉',
    79,
    null,
    'Opposite flow'
  );
}

export function L22(h: LotteryResult[]): Prediction | null {
  if (!h.length) return null;
  const top = h[0].number;
  let type = isBig(top);
  let pref: number[] | null = null;
  if ([7, 8, 9].includes(top)) {
    type = 'Small';
    pref = [0, 1, 2, 3, 4];
  } else if ([0, 1, 2, 3].includes(top)) {
    type = 'Big';
    pref = [6, 7, 8, 9];
  } else if (top === 5) {
    type = 'Big';
    pref = [5, 7, 8, 9];
  }
  return mkPred(type, top + 3, 'Cobra Strike Pro', '🦂', top === 5 ? 86 : 78, pref, 'Attack zone');
}

export function L23(h: LotteryResult[]): Prediction | null {
  if (h.length < 2) return null;
  const a = isBig(h[0].number);
  const b = isBig(h[1].number);
  let type = isBig(h[0].number);
  if (a === b) type = opposite(a);
  return mkPred(
    type,
    h[0].number + h[1].number,
    'Wolf Pack Flow: Double Reversal',
    '🐕',
    h[0].number === 0 ? 84 : a === b ? 80 : 73,
    h[0].number === 0 ? [0, 1, 2, 3, 4] : null,
    'Repeat opp'
  );
}

export function L24(h: LotteryResult[]): Prediction | null {
  if (!h.length) return null;
  const top = h[0].number;
  let type = isBig(top);
  let pref: number[] | null = null;
  if (top === 8) {
    type = 'Small';
    pref = [4, 3, 0];
  } else if (top === 7) {
    type = 'Small';
    pref = [2, 3, 4];
  } else if (top === 5) {
    type = 'Big';
    pref = [5, 7, 9];
  } else {
    type = opposite(isBig(top));
  }
  return mkPred(type, top + 4, 'Lion Heart Mirror', '🐆', top === 8 || top === 7 ? 85 : 76, pref, 'Mirror');
}

export function L25(h: LotteryResult[]): Prediction | null {
  if (h.length < 3) return null;
  const arr = h.slice(0, 3).map((x) => isBig(x.number));
  const same3 = arr.every((v) => v === arr[0]);
  const mixed = new Set(arr).size > 1;
  const top = h[0].number;
  const type = same3 ? opposite(arr[0]) : mixed ? isBig(top) : opposite(isBig(top));
  const pref = top === 0 || top === 5 ? [top, type === 'Big' ? 7 : 2, type === 'Big' ? 9 : 4] : null;
  return mkPred(type, top + h[1].number + h[2].number, 'Shadow Ninja: Hidden Flux', '🧿', top === 0 || top === 5 ? 86 : same3 ? 81 : 74, pref, 'Hidden flow');
}

export function L26(h: LotteryResult[]): Prediction | null {
  if (!h.length) return null;
  const top = h[0].number;
  const type = opposite(isBig(top));
  return mkPred(type, top + 5, 'Storm Chaser: Fast Shift', '🌊', top === 0 ? 84 : 78, top === 0 ? [0, 2, 4] : null, 'Fast shift');
}

export function L27(h: LotteryResult[], allPreds: Prediction[]): Prediction | null {
  if (!h.length) return null;
  let big = 0;
  let small = 0;
  (allPreds || []).forEach((p) => (p.type === 'Big' ? big++ : small++));
  const top = h[0].number;
  const mainType = big === small ? opposite(isBig(top)) : big > small ? 'Big' : 'Small';
  const boost = top === 0 ? [0, 2, 4] : top === 5 ? [5, 7, 9] : null;
  return mkPred(mainType, Math.max(big, small) + top, 'Apex Titan: Final Weighted Decision', '🗿', boost ? 90 : 82, boost, 'Final decision');
}

export function getBasePreds(h: LotteryResult[], pid?: string): Prediction[] {
  return [
    L1(h), L2(h), L3(h), L4(h), L5(h), L6(h), L7(h),
    L8(h, pid), L9(h, pid), L10(h), L11(h), L12(h), L13(h), L14(h),
    L15(h, pid), L16(h), L17(h), L18(h), L19(h), L20(h), L21(h),
    L22(h), L23(h), L24(h), L25(h), L26(h)
  ].filter(Boolean) as Prediction[];
}

export function getAllPreds(h: LotteryResult[], pid?: string): Prediction[] {
  const base = getBasePreds(h, pid);
  const apex = L27(h, base);
  return [...base, ...(apex ? [apex] : [])];
}

export function finalVote(h: LotteryResult[], pid?: string): MasterVote | null {
  const preds = getAllPreds(h, pid);
  if (!preds.length) return null;
  let big = 0;
  let small = 0;
  let red = 0;
  let green = 0;
  let violet = 0;

  preds.forEach((p) => {
    p.type === 'Big' ? big++ : small++;
    if (p.color.includes('Red')) red++;
    if (p.color.includes('Green')) green++;
    if (p.color.includes('Violet')) violet++;
  });

  const winType = big >= small ? 'Big' : 'Small';
  const loser = Math.min(big, small);
  const surePercent = loser <= 1 ? 100 : loser <= 2 ? 90 : Math.min(98, 62 + Math.round((Math.max(big, small) / preds.length) * 36));
  const num = numFromZone(winType, Math.max(big, small) + (h[0]?.number || 0));

  const colorW =
    red >= green && red >= violet
      ? violet > 0 && num === 0
        ? 'Red/Violet'
        : 'Red'
      : green >= red && green >= violet
      ? violet > 0 && num === 5
        ? 'Green/Violet'
        : 'Green'
      : 'Violet';

  return {
    type: winType,
    number: num,
    color: colorW,
    confidence: surePercent,
    bigCount: big,
    smallCount: small,
    redCount: red,
    greenCount: green,
    violetCount: violet,
    sureShotPercent: surePercent,
  };
}

export function getNumberPredictions(h: LotteryResult[], pid?: string): number[] {
  const preds = getAllPreds(h, pid);
  if (!preds.length) return [];
  const freq: Record<number, number> = {};
  preds.forEach((p) => {
    freq[p.number] = (freq[p.number] || 0) + 1;
  });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 3).map((x) => parseInt(x[0], 10));
}

export const ENGINE_DEFINITIONS: Array<{ name: string; emoji: string }> = [
  { name: 'Tiger Pro', emoji: '🐯' },
  { name: 'Dragon King', emoji: '🐉' },
  { name: 'Phoenix VIP', emoji: '🔥' },
  { name: 'Eagle Eye', emoji: '🦅' },
  { name: 'Lion Heart', emoji: '🦁' },
  { name: 'Thunder Bolt', emoji: '⚡' },
  { name: 'Shadow X', emoji: '🌀' },
  { name: 'Cobra Strike', emoji: '🐍' },
  { name: 'Wolf Pack', emoji: '🐺' },
  { name: 'Blaze Pro', emoji: '💥' },
  { name: 'Viper Gold', emoji: '🐍' },
  { name: 'Rocket Star', emoji: '🚀' },
  { name: 'Storm Chaser', emoji: '🌪️' },
  { name: 'Ninja Master', emoji: '🥷' },
  { name: 'VIP Consensus', emoji: '👑' },
  { name: 'Apex Titan', emoji: '⛰️' },
  { name: 'Quantum Pulse', emoji: '🧠' },
  { name: 'Tiger Tapas', emoji: '🐅' },
  { name: 'Dragon King Zone', emoji: '🐲' },
  { name: 'Phoenix Fire', emoji: '🕊️' },
  { name: 'Eagle Eye X', emoji: '🦉' },
  { name: 'Cobra Strike Pro', emoji: '🦂' },
  { name: 'Wolf Pack Flow', emoji: '🐕' },
  { name: 'Lion Heart Mirror', emoji: '🐆' },
  { name: 'Shadow Ninja', emoji: '🧿' },
  { name: 'Storm Chaser Fast', emoji: '🌊' },
  { name: 'Apex Titan Final', emoji: '🗿' },
];

export function get24hStats(eng: Engine): Engine24hStats {
  const now = Date.now();
  const oneDay = 86400000;
  const r = (eng.history || []).filter((h) => h.ts && now - h.ts <= oneDay);
  const w = r.filter((h) => h.status === 'WIN').length;
  const l = r.length - w;
  const cw = r.filter((h) => h.colorStatus === 'WIN').length;
  const nw = r.filter((h) => h.numberStatus === 'WIN').length;
  const profit = r.reduce((s, h) => s + Number(h.profit || 0), 0);
  return {
    wins24: w,
    losses24: l,
    total24: r.length,
    cw24: cw,
    nw24: nw,
    profit24: profit,
    wr24: r.length ? Math.round((w / r.length) * 100) : 0,
  };
}

export function sortEngines(list: Engine[]): Engine[] {
  return [...list].sort((a, b) => {
    const a24 = get24hStats(a);
    const b24 = get24hStats(b);
    return (
      b24.profit24 - a24.profit24 ||
      b24.wins24 - a24.wins24 ||
      b24.wr24 - a24.wr24 ||
      b.numberWins - a.numberWins ||
      b.colorWins - a.colorWins ||
      b.wins - a.wins ||
      b.winRate - a.winRate ||
      a.id - b.id
    );
  });
}
