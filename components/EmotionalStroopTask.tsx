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

  const congruent = shuffle(STROOP_COLOR_WORDS).slice(0, n).map((w) => {
    const ink = ["RED", "BLUE", "GREEN", "YELLOW"].includes(w)
      ? (w as InkColorKey)
      : pickInk();
    return { id: uid(), condition: "congruent", word: w, ink, correctInk: ink };
  });

  const incongruent = shuffle(STROOP_COLOR_WORDS).slice(0, n).map((w) => {
    const base = ["RED", "BLUE", "GREEN", "YELLOW"].includes(w)
      ? (w as InkColorKey)
      : pickInk();
    const ink = pickInk(base);
    return { id: uid(), condition: "incongruent", word: w, ink, correctInk: ink };
  });

  const neutral = shuffle(STROOP_NEUTRAL_WORDS).slice(0, n).map((w) => {
    const ink = pickInk();
    return { id: uid(), condition: "neutral", word: w, ink, correctInk: ink };
  });

  return [...congruent, ...incongruent, ...neutral];
}

type View = "fix" | "stim" | "break" | "done";

export default function EmotionalStroopTask({ trialsPerCondition = 12 }) {
  const trials = useMemo(() => makeTrials(trialsPerCondition), [trialsPerCondition]);

  const [idx, setIdx] = useState(0);
  const [view, setView] = useState<View>("fix");
  const [breakLeft, setBreakLeft] = useState(3);
  const [results, setResults] = useState<StroopTrialResult[]>([]);

  const shownAtRef = useRef(0);
  const startedAtRef = useRef(0);
  const blockHandledRef = useRef(false);

  const current = trials[idx];
  const prev = idx > 0 ? trials[idx - 1] : null;

  useEffect(() => {
    startedAtRef.current = performance.now();
  }, []);

  // 🔁 FIXATION → STIMULUS lifecycle
  useEffect(() => {
    if (!current) return;
    if (view !== "fix") return;

    // block солигдсон бол break харуулна
    if (prev && prev.condition !== current.condition && !blockHandledRef.current) {
      blockHandledRef.current = true;
      setView("break");
      setBreakLeft(3);

      let t = 3;
      const timer = setInterval(() => {
        t -= 1;
        setBreakLeft(t);
        if (t <= 0) {
          clearInterval(timer);
          setView("fix"); // fixation руу буцаана
        }
      }, 1000);

      return;
    }

    // fixation → stimulus
    blockHandledRef.current = false;
    const timer = setTimeout(() => {
      setView("stim");
      shownAtRef.current = performance.now();
    }, 500);

    return () => clearTimeout(timer);
  }, [idx, view, current, prev]);

  function finish(final: StroopTrialResult[]) {
    const totalMs = Math.round(performance.now() - startedAtRef.current);
    saveStroopAttempt(
      buildStroopAttempt({
        id: uid(),
        createdAtIso: new Date().toISOString(),
        totalMs,
        results: final,
      })
    );
    setView("done");
  }

  function onPick(picked: InkColorKey) {
    if (!current || view !== "stim") return;

    const now = performance.now();
    const rtMs = Math.round(now - shownAtRef.current);

    const res: StroopTrialResult = {
      trialId: current.id,
      condition: current.condition,
      word: current.word,
      ink: current.ink,
      correctInk: current.correctInk,
      picked,
      correct: picked === current.correctInk,
      rtMs,
      shownAtMs: shownAtRef.current,
      responseAtMs: now,
    };

    const next = [...results, res];
    setResults(next);

    if (idx + 1 >= trials.length) {
      finish(next);
    } else {
      setIdx((i) => i + 1);
      setView("fix");
    }
  }

  if (view === "break") {
    return (
      <div className={styles.card}>
        <div className={styles.title}>Block солигдож байна</div>
        <div className={styles.sub}>{breakLeft} секундийн дараа үргэлжилнэ</div>
      </div>
    );
  }

  if (view === "done") {
    return (
      <div className={styles.card}>
        <div className={styles.title}>Stroop тест дууслаа ✅</div>
        <a className={styles.linkBtn} href="/test/stroop/result">Үр дүн харах</a>
      </div>
    );
  }

  const inkCss = INK_COLORS.find((c) => c.key === current.ink)?.css ?? "#fff";

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.pill}>{current.condition}</div>
        <div className={styles.count}>{idx + 1}/{trials.length}</div>
      </div>

      <div className={styles.stage}>
        {view === "fix" ? (
          <div className={styles.fix}>+</div>
        ) : (
          <div className={styles.word} style={{ color: inkCss }}>{current.word}</div>
        )}
      </div>

      <div className={styles.buttons}>
        {INK_COLORS.map((c) => (
          <button
            key={c.key}
            className={styles.btn}
            onClick={() => onPick(c.key)}
            disabled={view !== "stim"}
          >
            {c.key}
          </button>
        ))}
      </div>

      <div className={styles.hint}>
        Үгийн <b>бэхний өнгө</b>-ийг сонго
      </div>
    </div>
  );
}
