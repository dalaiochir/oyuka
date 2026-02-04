"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TwoChoiceWordCard from "../../components/TwoChoiceWordCard";
import { buildTwoStageWordQuestions } from "../../lib/questionsFromWords";
import styles from "../../styles/Test.module.css";

type Stage = "threat" | "neutral";

export default function TestPage() {
  const router = useRouter();

  const stages = useMemo(() => {
    const { threatQuestions, neutralQuestions, pairCount } = buildTwoStageWordQuestions();

    return [
      {
        key: "threat" as Stage,
        title: `1-р үе шат: Занал үг (${pairCount} асуулт)`,
        questions: threatQuestions,
      },
      {
        key: "neutral" as Stage,
        title: `2-р үе шат: Энгийн үг (${pairCount} асуулт)`,
        questions: neutralQuestions,
      },
    ];
  }, []);

  const totalQuestions = useMemo(
    () => stages.reduce((acc, s) => acc + s.questions.length, 0),
    [stages]
  );

  const [stageIndex, setStageIndex] = useState(0);
  const [qIndex, setQIndex] = useState(0);

  const [threatCorrect, setThreatCorrect] = useState(0);
  const [neutralCorrect, setNeutralCorrect] = useState(0);

  const [selected, setSelected] = useState<"left" | "right" | null>(null);
  const [locked, setLocked] = useState(false);

  const [intermission, setIntermission] = useState<{ active: boolean; seconds: number }>({
    active: false,
    seconds: 0,
  });

  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const stage = stages[stageIndex];
  const q = stage?.questions?.[qIndex];

  const answeredCount =
    stages.slice(0, stageIndex).reduce((acc, s) => acc + s.questions.length, 0) + qIndex;

  useEffect(() => {
    if (!intermission.active) return;

    if (timerRef.current) window.clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      setIntermission((prev) => {
        const next = prev.seconds - 1;
        if (next <= 0) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          timerRef.current = null;

          setStageIndex((si) => Math.min(si + 1, stages.length - 1));
          setQIndex(0);

          return { active: false, seconds: 0 };
        }
        return { ...prev, seconds: next };
      });
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [intermission.active, stages.length]);

  const finishTest = () => {
    const ended = performance.now();
    const started = startedAtRef.current ?? ended;
    const totalMs = Math.max(0, Math.round(ended - started));

    const threatTotal = stages[0]?.questions.length ?? 0;
    const neutralTotal = stages[1]?.questions.length ?? 0;

    const overallCorrect = threatCorrect + neutralCorrect;
    const overallTotal = threatTotal + neutralTotal;
    const accuracyPct = overallTotal ? Math.round((overallCorrect / overallTotal) * 100) : 0;

    const attempt = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      totalMs,
      threat: { correct: threatCorrect, total: threatTotal },
      neutral: { correct: neutralCorrect, total: neutralTotal },
      overall: { correct: overallCorrect, total: overallTotal, accuracyPct },
    };

    sessionStorage.setItem("mk_last_attempt_v1", JSON.stringify(attempt));
    router.push("/result");
  };

  const goNext = () => {
    setSelected(null);
    setLocked(false);

    if (qIndex + 1 < stage.questions.length) {
      setQIndex(qIndex + 1);
      return;
    }

    if (stageIndex === 0 && stages.length > 1) {
      setIntermission({ active: true, seconds: 3 });
      return;
    }

    finishTest();
  };

  const onPick = (side: "left" | "right") => {
    if (!q) return;
    if (locked) return;
    if (intermission.active) return;

    if (startedAtRef.current === null) startedAtRef.current = performance.now();

    setSelected(side);
    setLocked(true);

    const isCorrect = side === q.correct;
    if (stage.key === "threat" && isCorrect) setThreatCorrect((v) => v + 1);
    if (stage.key === "neutral" && isCorrect) setNeutralCorrect((v) => v + 1);

    window.setTimeout(() => {
      goNext();
    }, 700);
  };

  if (!q && !intermission.active) {
    return (
      <div className="card">
        <h1>Үг олдсонгүй</h1>
        <p>lib/words.ts дотор threat / neutral үгнүүдээ нэмээрэй.</p>
      </div>
    );
  }

  if (intermission.active) {
    return (
      <div className="card">
        <h1>1-р үе шат дууслаа ✅</h1>
        <p className={styles.countdownText}>
          2-р үе шат <b>{intermission.seconds}</b> секундийн дараа эхэлнэ...
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className={styles.topRow}>
        <h1>{stage.title}</h1>
        <div className={styles.progress}>
          {answeredCount}/{totalQuestions}
        </div>
      </div>

      <p className={styles.prompt}>{q!.prompt}</p>

      <TwoChoiceWordCard
        leftText={q!.leftLabel ?? ""}
        rightText={q!.rightLabel ?? ""}
        disabled={locked}
        selected={selected}
        correct={locked ? q!.correct : null}
        onPick={onPick}
      />

      <div className={styles.footer}>
        {!locked ? (
          <div className={styles.hint}>Нэгийг сонгоно уу.</div>
        ) : (
          <div className={styles.feedback}>
            {selected === q!.correct ? "✅ Зөв!" : "❌ Буруу. Зөв хариулт тодорсон."}
          </div>
        )}
      </div>
    </div>
  );
}
