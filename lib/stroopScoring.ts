import type { StroopAttempt, StroopCondition, StroopTrialResult } from "./stroopTypes";

function mean(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function pct(correctCount: number, total: number) {
  if (total === 0) return 0;
  return Math.round((correctCount / total) * 1000) / 10; // 1 decimal
}

function summarize(results: StroopTrialResult[], condition: StroopCondition) {
  const r = results.filter((x) => x.condition === condition);
  const correctR = r.filter((x) => x.correct);
  return {
    meanRtMs: Math.round(mean(correctR.map((x) => x.rtMs))),
    accuracyPct: pct(correctR.length, r.length),
  };
}

export function buildStroopAttempt(args: {
  id: string;
  createdAtIso: string;
  totalMs: number;
  results: StroopTrialResult[];
}): StroopAttempt {
  const { id, createdAtIso, totalMs, results } = args;

  const totalTrials = results.length;
  const correctCount = results.filter((x) => x.correct).length;

  const congruent = summarize(results, "congruent");
  const incongruent = summarize(results, "incongruent");
  const neutral = summarize(results, "neutral");

  return {
    id,
    createdAtIso,
    totalMs,
    totalTrials,
    accuracyPct: pct(correctCount, totalTrials),
    congruent,
    incongruent,
    neutral,
    interferenceMs: Math.round(incongruent.meanRtMs - congruent.meanRtMs),
    results,
  };
}
