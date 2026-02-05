import styles from "../../../styles/Page.module.css";
import EmotionalStroopTask from "../../../components/EmotionalStroopTask";

export default function StroopTestPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.h1}>Emotional Stroop Test</h1>
      <p className={styles.p}>
        Үгийн утгыг биш, <b>бэхний өнгийг</b> аль болох хурдан сонгоно.
      </p>

      <EmotionalStroopTask trialsPerCondition={12} />
    </main>
  );
}
