import type { Question } from "./types";
import { THREAT_WORDS, NEUTRAL_WORDS } from "./words";

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildStageQuestions(
  stage: "threat" | "neutral",
  threatWords: string[],
  neutralWords: string[],
  prompt: string
): Question[] {
  const pairCount = Math.min(threatWords.length, neutralWords.length);

  const questions: Question[] = [];

  for (let i = 0; i < pairCount; i++) {
    const tWord = threatWords[i];
    const nWord = neutralWords[i];

    // random байрлал
    const threatOnLeft = Math.random() < 0.5;

    const leftWord = threatOnLeft ? tWord : nWord;
    const rightWord = threatOnLeft ? nWord : tWord;

    const correct =
      stage === "threat"
        ? threatOnLeft
          ? "left"
          : "right"
        : threatOnLeft
        ? "right"
        : "left";

    questions.push({
      id: `${stage}_${i + 1}`,
      stage,
      prompt,
      leftImage: "",
      rightImage: "",
      correct,
      leftLabel: leftWord,
      rightLabel: rightWord,
    });
  }

  return questions;
}

export function buildTwoStageWordQuestionsNoRepeat() {
  // shuffle dataset
  const threat = shuffle(THREAT_WORDS);
  const neutral = shuffle(NEUTRAL_WORDS);

  /**
   * Нэг үг дахин ашиглагдахгүй байлгахын тулд:
   * - Stage1 болон Stage2 дээр ашиглах үгнүүдийг тусад нь салгаж өгнө
   *
   * Stage1 ашиглах тоо = k
   * Stage2 ашиглах тоо = k
   * Тэгэхээр нийт хэрэгтэй threat = 2k, neutral = 2k
   *
   * k = floor(min(threat.length, neutral.length) / 2)
   */
  const k = Math.floor(Math.min(threat.length, neutral.length) / 2);

  const threatStageThreatWords = threat.slice(0, k);
  const threatStageNeutralWords = neutral.slice(0, k);

  const neutralStageThreatWords = threat.slice(k, 2 * k);
  const neutralStageNeutralWords = neutral.slice(k, 2 * k);

  const threatQuestions = buildStageQuestions(
    "threat",
    threatStageThreatWords,
    threatStageNeutralWords,
    "Занал хийсэн утгатай үгийг ол"
  );

  const neutralQuestions = buildStageQuestions(
    "neutral",
    neutralStageThreatWords,
    neutralStageNeutralWords,
    "Энгийн утгатай үгийг ол"
  );

  return {
    threatQuestions,
    neutralQuestions,
    pairCountPerStage: k,
  };
}
