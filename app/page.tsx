import styles from "../styles/Page.module.css";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.h1}>Нүүр</h1>
      <p className={styles.p}>
        Dot-Probe болон Emotional Stroop тестүүдийг ажиллуулж, үр дүнгээ түүх дээр хадгална.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
        <a
          href="/instructions"
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
          Заавар
        </a>

        <a
          href="/test"
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
          Тестүүд
        </a>

        <a
          href="/history"
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
          Түүх →
        </a>
      </div>
    </main>
  );
}
