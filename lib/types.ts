export type StageType = "threat" | "neutral";

export type Question = {
  id: string;
  stage: StageType;
  prompt: string; // дэлгэц дээрх текст (хүсвэл хоосон байж болно)
  leftImage: string;  // /images/...
  rightImage: string; // /images/...
  correct: "left" | "right";
  leftLabel?: string;  // хүсвэл
  rightLabel?: string; // хүсвэл
};

export type Attempt = {
  id: string;
  createdAt: string; // ISO
  totalMs: number;

  threat: { correct: number; total: number };
  neutral: { correct: number; total: number };

  overall: { correct: number; total: number; accuracyPct: number };
};
