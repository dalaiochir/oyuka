const threatSide: "left" | "right" = currentTrial.threatSide === 0 ? "left" : "right";

const res: TrialResult = {
  trialId: currentTrial.id,
  phase,
  shownAtMs: shownAt,
  responseAtMs: now,
  rtMs,
  picked: side,
  correctSide,
  correct,
  threatWord: currentTrial.threatWord,
  neutralWord: currentTrial.neutralWord,
  threatSide, // ✅ нэмсэн
};
