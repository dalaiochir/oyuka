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

export function buildTwoStageWordQuestions() {
  const threat = shuffle(THREAT_WORDS);
  const neutral = shuffle(NEUTRAL_WORDS);

  const pairCount = Math.min(threat.length, neutral.length);

  const threatQuestions: Question[] = [];
  const neutralQuestions: Question[] = [];

  for (let i = 0; i < pairCount; i++) {
    const tWord = threat[i];
    const nWord = neutral[i];

    // random байрлал
    const threatOnLeft = Math.random() < 0.5;

    const leftWord = threatOnLeft ? tWord : nWord;
    const rightWord = threatOnLeft ? nWord : tWord;

    // 1-р үе: Threat үгийг ол
    threatQuestions.push({
      id: `threat_${i + 1}`,
      stage: "threat",
      prompt: "Занал хийсэн утгатай үгийг ол",
      leftImage: "", // ашиглахгүй
      rightImage: "", // ашиглахгүй
      correct: threatOnLeft ? "left" : "right",
      leftLabel: leftWord,
      rightLabel: rightWord,
    });

    // 2-р үе: Neutral үгийг ол
    neutralQuestions.push({
      id: `neutral_${i + 1}`,
      stage: "neutral",
      prompt: "Энгийн утгатай үгийг ол",
      leftImage: "",
      rightImage: "",
      correct: threatOnLeft ? "right" : "left",
      leftLabel: leftWord,
      rightLabel: rightWord,
    });
  }

  return { threatQuestions, neutralQuestions, pairCount };
}
