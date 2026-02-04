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
  // зураг дээр "DotPosition" = Emotional / Neutral маягаар харагдаж байгаа
  return phase === "threat" ? "Emotional" : "Neutral";
}

function emotionCategory() {
  // бидний хувьд EmotionalWord = Threat word гэж үзнэ
  return "Threat";
}

function fmtSeconds(rtMs: number) {
  // зураг шиг секунд, таслалаар
  const s = (rtMs / 1000);
  return s.toFixed(6).replace(".", ",");
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
        <Link className={sheet.back} href="/history">← Түүх рүү буцах</Link>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={sheet.head}>
        <div>
          <h1 className={styles.h1} style={{ marginBottom: 6 }}>Attempt дэлгэрэнгүй</h1>
          <p className={styles.p} style={{ marginBottom: 0 }}>
            {new Date(attempt.createdAtIso).toLocaleString()} • ID: {attempt.id}
          </p>
        </div>

        <Link className={sheet.back} href="/history">← Түүх рүү буцах</Link>
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
                <td>{emotionCategory()}</td>
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
        * Хуучин хадгалсан түүхүүд дээр “EmotionalWordSide” `-` гэж гарч болно (өмнө нь хадгалагдаагүй байсан).
      </p>
    </main>
  );
}
