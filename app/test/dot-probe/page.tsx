import styles from "../../../styles/Page.module.css";
import DotProbeWordTask from "../../../components/DotProbeWordTask";

export default function DotProbePage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.h1}>Dot-Probe Test</h1>
      <p className={styles.p}>1-р үе: threat, 2-р үе: neutral.</p>
      <DotProbeWordTask trialsPerPhase={12} />
    </main>
  );
}
