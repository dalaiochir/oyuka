"use client";

import styles from "../styles/WordCard.module.css";

export type WordCardPhase = "pre" | "show" | "post";

type Props = {
  leftText: string;
  rightText: string;
  phase: WordCardPhase;
  correct: "left" | "right";
  onPick: (side: "left" | "right") => void;
};

export default function TwoChoiceWordCard({
  leftText,
  rightText,
  phase,
  correct,
  onPick,
}: Props) {
  const disabled = phase !== "show";

  const renderContent = (side: "left" | "right") => {
    if (phase === "show") {
      return <span className={styles.word}>{side === "left" ? leftText : rightText}</span>;
    }

    if (phase === "post") {
      // ✅ зөв байсан дөрвөлжинд “•” цэг гарна
      if (correct === side) return <span className={styles.dot}>•</span>;
      return null;
    }

    // pre: хоосон
    return null;
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        <button
          className={styles.choice}
          onClick={() => onPick("left")}
          disabled={disabled}
          aria-disabled={disabled}
        >
          {renderContent("left")}
        </button>

        <button
          className={styles.choice}
          onClick={() => onPick("right")}
          disabled={disabled}
          aria-disabled={disabled}
        >
          {renderContent("right")}
        </button>
      </div>

      {/* ✅ асуулт эхлэхийн өмнө “+” */}
      {phase === "pre" && <div className={styles.plus}>+</div>}
    </div>
  );
}
