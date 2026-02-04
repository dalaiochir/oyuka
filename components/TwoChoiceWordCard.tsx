"use client";

import styles from "../styles/WordCard.module.css";

type Props = {
  leftText: string;
  rightText: string;
  disabled?: boolean;
  selected?: "left" | "right" | null;
  correct?: "left" | "right" | null;
  onPick: (side: "left" | "right") => void;
};

export default function TwoChoiceWordCard({
  leftText,
  rightText,
  disabled,
  selected,
  correct,
  onPick,
}: Props) {
  const boxClass = (side: "left" | "right") => {
    const base = styles.choice;
    if (!selected || !correct) return base;

    const isCorrect = correct === side;
    const isSelected = selected === side;

    if (isCorrect) return `${base} ${styles.correct}`;
    if (isSelected && !isCorrect) return `${base} ${styles.wrong}`;
    return `${base} ${styles.dim}`;
  };

  return (
    <div className={styles.grid}>
      <button className={boxClass("left")} onClick={() => onPick("left")} disabled={disabled}>
        <span className={styles.word}>{leftText}</span>
      </button>

      <button className={boxClass("right")} onClick={() => onPick("right")} disabled={disabled}>
        <span className={styles.word}>{rightText}</span>
      </button>
    </div>
  );
}
