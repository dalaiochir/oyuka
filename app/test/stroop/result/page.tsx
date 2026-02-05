"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../../../../styles/Page.module.css";
import table from "../../../../styles/History.module.css";
import type { StroopAttempt } from "../../../../lib/stroopTypes";
import { loadStroopHistory } from "../../../../lib/stroopStorage";

function formatMs(ms: number) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function pickBest(history: StroopAttempt[]) {
  if (history.length === 0) return null;
  // best = өндөр accuracy, тэнцвэл бага totalMs
  return [...history].sort((a, b) => {
    if (b.accuracyPct !== a.accuracyPct) return b.accuracyPct - a.accuracyPct;
    return a.totalMs - b.totalMs;
  })[0];
}

export default function StroopResultPage() {
  const [attempt, setAttempt] = useState<StroopAttempt | null>(null);

  useEffect(() => {
    const h = loadStroopHistory();
    setAttempt(h[0] ?? null);
  }, []);

  const best = useMemo(() => {
    const h = loadStroopHistory();
    return pickBest(h);
  }, []);

  if (!attempt) {
    return (
      <main className={styles.page}>
        <h1 className={styles.h1}>Үр дүн</h1>
        <p className={styles.p}>Одоогоор үр дүн олдсонгүй. Эхлээд тест ажиллуулна уу.</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.h1}>Үр дүн (Stroop)</h1>

      <div className={table.compare}>
        <div className={table.card}>
          <div className={table.cardTitle}>Сүүлийн үр дүн</div>
          <div className={table.kv}><span>Хугацаа</span><b>{formatMs(attempt.totalMs)}</b></div>
          <div className={table.kv}><span>Зөв %</span><b>{attempt.accuracyPct}%</b></div>
          <div className={table.kv}><span>Congruent mean RT</span><b>{attempt.congruent.meanRtMs}ms</b></div>
          <div className={table.kv}><span>Incongruent mean RT</span><b>{attempt.incongruent.meanRtMs}ms</b></div>
          <div className={table.kv}><span>Neutral mean RT</span><b>{attempt.neutral.meanRtMs}ms</b></div>
          <div className={table.kv}><span>Interference (I−C)</span><b>{attempt.interferenceMs}ms</b></div>
        </div>

        {best && (
          <div className={table.card}>
            <div className={table.cardTitle}>Best үр дүн</div>
            <div className={table.kv}><span>Хугацаа</span><b>{formatMs(best.totalMs)}</b></div>
            <div className={table.kv}><span>Зөв %</span><b>{best.accuracyPct}%</b></div>
            <div className={table.kv}><span>Interference (I−C)</span><b>{best.interferenceMs}ms</b></div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <a className={table.danger} style={{ textDecoration: "none", display: "inline-block" }} href="/test/stroop/history">
          Stroop түүх
        </a>
      </div>
    </main>
  );
}
