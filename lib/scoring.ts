import type { Attempt } from "./types";

export function accuracyPct(correct: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

// Best = higher accuracy, if tie => lower totalMs
export function pickBestAttempt(history: Attempt[]): Attempt | null {
  if (!history.length) return null;
  return history.reduce((best, cur) => {
    if (cur.overall.accuracyPct > best.overall.accuracyPct) return cur;
    if (cur.overall.accuracyPct < best.overall.accuracyPct) return best;
    return cur.totalMs < best.totalMs ? cur : best;
  }, history[0]);
}

export function formatMs(ms: number) {
  const s = Math.round(ms / 1000);
  const min = Math.floor(s / 60);
  const sec = s % 60;
  if (min <= 0) return `${sec}s`;
  return `${min}m ${sec}s`;
}

// ✅ Random shuffle (Fisher–Yates)
export function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ✅ "not a module" асуудлаас хамгаална
export {};
