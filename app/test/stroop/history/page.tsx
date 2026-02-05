"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "../../../../styles/Page.module.css";
import table from "../../../../styles/History.module.css";
import type { StroopAttempt } from "../../../../lib/stroopTypes";
import { clearStroopHistory, loadStroopHistory } from "../../../../lib/stroopStorage";

function formatMs(ms: number) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export default function StroopHistoryPage() {
  const [v, setV] = useState(0);
  const history = useMemo<StroopAttempt[]>(() => loadStroopHistory(), [v]);

  return (
    <main className={styles.page}>
      <h1 className={styles.h1}>Stroop Түүх</h1>

      <div className={table.actions}>
        <button
          className={table.danger}
          onClick={() => {
            clearStroopHistory();
            setV((x) => x + 1);
          }}
        >
          Түүх устгах
        </button>

        <Link href="/test/stroop" style={{ color: "#fff", textDecoration: "underline", fontWeight: 800 }}>
          Stroop тест рүү
        </Link>
      </div>

      {history.length === 0 ? (
        <p className={styles.p}>Одоогоор түүх хоосон байна.</p>
      ) : (
        <div className={table.tableWrap}>
          <table className={table.t}>
            <thead>
              <tr>
                <th>Огноо</th>
                <th>Хугацаа</th>
                <th>Зөв %</th>
                <th>C RT</th>
                <th>I RT</th>
                <th>N RT</th>
                <th>I−C</th>
                <th>Дэлгэрэнгүй</th>
              </tr>
            </thead>
            <tbody>
              {history.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.createdAtIso).toLocaleString()}</td>
                  <td>{formatMs(a.totalMs)}</td>
                  <td>{a.accuracyPct}%</td>
                  <td>{a.congruent.meanRtMs}ms</td>
                  <td>{a.incongruent.meanRtMs}ms</td>
                  <td>{a.neutral.meanRtMs}ms</td>
                  <td>{a.interferenceMs}ms</td>
                  <td>
                    <Link href={`/test/stroop/history/${a.id}`} style={{ color: "#fff", textDecoration: "underline" }}>
                      Харах
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
