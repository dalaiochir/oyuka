"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../../styles/Page.module.css";
import table from "../../styles/History.module.css";
import type { Attempt } from "../../lib/types";
import { loadHistory } from "../../lib/storage";
import { formatMs, pickBestAttempt } from "../../lib/scoring";

export default function ResultPage() {
  const [attempt, setAttempt] = useState<Attempt | null>(null);

  useEffect(() => {
    // history-ийн хамгийн сүүлийн (шинээр хадгалагдсан) оролдлогыг шууд харуулна
    const h = loadHistory();
    setAttempt(h[0] ?? null);
  }, []);

  const best = useMemo(() => {
    const h = loadHistory();
    return pickBestAttempt(h);
  }, []);

  const delta = useMemo(() => {
    if (!attempt || !best) return null;
    if (best.id === attempt.id) return null;

    return {
      accuracyDelta: attempt.accuracyPct - best.accuracyPct,
      timeDeltaMs: attempt.totalMs - best.totalMs,
      absDeltaMs: attempt.absMs - best.absMs,
    };
  }, [attempt, best]);

  if (!attempt) {
    return (
      <main className={styles.page}>
        <h1 className={styles.h1}>Үр дүн</h1>
        <p className={styles.p}>Одоогоор үр дүн олдсонгүй. Эхлээд тест ажиллуулна уу.</p>
      </main>
    );
  }
// test
  return (
    <main className={styles.page}>
      <h1 className={styles.h1}>Үр дүн</h1>
      <p className={styles.p}>
        Таны хамгийн сүүлийн тестийн үр дүн. “Түүх” хэсэгт бүх оролдлогууд хадгалагдана.
      </p>

      <div className={table.compare}>
        <div className={table.card}>
          <div className={table.cardTitle}>Сүүлийн үр дүн</div>
          <div className={table.kv}>
            <span>Хугацаа</span>
            <b>{formatMs(attempt.totalMs)}</b>
          </div>
          <div className={table.kv}>
            <span>Зөв %</span>
            <b>{attempt.accuracyPct}%</b>
          </div>
          <div className={table.kv}>
            <span>Threat mean RT</span>
            <b>{Math.round(attempt.threat.meanRtMs)}ms</b>
          </div>
          <div className={table.kv}>
            <span>Neutral mean RT</span>
            <b>{Math.round(attempt.neutral.meanRtMs)}ms</b>
          </div>
          <div className={table.kv}>
            <span>ABS (T − N)</span>
            <b>{Math.round(attempt.absMs)}ms</b>
          </div>
        </div>

        {best && (
          <div className={table.card}>
            <div className={table.cardTitle}>Best үр дүн</div>
            <div className={table.kv}>
              <span>Хугацаа</span>
              <b>{formatMs(best.totalMs)}</b>
            </div>
            <div className={table.kv}>
              <span>Зөв %</span>
              <b>{best.accuracyPct}%</b>
            </div>
            <div className={table.kv}>
              <span>Threat mean RT</span>
              <b>{Math.round(best.threat.meanRtMs)}ms</b>
            </div>
            <div className={table.kv}>
              <span>Neutral mean RT</span>
              <b>{Math.round(best.neutral.meanRtMs)}ms</b>
            </div>
            <div className={table.kv}>
              <span>ABS (T − N)</span>
              <b>{Math.round(best.absMs)}ms</b>
            </div>

            {delta && (
              <>
                <div className={table.kv}>
                  <span>Accuracy Δ</span>
                  <b>{delta.accuracyDelta > 0 ? "+" : ""}{delta.accuracyDelta.toFixed(1)}%</b>
                </div>
                <div className={table.kv}>
                  <span>Time Δ</span>
                  <b>{delta.timeDeltaMs > 0 ? "+" : ""}{Math.round(delta.timeDeltaMs)}ms</b>
                </div>
                <div className={table.kv}>
                  <span>ABS Δ</span>
                  <b>{delta.absDeltaMs > 0 ? "+" : ""}{Math.round(delta.absDeltaMs)}ms</b>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <a className={table.danger} style={{ textDecoration: "none", display: "inline-block" }} href="/history">
          Түүх рүү очих
        </a>
      </div>
    </main>
  );
}
