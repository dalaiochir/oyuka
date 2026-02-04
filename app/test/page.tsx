"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TwoChoiceWordCard, { WordCardPhase } from "../../components/TwoChoiceWordCard";
import { buildTwoStageWordQuestionsNoRepeat } from "../../lib/questionsFromWords";
import styles from "../../styles/Test.module.css";

type Stage = "threat" | "neutral";

const PRE_MS = 600;   // “+” харагдах хугацаа
const POST_MS = 550;  // “•” харагдах хугацаа

export default function TestPage() {
  const router = useRouter();

  const stages = useMemo(() => {
    const { threatQuestions, neutralQuestions, pairCountPerStage } =
      buildTwoStageWordQuestionsNoRepeat();

    return [
      {
        key: "threat" as Stage,
        title: `1-р үе шат: Занал үг (${pairCountPerStage} асуулт)`,
        questions: threatQuestions,
      },
      {
        key: "neutral" as Stage,
        title: `2-р үе шат: Энгийн үг (${pairCountPerStage} асуулт)`,
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

  // ✅ phase: pre -> show -> post
  const [phase, setPhase] = useState<WordCardPhase>("pre");

  // ✅ 1-р үе дууссаны дараах 3 секунд
  const [intermission, setIntermission] = useState<{ active: boolean; seconds: number }>({
    active: false,
    seconds: 0,
  });

  const startedAtRef = useRef<number | null>(null);
  const intermissionTimerRef = useRef<number | null>(null);
  const phaseTimerRef = useRef<number | null>(null);

  const stage = stages[stageIndex];
  const q = stage?.questions?.[qIndex];

  const answeredCount =
    stages.slice(0, stageIndex).reduce((acc, s) => acc + s.questions.length, 0) + qIndex;

  // ✅ асуулт бүр эхлэхэд: PRE -> SHOW
  useEffect(() => {
    if (intermission.active) return;
    if (!q) return;

    // reset phase
    setPhase("pre");

    if (phaseTimerRef.current) window.clearTimeout(phaseTimerRef.current);
    phaseTimerRef.current = window.setTimeout(() => {
      setPhase("show");
    }, PRE_MS);

    return () => {
      if (phaseTimerRef.current) window.clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    };
  }, [qIndex, stageIndex, intermission.active, q]);

  // ✅ intermission countdown: 3..2..1 -> stage2 start
  useEffect(() => {
    if (!intermission.active) return;

    if (intermissionTimerRef.current) window.clearInterval(intermissionTimerRef.current);

    intermissionTimerRef.current = window.setInterval(() => {
      setIntermission((prev) => {
        const next = prev.seconds - 1;
        if (next <= 0) {
          if (intermissionTimerRef.current) window.clearInterval(intermissionTimerRef.current);
          intermissionTimerRef.current = null;

          setStageIndex((si) => Math.min(si + 1, stages.length - 1));
          setQIndex(0);

          return { active: false, seconds: 0 };
        }
        return { ...prev, seconds: next };
      });
    }, 1000);

    return () => {
      if (intermissionTimerRef.current) window.clearInterval(intermissionTimerRef.current);
      intermissionTimerRef.current = null;
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
    // next question in same stage
    if (qIndex + 1 < stage.questions.length) {
      setQIndex(qIndex + 1);
      return;
    }

    // stage finished
    if (stageIndex === 0 && stages.length > 1) {
      setIntermission({ active: true, seconds: 3 });
      return;
    }

    finishTest();
  };

  const onPick = (side: "left" | "right") => {
    if (!q) return;
    if (intermission.active) return;
    if (phase !== "show") return;

    if (startedAtRef.current === null) startedAtRef.current = performance.now();

    const isCorrect = side === q.correct;
    if (stage.key === "threat" && isCorrect) setThreatCorrect((v) => v + 1);
    if (stage.key === "neutral" && isCorrect) setNeutralCorrect((v) => v + 1);

    // ✅ үг алга болно + зөв талд “•”
    setPhase("post");

    if (phaseTimerRef.current) window.clearTimeout(phaseTimerRef.current);
    phaseTimerRef.current = window.setTimeout(() => {
      goNext();
    }, POST_MS);
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
        phase={phase}
        correct={q!.correct}
        onPick={onPick}
      />
    </div>
  );
}
