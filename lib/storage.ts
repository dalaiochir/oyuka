import { Attempt } from "./types";

const KEY = "mk_test_history_v1";

export function loadHistory(): Attempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}

export function saveAttempt(attempt: Attempt) {
  const prev = loadHistory();
  const next = [attempt, ...prev];
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}
