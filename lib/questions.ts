import { Question } from "./types";

export const QUESTIONS: Question[] = [
  // Threat stage
  {
    id: "t1",
    stage: "threat",
    prompt: "Занал хийсэн утгатай үгийг ол",
    leftImage: "/images/threat1a.jpg",
    rightImage: "/images/threat1b.jpg",
    correct: "left",
    leftLabel: "A",
    rightLabel: "B",
  },
  {
    id: "t2",
    stage: "threat",
    prompt: "Занал хийсэн утгатай үгийг ол",
    leftImage: "/images/threat2a.jpg",
    rightImage: "/images/threat2b.jpg",
    correct: "right",
  },

  // Neutral stage
  {
    id: "n1",
    stage: "neutral",
    prompt: "Энгийн утгатай үгийг ол",
    leftImage: "/images/neutral1a.jpg",
    rightImage: "/images/neutral1b.jpg",
    correct: "right",
  },
  {
    id: "n2",
    stage: "neutral",
    prompt: "Энгийн утгатай үгийг ол",
    leftImage: "/images/neutral2a.jpg",
    rightImage: "/images/neutral2b.jpg",
    correct: "left",
  },
];

export const THREAT_QUESTIONS = QUESTIONS.filter(q => q.stage === "threat");
export const NEUTRAL_QUESTIONS = QUESTIONS.filter(q => q.stage === "neutral");
