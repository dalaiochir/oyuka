"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/Test.module.css";
import card from "../styles/WordCard.module.css";
import type { Attempt, Phase, Trial, TrialResult } from "../lib/types";
import { THREAT_WORDS, NEUTRAL_WORDS, clampTrialsPerPhase } from "../lib/words";
import { buildAttempt } from "../lib/scoring";
import { saveAttempt } from "../lib/storage";

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildTrials(trialsPerPhase: number): Trial[] {
  const n = clampTrialsPerPhase(trialsPerPhase);

  // threat/neutral тус тусдаа random, мөн давтагдахгүй
  const threat = shuffle(THREAT_WORDS).slice(0, n);
  const neutral = shuffle(NEUTRAL_WORDS).slice(0, n);

  return Array.from({ length: n }).map((_, i) => {
    const threatSide: 0 | 1 = Math.random() < 0.5 ? 0 : 1; // байрлал random
    return {
      id: uid(),
      threatWord: threat[i],
      neutralWord: neutral[i],
      threatSide,
    };
  });
}

type ViewState = "fixation" | "stimuli" | "feedback" | "phaseBreak" | "done";

export default function DotProbeWordTask(props: { trialsPerPhase?: number }) {
  const totalTrialsPerPhase = clampTrialsPerPhase(props.trialsPerPhase ?? 12);
  const allTrials = useMemo(() => buildTrials(totalTrialsPerPhase), [totalTrialsPerPhase]);

  const [phase, setPhase] = useState<Phase>("threat");
  const [index, setIndex] = useState(0);

  const [view, setView] = useState<ViewState>("fixation");
  const [breakLeft, setBreakLeft] = useState(3);

  const [results, setResults] = useState<TrialResult[]>([]);
  const [lastFeedback, setLastFeedback] = useState<{ correctSide: "left" | "right" } | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const shownAtRef = useRef<number | null>(null);

  const fixationTimer = useRef<number | null>(null);
  const feedbackTimer = useRef<number | null>(null);
  const breakTimer = useRef<number | null>(null);

  const currentTrial = allTrials[index];

  const leftWord = currentTrial
    ? currentTrial.threatSide === 0
      ? currentTrial.threatWord
      : currentTrial.neutralWord
    : "";
  const rightWord = currentTrial
    ? currentTrial.threatSide === 1
      ? currentTrial.threatWord
      : currentTrial.neutralWord
    : "";

  const correctSideForPhase: "left" | "right" = useMemo(() => {
    if (!currentTrial) return "left";
    const threatIsLeft = currentTrial.threatSide === 0;

    // phase=threat => threat үгийг сонгоно
    // phase=neutral => neutral үгийг сонгоно
    if (phase === "threat") return threatIsLeft ? "left" : "right";
    return threatIsLeft ? "right" : "left";
  }, [currentTrial, phase]);

  function clearTimers() {
    if (fixationTimer.current) window.clearTimeout(fixationTimer.current);
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    if (breakTimer.current) window.clearInterval(breakTimer.current);
    fixationTimer.current = null;
    feedbackTimer.current = null;
    breakTimer.current = null;
  }

  useEffect(() => {
    startTimeRef.current = performance.now();
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trial lifecycle: fixation(500ms) -> stimuli
  useEffect(() => {
    if (!currentTrial) return;

    setView("fixation");
    setLastFeedback(null);

    fixationTimer.current = window.setTimeout(() => {
      setView("stimuli");
      shownAtRef.current = performance.now();
    }, 500);

    return () => {
      if (fixationTimer.current) window.clearTimeout(fixationTimer.current);
      fixationTimer.current = null;
    };
  }, [phase, index, currentTrial]);

  function finishAttempt(finalResults: TrialResult[]) {
    const totalMs = Math.max(
      0,
      Math.round(performance.now() - (startTimeRef.current ?? performance.now()))
    );

    const attempt: Attempt = buildAttempt({
      id: uid(),
      createdAtIso: new Date().toISOString(),
      totalTrialsPerPhase,
      totalMs,
      results: finalResults,
    });

    saveAttempt(attempt);
    setView("done");
  }

  function goNext(nextResults: TrialResult[]) {
    // feedback дараа дараагийн trial руу
    feedbackTimer.current = window.setTimeout(() => {
      setLastFeedback(null);

      const nextIndex = index + 1;
      if (nextIndex < totalTrialsPerPhase) {
        setIndex(nextIndex);
        return;
      }

      // Phase дуусвал break
      if (phase === "threat") {
        setView("phaseBreak");
        setBreakLeft(3);

        let remaining = 3;
        breakTimer.current = window.setInterval(() => {
          remaining -= 1;
          setBreakLeft(remaining);
          if (remaining <= 0) {
            if (breakTimer.current) window.clearInterval(breakTimer.current);
            breakTimer.current = null;

            setPhase("neutral");
            setIndex(0);
          }
        }, 1000);
        return;
      }

      // All done
      finishAttempt(nextResults);
    }, 500);
  }

  function onPick(side: "left" | "right") {
    if (!currentTrial) return;
    if (view !== "stimuli") return;

    const now = performance.now();
    const shownAt = shownAtRef.current ?? now;
    const rtMs = Math.max(0, Math.round(now - shownAt));

    const correctSide = correctSideForPhase;
    const correct = side === correctSide;

    const threatSide: "left" | "right" = currentTrial.threatSide === 0 ? "left" : "right";

    const res: TrialResult = {
      trialId: currentTrial.id,
      phase,
      shownAtMs: shownAt,
      responseAtMs: now,
      rtMs,
      picked: side,
      correctSide,
      correct,
      threatWord: currentTrial.threatWord,
      neutralWord: currentTrial.neutralWord,
      threatSide,
    };

    const nextResults = [...results, res];
    setResults(nextResults);

    setLastFeedback({ correctSide });
    setView("feedback");
    goNext(nextResults);
  }

  if (view === "phaseBreak") {
    return (
      <div className={styles.wrap}>
        <div className={styles.overlay}>
          <div className={styles.overlayCard}>
            <div className={styles.overlayTitle}>1-р үе дууслаа</div>
            <div className={styles.overlayText}>2-р үе {breakLeft} секундийн дараа эхэлнэ</div>
          </div>
        </div>
      </div>
    );
  }

  if (view === "done") {
    return (
      <div className={styles.wrap}>
        <div className={styles.doneCard}>
          <div className={styles.doneTitle}>Тест дууслаа ✅</div>
          <div className={styles.doneText}>Түүх хэсэгт хадгалагдлаа.</div>
          <a className={styles.linkBtn} href="/history">
            Түүх рүү очих
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topBar}>
        <div className={styles.phasePill}>
          {phase === "threat" ? "1-р үе: Заналхийлсэн үг" : "2-р үе: Энгийн үг"}
        </div>
        <div className={styles.counter}>
          {index + 1}/{totalTrialsPerPhase}
        </div>
      </div>

      <div className={styles.stage}>
        {view === "fixation" && (
          <div className={styles.fixation}>
            <span className={styles.plus}>+</span>
          </div>
        )}

        {(view === "stimuli" || view === "feedback") && (
          <div className={styles.grid}>
            <button
              className={card.box}
              onClick={() => onPick("left")}
              disabled={view !== "stimuli"}
            >
              <span className={card.word}>
                {view === "feedback" ? "" : leftWord}
              </span>
              {view === "feedback" && lastFeedback?.correctSide === "left" && (
                <span className={card.dot} aria-hidden="true">
                  •
                </span>
              )}
            </button>

            <button
              className={card.box}
              onClick={() => onPick("right")}
              disabled={view !== "stimuli"}
            >
              <span className={card.word}>
                {view === "feedback" ? "" : rightWord}
              </span>
              {view === "feedback" && lastFeedback?.correctSide === "right" && (
                <span className={card.dot} aria-hidden="true">
                  •
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      <div className={styles.hint}>
        {view === "stimuli" && (
          <span>{phase === "threat" ? "Заналхийлсэн үгийг сонго." : "Энгийн үгийг сонго."}</span>
        )}
        {view === "fixation" && <span>Бэлтгэ…</span>}
      </div>
    </div>
  );
}
