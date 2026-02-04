"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Attempt } from "../../lib/types";
import { loadHistory, saveAttempt } from "../../lib/storage";
import { formatMs, pickBestAttempt } from "../../lib/scoring";

export default function ResultPage() {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [history, setHistory] = useState<Attempt[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem("mk_last_attempt_v1");
    if (!raw) return;
    const a = JSON.parse(raw) as Attempt;

    // save once: if same id already in history, skip
    const prev = loadHistory();
    const exists = prev.some((x) => x.id === a.id);
    if (!exists) saveAttempt(a);

    setAttempt(a);
    setHistory(loadHistory());
  }, []);

  const best = useMemo(() => pickBestAttempt(history), [history]);

  if (!attempt) {
    return (
      <div className="card">
        <h1>Дүн олдсонгүй</h1>
        <p>Тестийг эхлүүлээд дуусгасны дараа энд дүн гарна.</p>
        <Link className="btn primary" href="/test">Тест эхлүүлэх</Link>
      </div>
    );
  }

  const compare =
    best && best.id !== attempt.id
      ? {
          accuracyDelta: attempt.overall.accuracyPct - best.overall.accuracyPct,
          timeDeltaMs: attempt.totalMs - best.totalMs,
        }
      : null;

  return (
    <div className="card">
      <h1>Тестийн дүн</h1>

      <div className="grid2">
        <div className="panel">
          <h2>Одоогийн оролдлого</h2>
          <p><b>Нийт хугацаа:</b> {formatMs(attempt.totalMs)}</p>
          <p><b>Нийт зөв:</b> {attempt.overall.correct}/{attempt.overall.total} ({attempt.overall.accuracyPct}%)</p>
          <p><b>Threat:</b> {attempt.threat.correct}/{attempt.threat.total}</p>
          <p><b>Neutral:</b> {attempt.neutral.correct}/{attempt.neutral.total}</p>
        </div>

        <div className="panel">
          <h2>Харьцуулалт (Шилдэг)</h2>
          {!best ? (
            <p>Одоогоор шилдэг үр дүн байхгүй.</p>
          ) : (
            <>
              <p><b>Шилдэг хугацаа:</b> {formatMs(best.totalMs)}</p>
              <p><b>Шилдэг хувь:</b> {best.overall.accuracyPct}%</p>

              {compare ? (
                <>
                  <p>
                    <b>Accuracy өөрчлөлт:</b>{" "}
                    {compare.accuracyDelta >= 0 ? `+${compare.accuracyDelta}%` : `${compare.accuracyDelta}%`}
                  </p>
                  <p>
                    <b>Хугацааны өөрчлөлт:</b>{" "}
                    {compare.timeDeltaMs <= 0 ? `${formatMs(Math.abs(compare.timeDeltaMs))} хурдан` : `${formatMs(compare.timeDeltaMs)} удаан`}
                  </p>
                </>
              ) : (
                <p>Энэ оролдлого одоогоор шилдэг байна.</p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="row">
        <Link className="btn" href="/history">Түүх харах</Link>
        <Link className="btn primary" href="/test">Дахин өгөх</Link>
      </div>
    </div>
  );
}
