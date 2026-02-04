import DotProbeWordTask from "../../components/DotProbeWordTask";
import styles from "../../styles/Page.module.css";

export default function TestPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.h1}>Тест</h1>
      <p className={styles.p}>
        2 үе шаттай: (1) заналхийлсэн үгийг олох, (2) энгийн үгийг олох.
      </p>

      <DotProbeWordTask trialsPerPhase={12} />
    </main>
  );
}
