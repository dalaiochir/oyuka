"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "../../styles/Page.module.css";
import table from "../../styles/History.module.css";

import type { Attempt } from "../../lib/types";
import { loadHistory, clearHistory } from "../../lib/storage";
import { formatMs, pickBestAttempt } from "../../lib/scoring";

import type { StroopAttempt } from "../../lib/stroopTypes";
import { loadStroopHistory, clearStroopHistory } from "../../lib/stroopStorage";

type TestFilter = "all" | "dot" | "stroop";

type UnifiedRow =
  | {
      test: "dot";
      id: string;
      createdAtIso: string;
      totalMs: number;
      accuracyPct: number;
      keyMetricLabel: "ABS";
      keyMetricValue: number; // ms
      extra1Label: "Threat RT";
      extra1Value: number; // ms
      extra2Label: "Neutral RT";
      extra2Value: number; // ms
      detailsHref: string;
    }
  | {
      test: "stroop";
      id: string;
      createdAtIso: string;
      totalMs: number;
      accuracyPct: number;
      keyMetricLabel: "I−C";
      keyMetricValue: number; // ms (interference)
      extra1Label: "C RT";
      extra1Value: number; // ms
      extra2Label: "I RT";
      extra2Value: number; // ms
      detailsHref: string;
    };

function fmtStroopTime(ms: number) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function pickBestStroop(history: StroopAttempt[]) {
  if (history.length === 0) return null;
  return [...history].sort((a, b) => {
    // 1) accuracy өндөр
    if (b.accuracyPct !== a.accuracyPct) return b.accuracyPct - a.accuracyPct;
    // 2) interference бага (I−C)
    if (a.interferenceMs !== b.interferenceMs) return a.interferenceMs - b.interferenceMs;
    // 3) total time бага
    return a.totalMs - b.totalMs;
  })[0];
}

export default function HistoryPage() {
  const [filter, setFilter] = useState<TestFilter>("all");
  const [dotHistory, setDotHistory] = useState<Attempt[]>([]);
  const [stroopHistory, setStroopHistory] = useState<StroopAttempt[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setDotHistory(loadHistory());
    setStroopHistory(loadStroopHistory());
  }, [refreshKey]);

  const bestDot = useMemo(() => pickBestAttempt(dotHistory), [dotHistory]);
  const bestStroop = useMemo(() => pickBestStroop(stroopHistory), [stroopHistory]);

  const rows = useMemo<UnifiedRow[]>(() => {
    const dotRows: UnifiedRow[] = dotHistory.map((a) => ({
      test: "dot",
      id: a.id,
      createdAtIso: a.createdAtIso,
      totalMs: a.totalMs,
      accuracyPct: a.accuracyPct,
      keyMetricLabel: "ABS",
      keyMetricValue: Math.round(a.absMs),
      extra1Label: "Threat RT",
      extra1Value: Math.round(a.threat.meanRtMs),
      extra2Label: "Neutral RT",
      extra2Value: Math.round(a.neutral.meanRtMs),
      detailsHref: `/history/dot-probe/${a.id}`,
    }));

    const stroopRows: UnifiedRow[] = stroopHistory.map((a) => ({
      test: "stroop",
      id: a.id,
      createdAtIso: a.createdAtIso,
      totalMs: a.totalMs,
      accuracyPct: a.accuracyPct,
      keyMetricLabel: "I−C",
      keyMetricValue: a.interferenceMs,
      extra1Label: "C RT",
      extra1Value: a.congruent.meanRtMs,
      extra2Label: "I RT",
      extra2Value: a.incongruent.meanRtMs,
      detailsHref: `/history/stroop/${a.id}`,
    }));

    const all = [...dotRows, ...stroopRows];
    all.sort((a, b) => (a.createdAtIso < b.createdAtIso ? 1 : -1)); // newest first
    return all;
  }, [dotHistory, stroopHistory]);

  const filteredRows = useMemo(() => {
    if (filter === "all") return rows;
    if (filter === "dot") return rows.filter((r) => r.test === "dot");
    return rows.filter((r) => r.test === "stroop");
  }, [rows, filter]);

  const dotBestId = bestDot?.id ?? null;
  const stroopBestId = bestStroop?.id ?? null;

  return (
    <main className={styles.page}>
      <h1 className={styles.h1}>Түүх</h1>
      <p className={styles.p}>
        Хоёр тестийн түүх нэг хүснэгтэд байна. “Test” filter-ээр ялгаж харна.
      </p>

      {/* Filter bar */}
      <div className={table.actions}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ fontWeight: 900, opacity: 0.9 }}>Test:</label>
          <select
            className={table.select}
            value={filter}
            onChange={(e) => setFilter(e.target.value as TestFilter)}
          >
            <option value="all">All</option>
            <option value="dot">Dot-Probe Test</option>
            <option value="stroop">Emotional Stroop Test</option>
          </select>

          <button
            className={table.danger}
            onClick={() => {
              // filter == all үед хоёуланг устгах
              if (filter === "all") {
                clearHistory();
                clearStroopHistory();
              } else if (filter === "dot") {
                clearHistory();
              } else {
                clearStroopHistory();
              }
              setRefreshKey((x) => x + 1);
            }}
          >
            {filter === "all" ? "Бүх түүх устгах" : filter === "dot" ? "Dot-Probe түүх устгах" : "Stroop түүх устгах"}
          </button>
        </div>

        <Link href="/test" style={{ color: "#fff", textDecoration: "underline", fontWeight: 800 }}>
          Тестүүд рүү
        </Link>
      </div>

      {/* Best cards */}
      <div className={table.compare} style={{ marginTop: 14 }}>
        <div className={table.card}>
          <div className={table.cardTitle}>Dot-Probe Best</div>
          {bestDot ? (
            <>
              <div className={table.kv}><span>Хугацаа</span><b>{formatMs(bestDot.totalMs)}</b></div>
              <div className={table.kv}><span>Зөв %</span><b>{bestDot.accuracyPct}%</b></div>
              <div className={table.kv}><span>ABS</span><b>{Math.round(bestDot.absMs)}ms</b></div>
              <div style={{ marginTop: 10 }}>
                <Link className={table.linkLike} href={`/history/dot-probe/${bestDot.id}`}>Дэлгэрэнгүй</Link>
              </div>
            </>
          ) : (
            <p className={styles.p} style={{ marginBottom: 0 }}>Одоогоор байхгүй</p>
          )}
        </div>

        <div className={table.card}>
          <div className={table.cardTitle}>Stroop Best</div>
          {bestStroop ? (
            <>
              <div className={table.kv}><span>Хугацаа</span><b>{fmtStroopTime(bestStroop.totalMs)}</b></div>
              <div className={table.kv}><span>Зөв %</span><b>{bestStroop.accuracyPct}%</b></div>
              <div className={table.kv}><span>I−C</span><b>{bestStroop.interferenceMs}ms</b></div>
              <p className={styles.p} style={{ marginTop: 10, marginBottom: 0, opacity: 0.85 }}>
                * Best шалгуур: accuracy өндөр → I−C бага → хугацаа бага
              </p>
              <div style={{ marginTop: 10 }}>
                <Link className={table.linkLike} href={`/history/stroop/${bestStroop.id}`}>Дэлгэрэнгүй</Link>
              </div>
            </>
          ) : (
            <p className={styles.p} style={{ marginBottom: 0 }}>Одоогоор байхгүй</p>
          )}
        </div>
      </div>

      {/* Unified table */}
      {filteredRows.length === 0 ? (
        <p className={styles.p} style={{ marginTop: 14 }}>Түүх хоосон байна.</p>
      ) : (
        <div className={table.tableWrap} style={{ marginTop: 14 }}>
          <table className={table.t}>
            <thead>
              <tr>
                <th>Test</th>
                <th>Best</th>
                <th>Огноо</th>
                <th>Хугацаа</th>
                <th>Зөв %</th>
                <th>Key</th>
                <th>Extra 1</th>
                <th>Extra 2</th>
                <th>Дэлгэрэнгүй</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((r) => {
                const isBest =
                  (r.test === "dot" && dotBestId === r.id) ||
                  (r.test === "stroop" && stroopBestId === r.id);

                return (
                  <tr key={`${r.test}_${r.id}`}>
                    <td>
                      <span className={r.test === "dot" ? table.badgeDot : table.badgeStroop}>
                        {r.test === "dot" ? "Dot-Probe" : "Stroop"}
                      </span>
                    </td>

                    <td>{isBest ? <span className={table.bestStar}>★</span> : ""}</td>

                    <td>{new Date(r.createdAtIso).toLocaleString()}</td>

                    <td>{r.test === "dot" ? formatMs(r.totalMs) : fmtStroopTime(r.totalMs)}</td>

                    <td>{r.accuracyPct}%</td>

                    <td>
                      <b>{r.keyMetricLabel}</b>: {r.keyMetricValue}ms
                    </td>

                    <td>
                      <b>{r.extra1Label}</b>: {r.extra1Value}ms
                    </td>

                    <td>
                      <b>{r.extra2Label}</b>: {r.extra2Value}ms
                    </td>

                    <td>
                      <Link href={r.detailsHref} style={{ color: "#fff", textDecoration: "underline" }}>
                        Харах
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
