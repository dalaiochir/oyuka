import type { InkColorKey } from "./stroopWords";

export type StroopCondition = "congruent" | "incongruent" | "neutral";

export type StroopTrial = {
  id: string;
  condition: StroopCondition;
  word: string;
  ink: InkColorKey;
  correctInk: InkColorKey;
};

export type StroopTrialResult = {
  trialId: string;
  condition: StroopCondition;
  word: string;
  ink: InkColorKey;
  correctInk: InkColorKey;
  picked: InkColorKey;
  correct: boolean;
  rtMs: number;
  shownAtMs: number;
  responseAtMs: number;
};

export type StroopAttempt = {
  id: string;
  createdAtIso: string;
  totalMs: number;
  totalTrials: number;
  accuracyPct: number;

  congruent: { meanRtMs: number; accuracyPct: number };
  incongruent: { meanRtMs: number; accuracyPct: number };
  neutral: { meanRtMs: number; accuracyPct: number };

  // classic interference (incongruent - congruent)
  interferenceMs: number;

  results: StroopTrialResult[];
};
