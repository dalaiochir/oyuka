import styles from "../../styles/Page.module.css";

export default function TestPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.h1}>Тестүүд</h1>
      <p className={styles.p}>Доорх тестүүдээс сонгоно уу.</p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
        <a
          href="/test/dot-probe"
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 900,
          }}
        >
          Dot-Probe Test →
        </a>

        <a
          href="/test/stroop"
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 900,
          }}
        >
          Emotional Stroop Test →
        </a>
      </div>
    </main>
  );
}
