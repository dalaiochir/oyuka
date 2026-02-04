"use client";

import { useEffect, useMemo, useState } from "react";
import { Attempt } from "../../lib/types";
import { clearHistory, loadHistory } from "../../lib/storage";
import { formatMs, pickBestAttempt } from "../../lib/scoring";
import styles from "../../styles/History.module.css";

export default function HistoryPage() {
  const [history, setHistory] = useState<Attempt[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const best = useMemo(() => pickBestAttempt(history), [history]);

  const onClear = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <div className="card">
      <div className={styles.top}>
        <h1>Түүх</h1>
        <button className="btn" onClick={onClear} disabled={!history.length}>
          Түүх цэвэрлэх
        </button>
      </div>

      {!history.length ? (
        <p>Одоогоор түүх байхгүй. Тест өгөөд үзээрэй.</p>
      ) : (
        <div className={styles.list}>
          {history.map((a) => {
            const isBest = best?.id === a.id;
            return (
              <div key={a.id} className={`${styles.item} ${isBest ? styles.best : ""}`}>
                <div className={styles.row1}>
                  <div className={styles.date}>
                    {new Date(a.createdAt).toLocaleString("mn-MN")}
                  </div>
                  {isBest && <span className={styles.badge}>ШИЛДЭГ</span>}
                </div>

                <div className={styles.metrics}>
                  <span><b>Хугацаа:</b> {formatMs(a.totalMs)}</span>
                  <span><b>Нийт:</b> {a.overall.correct}/{a.overall.total} ({a.overall.accuracyPct}%)</span>
                  <span><b>Threat:</b> {a.threat.correct}/{a.threat.total}</span>
                  <span><b>Neutral:</b> {a.neutral.correct}/{a.neutral.total}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
