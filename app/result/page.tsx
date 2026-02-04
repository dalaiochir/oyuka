"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../../styles/Page.module.css";
import table from "../../styles/History.module.css";
import type { Attempt } from "../../lib/types";
import { loadHistory } from "../../lib/storage";
import { formatMs, pickBestAttempt } from "../../lib/scoring";

type Delta = {
  accuracyDelta: number; // percentage points
  timeDeltaMs: number;
  absDeltaMs: number;
};

export default function ResultPage() {
  const [history, setHistory] = useState<Attempt[]>([]);
  const [mounted, setMounted] = useState(false);

  // ✅ Client дээр mount болсны дараа л localStorage уншина
  useEffect(() => {
    setMounted(true);
    const h = loadHistory();
    setHistory(h);

    // Хэрвээ өөр tab-аас history шинэчлэгдсэн бол sync хийх
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      // storage.ts KEY: mk_dot_probe_history_v1 (дотор нь)
      // key нэр өөр байсан ч loadHistory нь safe тул шууд уншаад шинэчилж болно
      setHistory(loadHistory());
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const attempt = history[0] ?? null;

  const best = useMemo(() => {
    if (!history.length) return null;
    return pickBestAttempt(history);
  }, [history]);

  const delta: Delta | null = useMemo(() => {
    if (!attempt || !best) return null;
    if (best.id === attempt.id) return null;

    return {
      accuracyDelta: attempt.accuracyPct - best.accuracyPct,
      timeDeltaMs: attempt.totalMs - best.totalMs,
      absDeltaMs: attempt.absMs - best.absMs,
    };
  }, [attempt, best]);

  // ✅ SSR/эхний render дээр “flash” гарахаас сэргийлж mounted шалгалт
  if (!mounted) {
    return (
      <main className={styles.page}>
        <h1 className={styles.h1}>Үр дүн</h1>
        <p className={styles.p}>Уншиж байна...</p>
      </main>
    );
  }

  if (!attempt) {
    return (
      <main className={styles.page}>
        <h1 className={styles.h1}>Үр дүн</h1>
        <p className={styles.p}>Одоогоор үр дүн олдсонгүй. Эхлээд тест ажиллуулна уу.</p>
        <div style={{ marginTop: 16 }}>
          <a
            className={table.danger}
            style={{ textDecoration: "none", display: "inline-block" }}
            href="/test"
          >
            Тест эхлүүлэх
          </a>
        </div>
      </main>
    );
  }

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
            <div className={table.cardTitle}>
              Best үр дүн {best.id === attempt.id ? "(энэ оролдлого)" : ""}
            </div>

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
                  <b>
                    {delta.accuracyDelta > 0 ? "+" : ""}
                    {delta.accuracyDelta.toFixed(1)}%
                  </b>
                </div>

                <div className={table.kv}>
                  <span>Time Δ</span>
                  <b>
                    {delta.timeDeltaMs > 0 ? "+" : ""}
                    {Math.round(delta.timeDeltaMs)}ms
                  </b>
                </div>

                <div className={table.kv}>
                  <span>ABS Δ</span>
                  <b>
                    {delta.absDeltaMs > 0 ? "+" : ""}
                    {Math.round(delta.absDeltaMs)}ms
                  </b>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a
          className={table.danger}
          style={{ textDecoration: "none", display: "inline-block" }}
          href="/history"
        >
          Түүх рүү очих
        </a>

        <a
          className={table.danger}
          style={{ textDecoration: "none", display: "inline-block" }}
          href="/test"
        >
          Дахин тест хийх
        </a>
      </div>
    </main>
  );
}
