"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "../../../../styles/Page.module.css";
import sheet from "../../../../styles/AttemptSheet.module.css";
import type { StroopAttempt } from "../../../../lib/stroopTypes";
import { loadStroopHistory } from "../../../../lib/stroopStorage";

function csvEscape(value: string) {
  const v = value.replace(/"/g, '""');
  return `"${v}"`;
}

function buildCsv(attempt: StroopAttempt) {
  const headers = ["AttemptID","Round","Condition","Word","Ink","CorrectInk","CorrectResponse","ResponseTimeMs"];
  const rows = attempt.results.map((r, i) => [
    attempt.id,
    String(i + 1),
    r.condition,
    r.word,
    r.ink,
    r.correctInk,
    String(r.correct),
    String(r.rtMs),
  ]);

  const lines = [headers.map(csvEscape).join(","), ...rows.map((r) => r.map(csvEscape).join(","))];
  return "\uFEFF" + lines.join("\n");
}

function downloadCsv(filename: string, csvText: string) {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function StroopAttemptDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const attempt = useMemo<StroopAttempt | null>(() => {
    const h = loadStroopHistory();
    return h.find((a) => a.id === id) ?? null;
  }, [id]);

  if (!attempt) {
    return (
      <main className={styles.page}>
        <h1 className={styles.h1}>Оролдлого олдсонгүй</h1>
        <Link className={sheet.back} href="/history">← Түүх рүү буцах</Link>
      </main>
    );
  }

  const fileName = `stroop_${attempt.createdAtIso.replace(/[:.]/g, "-")}_${attempt.id.slice(0, 6)}.csv`;

  return (
    <main className={styles.page}>
      <div className={sheet.head}>
        <div>
          <h1 className={styles.h1} style={{ marginBottom: 6 }}>Stroop Attempt</h1>
          <p className={styles.p} style={{ marginBottom: 0 }}>
            {new Date(attempt.createdAtIso).toLocaleString()} • ID: {attempt.id}
          </p>
        </div>

        <div className={sheet.actions}>
          <button className={sheet.csvBtn} onClick={() => downloadCsv(fileName, buildCsv(attempt))}>
            CSV татах
          </button>
          <Link className={sheet.back} href="/history">← Түүх рүү буцах</Link>
        </div>
      </div>

      <div className={sheet.wrap}>
        <table className={sheet.t}>
          <thead>
            <tr>
              <th>Round</th>
              <th>Condition</th>
              <th>Word</th>
              <th>Ink</th>
              <th>CorrectInk</th>
              <th>CorrectResponse</th>
              <th>ResponseTime (ms)</th>
            </tr>
          </thead>
          <tbody>
            {attempt.results.map((r, i) => (
              <tr key={r.trialId + "_" + i}>
                <td>{i + 1}</td>
                <td>{r.condition}</td>
                <td className={sheet.word}>{r.word}</td>
                <td>{r.ink}</td>
                <td>{r.correctInk}</td>
                <td className={r.correct ? sheet.true : sheet.false}>{String(r.correct)}</td>
                <td className={sheet.num}>{r.rtMs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
