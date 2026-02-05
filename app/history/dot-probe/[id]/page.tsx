// Энэ файлыг өмнөх /app/history/[id]/page.tsx дээрх Dot-Probe дэлгэрэнгүйгээс шууд хуулж тавина.
// Импорт зам нь 1 түвшин нэмэгдсэн тул зөв болгосон хувилбар доор байна.

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "../../../../styles/Page.module.css";
import sheet from "../../../../styles/AttemptSheet.module.css";
import type { Attempt, TrialResult } from "../../../../lib/types";
import { loadHistory } from "../../../../lib/storage";

// ... (хуучин чинь байсан helper-үүд яг хэвээр)

function sideLabel(s?: "left" | "right") {
  if (!s) return "-";
  return s === "left" ? "Left" : "Right";
}

function dotPositionFromPhase(phase: TrialResult["phase"]) {
  return phase === "threat" ? "Emotional" : "Neutral";
}

function fmtSeconds(rtMs: number) {
  return (rtMs / 1000).toFixed(6).replace(".", ",");
}

function csvEscape(value: string) {
  const v = value.replace(/"/g, '""');
  return `"${v}"`;
}

function buildCsv(attempt: Attempt) {
  const headers = [
    "ConditionID",
    "Round",
    "EmotionalWord",
    "NeutralWord",
    "EmotionCategory",
    "DotPosition",
    "EmotionalWordSide",
    "CorrectResponse",
    "TimeOut",
    "ResponseTime",
  ];

  const rows = attempt.results.map((r, i) => [
    attempt.id.slice(0, 6),
    String(i + 1),
    r.threatWord ?? "",
    r.neutralWord ?? "",
    "Threat",
    dotPositionFromPhase(r.phase),
    sideLabel(r.threatSide),
    String(r.correct),
    "False",
    fmtSeconds(r.rtMs),
  ]);

  const lines = [
    headers.map(csvEscape).join(","),
    ...rows.map((r) => r.map(csvEscape).join(",")),
  ];

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

export default function DotProbeAttemptDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const attempt = useMemo<Attempt | null>(() => {
    const h = loadHistory();
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

  const fileName = `dotprobe_${attempt.createdAtIso.replace(/[:.]/g, "-")}_${attempt.id.slice(0, 6)}.csv`;

  return (
    <main className={styles.page}>
      <div className={sheet.head}>
        <div>
          <h1 className={styles.h1} style={{ marginBottom: 6 }}>Dot-Probe Attempt</h1>
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
              <th>ConditionID</th>
              <th>Round</th>
              <th>EmotionalWord</th>
              <th>NeutralWord</th>
              <th>EmotionCategory</th>
              <th>DotPosition</th>
              <th>EmotionalWordSide</th>
              <th>CorrectResponse</th>
              <th>TimeOut</th>
              <th>ResponseTime</th>
            </tr>
          </thead>
          <tbody>
            {attempt.results.map((r, i) => (
              <tr key={r.trialId + "_" + i}>
                <td>{attempt.id.slice(0, 6)}</td>
                <td>{i + 1}</td>
                <td className={sheet.word}>{r.threatWord}</td>
                <td className={sheet.word}>{r.neutralWord}</td>
                <td>Threat</td>
                <td>{dotPositionFromPhase(r.phase)}</td>
                <td>{sideLabel(r.threatSide)}</td>
                <td className={r.correct ? sheet.true : sheet.false}>{String(r.correct)}</td>
                <td>False</td>
                <td className={sheet.num}>{fmtSeconds(r.rtMs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
