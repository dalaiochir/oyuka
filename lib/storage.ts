import type { Attempt } from "./types";

const KEY = "mk_dot_probe_history_v1";

export function loadHistory(): Attempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Attempt[];
  } catch {
    return [];
  }
}

export function saveAttempt(attempt: Attempt): void {
  if (typeof window === "undefined") return;
  const prev = loadHistory();
  const next = [attempt, ...prev].slice(0, 50);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
