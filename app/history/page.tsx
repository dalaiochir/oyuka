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
type SortKey = "date" | "accuracy" | "key";
type SortDir = "desc" | "asc";

type UnifiedRow =
  | {
      test: "dot";
      id: string;
      createdAtIso: string;
      totalMs: number;
      accuracyPct: number;
      keyMetricLabel: "ABS";
      keyMetricValue: number; // ms
      detailsHref: string;
    }
  | {
      test: "stroop";
      id: string;
      createdAtIso: string;
      totalMs: number;
      accuracyPct: number;
      keyMetricLabel: "I−C";
      keyMetricValue: number; // ms
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
    // Best: accuracy өндөр -> I−C бага -> time бага
    if (b.accuracyPct !== a.accuracyPct) return b.accuracyPct - a.accuracyPct;
    if (a.interferenceMs !== b.interferenceMs) return a.interferenceMs - b.interferenceMs;
    return a.totalMs - b.totalMs;
  })[0];
}

function toEpochMs(iso: string) {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

export default function HistoryPage() {
  const [filter, setFilter] = useState<TestFilter>("all");
  const [bestOnly, setBestOnly] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

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
      detailsHref: `/history/stroop/${a.id}`,
    }));

    return [...dotRows, ...stroopRows];
  }, [dotHistory, stroopHistory]);

  const dotBestId = bestDot?.id ?? null;
  const stroopBestId = bestStroop?.id ?? null;

  const filteredSortedRows = useMemo(() => {
    // 1) test filter
    let r = rows;
    if (filter === "dot") r = r.filter((x) => x.test === "dot");
    if (filter === "stroop") r = r.filter((x) => x.test === "stroop");

    // 2) best only filter (★)
    if (bestOnly) {
      r = r.filter((x) => {
        if (x.test === "dot") return dotBestId === x.id;
        return stroopBestId === x.id;
      });
    }

    // 3) sort
    const dir = sortDir === "asc" ? 1 : -1;

    const sorted = [...r].sort((a, b) => {
      if (sortKey === "date") {
        return (toEpochMs(a.createdAtIso) - toEpochMs(b.createdAtIso)) * dir;
      }
      if (sortKey === "accuracy") {
        return (a.accuracyPct - b.accuracyPct) * dir;
      }
      // sortKey === "key"
      // Dot-Probe: ABS бага байх тусам сайн гэж үзье (огцом bias бага)
      // Stroop: I−C бага байх тусам сайн
      // Тиймээс "key" дээр default-оор багаг нь сайн гэж бодоод:
      // asc = good first, desc = bad first
      const ka = a.keyMetricValue;
      const kb = b.keyMetricValue;
      return (ka - kb) * dir;
    });

    return sorted;
  }, [rows, filter, bestOnly, sortKey, sortDir, dotBestId, stroopBestId]);

  function clearByFilter() {
    if (filter === "all") {
      clearHistory();
      clearStroopHistory();
    } else if (filter === "dot") {
      clearHistory();
    } else {
      clearStroopHistory();
    }
    setRefreshKey((x) => x + 1);
  }

  function toggleSort(nextKey: SortKey) {
    if (sortKey !== nextKey) {
      setSortKey(nextKey);
      setSortDir("desc"); // шинэ key сонгоход default desc
      return;
    }
    setSortDir((d) => (d === "desc" ? "asc" : "desc"));
  }

  const sortArrow = (k: SortKey) => {
    if (sortKey !== k) return "";
    return sortDir === "desc" ? " ↓" : " ↑";
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.h1}>Түүх</h1>
      <p className={styles.p}>
        Хоёр тестийн түүх нэг хүснэгтэд байна. Filter + Sort ашиглаарай.
      </p>

      {/* Filters */}
      <div className={table.actions}>
        <div className={table.filterRow}>
          <div className={table.filterGroup}>
            <span className={table.filterLabel}>Test:</span>
            <select
              className={table.select}
              value={filter}
              onChange={(e) => setFilter(e.target.value as TestFilter)}
            >
              <option value="all">All</option>
              <option value="dot">Dot-Probe Test</option>
              <option value="stroop">Emotional Stroop Test</option>
            </select>
          </div>

          <label className={table.checkboxRow}>
            <input
              type="checkbox"
              checked={bestOnly}
              onChange={(e) => setBestOnly(e.target.checked)}
            />
            <span>Best only (★)</span>
          </label>

          <button className={table.danger} onClick={clearByFilter}>
            {filter === "all"
              ? "Бүх түүх устгах"
              : filter === "dot"
              ? "Dot-Probe түүх устгах"
              : "Stroop түүх устгах"}
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
                * Best: accuracy өндөр → I−C бага → хугацаа бага
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

      {/* Table */}
      {filteredSortedRows.length === 0 ? (
        <p className={styles.p} style={{ marginTop: 14 }}>Түүх хоосон байна.</p>
      ) : (
        <div className={table.tableWrap} style={{ marginTop: 14 }}>
          <table className={table.t}>
            <thead>
              <tr>
                <th>Test</th>
                <th>Best</th>

                <th className={table.sortTh}>
                  <button className={table.sortBtn} onClick={() => toggleSort("date")}>
                    Date{sortArrow("date")}
                  </button>
                </th>

                <th>Time</th>

                <th className={table.sortTh}>
                  <button className={table.sortBtn} onClick={() => toggleSort("accuracy")}>
                    Accuracy{sortArrow("accuracy")}
                  </button>
                </th>

                <th className={table.sortTh}>
                  <button className={table.sortBtn} onClick={() => toggleSort("key")}>
                    Key metric{sortArrow("key")}
                  </button>
                </th>

                <th>Дэлгэрэнгүй</th>
              </tr>
            </thead>

            <tbody>
              {filteredSortedRows.map((r) => {
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
                      <Link href={r.detailsHref} style={{ color: "#fff", textDecoration: "underline" }}>
                        Харах
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className={table.sortHint}>
            Sort: Date / Accuracy / Key metric дээр дарж эрэмбэлнэ (дахин дарвал ↑↓ солино).
          </div>
        </div>
      )}
    </main>
  );
}
