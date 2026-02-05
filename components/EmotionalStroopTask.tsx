"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/Stroop.module.css";
import {
  INK_COLORS,
  STROOP_COLOR_WORDS,
  STROOP_NEUTRAL_WORDS,
  shuffle,
  type InkColorKey,
} from "../lib/stroopWords";
import type { StroopCondition, StroopTrial, StroopTrialResult } from "../lib/stroopTypes";
import { buildStroopAttempt } from "../lib/stroopScoring";
import { saveStroopAttempt } from "../lib/stroopStorage";

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function pickInk(except?: InkColorKey): InkColorKey {
  const keys = INK_COLORS.map((c) => c.key).filter((k) => k !== except);
  return keys[Math.floor(Math.random() * keys.length)];
}

function makeTrials(perCond: number): StroopTrial[] {
  const n = Math.max(8, Math.min(60, perCond));

  // congruent: color word == ink
  const congruentWords = shuffle(STROOP_COLOR_WORDS).slice(0, n);
  const congruent: StroopTrial[] = congruentWords.map((w) => {
    const wKey = (["RED", "BLUE", "GREEN", "YELLOW"] as InkColorKey[]).includes(w as InkColorKey)
      ? (w as InkColorKey)
      : pickInk(); // unsupported color words get random ink
    return {
      id: uid(),
      condition: "congruent",
      word: w,
      ink: wKey,
      correctInk: wKey,
    };
  });

  // incongruent: color word != ink
  const incongruentWords = shuffle(STROOP_COLOR_WORDS).slice(0, n);
  const incongruent: StroopTrial[] = incongruentWords.map((w) => {
    const wKey = (["RED", "BLUE", "GREEN", "YELLOW"] as InkColorKey[]).includes(w as InkColorKey)
      ? (w as InkColorKey)
      : pickInk();
    const ink = pickInk(wKey);
    return {
      id: uid(),
      condition: "incongruent",
      word: w,
      ink,
      correctInk: ink,
    };
  });

  // neutral: non-color word, random ink
  const neutralWords = shuffle(STROOP_NEUTRAL_WORDS).slice(0, n);
  const neutral: StroopTrial[] = neutralWords.map((w) => {
    const ink = pickInk();
    return {
      id: uid(),
      condition: "neutral",
      word: w,
      ink,
      correctInk: ink,
    };
  });

  // order: congruent -> incongruent -> neutral (block-wise, break between)
  return [...congruent, ...incongruent, ...neutral];
}

type View = "fix" | "stim" | "break" | "done";

export default function EmotionalStroopTask(props: { trialsPerCondition?: number }) {
  const trialsPerCond = props.trialsPerCondition ?? 12;
  const trials = useMemo(() => makeTrials(trialsPerCond), [trialsPerCond]);

  const [idx, setIdx] = useState(0);
  const [view, setView] = useState<View>("fix");
  const [breakLeft, setBreakLeft] = useState(3);

  const [results, setResults] = useState<StroopTrialResult[]>([]);

  const shownAtRef = useRef<number>(0);
  const startedAtRef = useRef<number>(0);

  const fixTimer = useRef<number | null>(null);
  const breakTimer = useRef<number | null>(null);

  const current = trials[idx];

  const currentBlock: StroopCondition | null = current ? current.condition : null;
  const prevBlock: StroopCondition | null =
    idx > 0 ? trials[idx - 1]?.condition ?? null : null;

  function clearTimers() {
    if (fixTimer.current) window.clearTimeout(fixTimer.current);
    if (breakTimer.current) window.clearInterval(breakTimer.current);
    fixTimer.current = null;
    breakTimer.current = null;
  }

  useEffect(() => {
    startedAtRef.current = performance.now();
    return () => clearTimers();
  }, []);

  // fixation 500ms -> stimulus
  useEffect(() => {
    if (!current) return;

    // block changed => break
    if (prevBlock && currentBlock && prevBlock !== currentBlock) {
      setView("break");
      setBreakLeft(3);

      let remaining = 3;
      breakTimer.current = window.setInterval(() => {
        remaining -= 1;
        setBreakLeft(remaining);
        if (remaining <= 0) {
          if (breakTimer.current) window.clearInterval(breakTimer.current);
          breakTimer.current = null;

          setView("fix");
        }
      }, 1000);

      return;
    }

    setView("fix");
    fixTimer.current = window.setTimeout(() => {
      setView("stim");
      shownAtRef.current = performance.now();
    }, 500);

    return () => {
      if (fixTimer.current) window.clearTimeout(fixTimer.current);
      fixTimer.current = null;
    };
  }, [idx, current, currentBlock, prevBlock]);

  function finish(finalResults: StroopTrialResult[]) {
    const totalMs = Math.max(0, Math.round(performance.now() - startedAtRef.current));
    const attempt = buildStroopAttempt({
      id: uid(),
      createdAtIso: new Date().toISOString(),
      totalMs,
      results: finalResults,
    });
    saveStroopAttempt(attempt);
    setView("done");
  }

  function onPick(picked: InkColorKey) {
    if (!current) return;
    if (view !== "stim") return;

    const now = performance.now();
    const rtMs = Math.max(0, Math.round(now - shownAtRef.current));
    const correct = picked === current.correctInk;

    const res: StroopTrialResult = {
      trialId: current.id,
      condition: current.condition,
      word: current.word,
      ink: current.ink,
      correctInk: current.correctInk,
      picked,
      correct,
      rtMs,
      shownAtMs: shownAtRef.current,
      responseAtMs: now,
    };

    const nextResults = [...results, res];
    setResults(nextResults);

    const nextIdx = idx + 1;
    if (nextIdx >= trials.length) {
      finish(nextResults);
      return;
    }
    setIdx(nextIdx);
  }

  if (!current && view !== "done") {
    return <div className={styles.card}>Тест бэлтгэж байна…</div>;
  }

  if (view === "break") {
    return (
      <div className={styles.card}>
        <div className={styles.title}>Block солигдоно</div>
        <div className={styles.sub}>Дараагийн блок {breakLeft} секундийн дараа…</div>
      </div>
    );
  }

  if (view === "done") {
    return (
      <div className={styles.card}>
        <div className={styles.title}>Emotional Stroop дууслаа ✅</div>
        <div className={styles.sub}>Үр дүн “Түүх” хэсэгт хадгалагдлаа.</div>
        <div className={styles.row}>
          <a className={styles.linkBtn} href="/test/stroop/result">Үр дүн харах</a>
          <a className={styles.linkBtn} href="/test/stroop/history">Түүх</a>
        </div>
      </div>
    );
  }

  const inkCss = INK_COLORS.find((c) => c.key === current.ink)?.css ?? "#ffffff";

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.pill}>
          {current.condition === "congruent" && "Congruent"}
          {current.condition === "incongruent" && "Incongruent"}
          {current.condition === "neutral" && "Neutral"}
        </div>
        <div className={styles.count}>
          {idx + 1}/{trials.length}
        </div>
      </div>

      <div className={styles.stage}>
        {view === "fix" ? (
          <div className={styles.fix}>+</div>
        ) : (
          <div className={styles.word} style={{ color: inkCss }}>
            {current.word}
          </div>
        )}
      </div>

      <div className={styles.buttons}>
        {INK_COLORS.map((c) => (
          <button
            key={c.key}
            className={styles.btn}
            onClick={() => onPick(c.key)}
            disabled={view !== "stim"}
            style={{ borderColor: c.css }}
          >
            {c.key}
          </button>
        ))}
      </div>

      <div className={styles.hint}>
        Үгийн <b>бэхний өнгө</b>-ийг сонго (үгний утгыг биш).
      </div>
    </div>
  );
}
