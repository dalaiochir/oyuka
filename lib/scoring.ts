import type { Attempt, TrialResult } from "./types";

export function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10; // 1 decimal
}

export function formatMs(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function buildAttempt(params: {
  id: string;
  createdAtIso: string;
  totalTrialsPerPhase: number;
  totalMs: number;
  results: TrialResult[];
}): Attempt {
  const { id, createdAtIso, totalTrialsPerPhase, totalMs, results } = params;

  const threatResults = results.filter((r) => r.phase === "threat");
  const neutralResults = results.filter((r) => r.phase === "neutral");

  const threatRt = threatResults.map((r) => r.rtMs);
  const neutralRt = neutralResults.map((r) => r.rtMs);

  const threatCorrect = threatResults.filter((r) => r.correct).length;
  const neutralCorrect = neutralResults.filter((r) => r.correct).length;

  const threatMean = mean(threatRt);
  const neutralMean = mean(neutralRt);

  const accAll = results.filter((r) => r.correct).length;

  // ABS = congruent RT - incongruent RT (баримтад дурдсан) :contentReference[oaicite:4]{index=4}
  const absMs = threatMean - neutralMean;

  return {
    id,
    createdAtIso,
    totalTrialsPerPhase,
    totalMs,
    accuracyPct: pct(accAll, results.length),
    threat: { meanRtMs: threatMean, accuracyPct: pct(threatCorrect, threatResults.length) },
    neutral: { meanRtMs: neutralMean, accuracyPct: pct(neutralCorrect, neutralResults.length) },
    absMs,
    results,
  };
}

export function pickBestAttempt(attempts: Attempt[]): Attempt | null {
  if (!attempts.length) return null;

  // “best” = хамгийн өндөр accuracy, тэнцвэл хамгийн бага хугацаа
  const sorted = [...attempts].sort((a, b) => {
    if (b.accuracyPct !== a.accuracyPct) return b.accuracyPct - a.accuracyPct;
    return a.totalMs - b.totalMs;
  });
  return sorted[0] ?? null;
}
