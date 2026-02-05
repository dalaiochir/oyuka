import styles from "../../../styles/Page.module.css";
import EmotionalStroopTask from "../../../components/EmotionalStroopTask";

export default function StroopTestPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.h1}>Emotional Stroop Test</h1>
      <p className={styles.p}>
        Нийцтэй/нийцгүй нөхцөлд үгийн утга ба бэхний өнгө таарах/зөрөх байдлаар явна :contentReference[oaicite:6]{index=6}.
        Мөн “neutral” нөхцөл нэмэх боломжтой :contentReference[oaicite:7]{index=7}.
      </p>

      <EmotionalStroopTask trialsPerCondition={12} />
    </main>
  );
}
