"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "../../styles/Page.module.css";
import table from "../../styles/History.module.css";
import { Attempt } from "../../lib/types";
import { clearHistory, loadHistory } from "../../lib/storage";
import { formatMs, pickBestAttempt } from "../../lib/scoring";

export default function HistoryPage() {
  const [version, setVersion] = useState(0);

  const attempts = useMemo<Attempt[]>(() => loadHistory(), [version]);
  const best = useMemo(() => pickBestAttempt(attempts), [attempts]);
  const latest = attempts[0] ?? null;

  return (
    <main className={styles.page}>
      <h1 className={styles.h1}>Түүх</h1>
      <p className={styles.p}>
        Оролдлого дээр дарж дэлгэрэнгүй (Excel шиг) trial хүснэгтээр харна.
      </p>

      {latest && best && (
        <div className={table.compare}>
          <div className={table.card}>
            <div className={table.cardTitle}>Сүүлийн үр дүн</div>
            <div className={table.kv}><span>Хугацаа</span><b>{formatMs(latest.totalMs)}</b></div>
            <div className={table.kv}><span>Зөв %</span><b>{latest.accuracyPct}%</b></div>
            <div className={table.kv}><span>Threat mean RT</span><b>{Math.round(latest.threat.meanRtMs)}ms</b></div>
            <div className={table.kv}><span>Neutral mean RT</span><b>{Math.round(latest.neutral.meanRtMs)}ms</b></div>
            <div className={table.kv}><span>ABS (T−N)</span><b>{Math.round(latest.absMs)}ms</b></div>
          </div>

          <div className={table.card}>
            <div className={table.cardTitle}>Best үр дүн</div>
            <div className={table.kv}><span>Хугацаа</span><b>{formatMs(best.totalMs)}</b></div>
            <div className={table.kv}><span>Зөв %</span><b>{best.accuracyPct}%</b></div>
            <div className={table.kv}><span>Threat mean RT</span><b>{Math.round(best.threat.meanRtMs)}ms</b></div>
            <div className={table.kv}><span>Neutral mean RT</span><b>{Math.round(best.neutral.meanRtMs)}ms</b></div>
            <div className={table.kv}><span>ABS (T−N)</span><b>{Math.round(best.absMs)}ms</b></div>
          </div>
        </div>
      )}

      <div className={table.actions}>
        <button
          className={table.danger}
          onClick={() => {
            clearHistory();
            setVersion((v) => v + 1);
          }}
        >
          Түүх устгах
        </button>
      </div>

      {attempts.length === 0 ? (
        <div className={styles.p}>Одоогоор түүх хоосон байна.</div>
      ) : (
        <div className={table.tableWrap}>
          <table className={table.t}>
            <thead>
              <tr>
                <th>Огноо</th>
                <th>Хугацаа</th>
                <th>Зөв %</th>
                <th>Threat RT</th>
                <th>Neutral RT</th>
                <th>ABS</th>
                <th>Дэлгэрэнгүй</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.createdAtIso).toLocaleString()}</td>
                  <td>{formatMs(a.totalMs)}</td>
                  <td>{a.accuracyPct}%</td>
                  <td>{Math.round(a.threat.meanRtMs)}ms</td>
                  <td>{Math.round(a.neutral.meanRtMs)}ms</td>
                  <td>{Math.round(a.absMs)}ms</td>
                  <td>
                    <Link href={`/history/${a.id}`} style={{ color: "#fff", textDecoration: "underline" }}>
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
