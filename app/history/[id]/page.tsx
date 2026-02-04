"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "../../../styles/Page.module.css";
import sheet from "../../../styles/AttemptSheet.module.css";
import type { Attempt, TrialResult } from "../../../lib/types";
import { loadHistory } from "../../../lib/storage";

function sideLabel(s?: "left" | "right") {
  if (!s) return "-";
  return s === "left" ? "Left" : "Right";
}

function dotPositionFromPhase(phase: TrialResult["phase"]) {
  // зураг дээр "DotPosition" = Emotional / Neutral
  return phase === "threat" ? "Emotional" : "Neutral";
}

function emotionCategory() {
  return "Threat";
}

function fmtSeconds(rtMs: number) {
  // секунд, таслалаар (png дээр шиг)
  return (rtMs / 1000).toFixed(6).replace(".", ",");
}

function csvEscape(value: string) {
  // CSV стандарт: " доторх " => ""
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

  const rows = attempt.results.map((r, i) => {
    const conditionId = attempt.id.slice(0, 6);
    const round = String(i + 1);
    const emotionalWord = r.threatWord ?? "";
    const neutralWord = r.neutralWord ?? "";
    const emotionCat = emotionCategory();
    const dotPos = dotPositionFromPhase(r.phase);
    const emotionalSide = sideLabel(r.threatSide);
    const correctResponse = String(r.correct);
    const timeOut = "False";
    const responseTime = fmtSeconds(r.rtMs);

    return [
      conditionId,
      round,
      emotionalWord,
      neutralWord,
      emotionCat,
      dotPos,
      emotionalSide,
      correctResponse,
      timeOut,
      responseTime,
    ];
  });

  // delimiter = comma. (Excel-д Монгол locale дээр separator өөр байж болно, гэхдээ стандарт нь comma)
  // Хэрвээ Excel дээр шууд зөв задрахгүй байвал хэлээрэй — “;” болгож өгч болно.
  const lines = [
    headers.map(csvEscape).join(","),
    ...rows.map((r) => r.map(csvEscape).join(",")),
  ];

  // BOM нэмбэл Excel UTF-8-г зөв уншина
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

export default function AttemptDetailPage() {
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
        <p className={styles.p}>Түүх устсан эсвэл ID буруу байж магадгүй.</p>
        <Link className={sheet.back} href="/history">
          ← Түүх рүү буцах
        </Link>
      </main>
    );
  }

  const fileName = `attempt_${attempt.createdAtIso.replace(/[:.]/g, "-")}_${attempt.id.slice(0, 6)}.csv`;

  return (
    <main className={styles.page}>
      <div className={sheet.head}>
        <div>
          <h1 className={styles.h1} style={{ marginBottom: 6 }}>
            Attempt дэлгэрэнгүй
          </h1>
          <p className={styles.p} style={{ marginBottom: 0 }}>
            {new Date(attempt.createdAtIso).toLocaleString()} • ID: {attempt.id}
          </p>
        </div>

        <div className={sheet.actions}>
          <button
            className={sheet.csvBtn}
            onClick={() => {
              const csv = buildCsv(attempt);
              downloadCsv(fileName, csv);
            }}
          >
            CSV татах
          </button>

          <Link className={sheet.back} href="/history">
            ← Түүх рүү буцах
          </Link>
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

      <p className={styles.p} style={{ marginTop: 10, opacity: 0.85 }}>
        * Excel дээр CSV задрах асуудал гарвал хэлээрэй — delimiter-ийг <b>;</b> болгож тааруулж өгнө.
      </p>
    </main>
  );
}
