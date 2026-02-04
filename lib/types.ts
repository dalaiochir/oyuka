export type Phase = "threat" | "neutral";

export type Trial = {
  id: string;
  threatWord: string;
  neutralWord: string;
  // 0 = left is threat, 1 = right is threat
  threatSide: 0 | 1;
};

export type Question = {
  id: string;
  stage: "threat" | "neutral";
  prompt: string;
  correct: "left" | "right";
  leftLabel?: string;
  rightLabel?: string;
  leftImage?: string;
  rightImage?: string;
};


export type TrialResult = {
  trialId: string;
  phase: Phase;
  shownAtMs: number; // performance.now() snapshot (debug only)
  responseAtMs: number; // performance.now() snapshot (debug only)
  rtMs: number;
  picked: "left" | "right";
  correctSide: "left" | "right";
  correct: boolean;
  threatWord: string;
  neutralWord: string;

  // ✅ шинэ: threat word (emotional) хаана байсан бэ
  threatSide?: "left" | "right";
};

export type Attempt = {
  id: string;
  createdAtIso: string;
  totalTrialsPerPhase: number;
  totalMs: number;
  accuracyPct: number;

  threat: {
    meanRtMs: number;
    accuracyPct: number;
  };
  neutral: {
    meanRtMs: number;
    accuracyPct: number;
  };

  // Attention Bias Score (ABS) = threat mean RT - neutral mean RT
  absMs: number;

  results: TrialResult[];
};
