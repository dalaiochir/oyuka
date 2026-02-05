export const STROOP_COLOR_WORDS = [
  "RED",
  "BLUE",
  "GREEN",
  "YELLOW",
  "PURPLE",
  "ORANGE",
  "PINK",
  "GRAY",
  "WHITE",
  "BROWN",
  "CYAN",
];

export const STROOP_NEUTRAL_WORDS = [
  "DOOR",
  "GROUP",
  "CHAIR",
  "TELEPHONE",
  "DOG",
  "COAT",
  "SOFA",
  "DIARY",
  "NEWSPAPER",
  "OVEN",
  "FLOOR",
  "SHOPPING",
  "UNBRELLA",
  "RADIO",
  "PAINTING",
  "SCHOOL",
  "BALL",
  "PENCIL",
  "MILK",
  "FOOTBALL",
];

export const STROOP_AGGRESSION_WORDS = [
  "RAGE",
  "ANGER",
  "TEAR",
  "ASSAULT",
  "KICK",
  "SHOUT",
  "PUNCH",
  "HATE",
  "FIGHT",
  "KILL",
  "PUNISH",
  "SLASH",
  "RAPE",
  "CUT",
  "WOUND",
  "INJURE",
  "THREATEN",
  "SLAP",
];

export const STROOP_POSITIVE_WORDS = [
  "DEVOTION",
  "AFFECTION",
  "ADMIRE",
  "EUPHORIC",
  "FOND",
  "GRATEFUL",
  "TOLERANT",
  "AMUSED",
  "LOVE",
  "JOY",
  "PROUD",
  "GLAD",
  "COMFORTABLE",
  "PEACE",
  "CHEERFUL",
  "WARM",
  "HOPE",
  "LIVELY",
];

export const STROOP_NEGATIVE_WORDS = [
  "ABANDONED",
  "ABUSED",
  "AFRAID",
  "FLESH",
  "AGONY",
  "ANGRY",
  "ARROGANT",
  "BAD",
  "CRAZY",
  "CRUELTY",
  "DETEST",
  "ENVY",
  "FEAR",
  "GUILT",
  "FRIGHTENED",
  "FURY",
  "HATEFUL",
  "SUSPICIOUS",
  "MISERY",
  "LOSE",
];

export type InkColorKey = "RED" | "BLUE" | "GREEN" | "YELLOW";

export const INK_COLORS: { key: InkColorKey; css: string }[] = [
  { key: "RED", css: "#ff4d5a" },
  { key: "BLUE", css: "#4aa3ff" },
  { key: "GREEN", css: "#3ddc84" },
  { key: "YELLOW", css: "#ffd24a" },
];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
