import type { StroopAttempt } from "./stroopTypes";

const KEY = "mk_stroop_history_v1";

function safeParse(json: string | null): StroopAttempt[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    if (!Array.isArray(v)) return [];
    return v as StroopAttempt[];
  } catch {
    return [];
  }
}

export function loadStroopHistory(): StroopAttempt[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(KEY));
}

export function saveStroopAttempt(attempt: StroopAttempt) {
  if (typeof window === "undefined") return;
  const h = loadStroopHistory();
  const next = [attempt, ...h];
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function clearStroopHistory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
