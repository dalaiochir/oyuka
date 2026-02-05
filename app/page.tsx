"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import page from "../styles/Page.module.css";
import home from "../styles/Home.module.css";

import type { Attempt } from "../lib/types";
import { loadHistory } from "../lib/storage";
import { formatMs, pickBestAttempt } from "../lib/scoring";

import type { StroopAttempt } from "../lib/stroopTypes";
import { loadStroopHistory } from "../lib/stroopStorage";

function fmtStroopTime(ms: number) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function pickBestStroop(history: StroopAttempt[]) {
  if (history.length === 0) return null;
  return [...history].sort((a, b) => {
    // Best: accuracy өндөр -> I−C бага -> total бага
    if (b.accuracyPct !== a.accuracyPct) return b.accuracyPct - a.accuracyPct;
    if (a.interferenceMs !== b.interferenceMs) return a.interferenceMs - b.interferenceMs;
    return a.totalMs - b.totalMs;
  })[0];
}

export default function HomePage() {
  const [dotLast, setDotLast] = useState<Attempt | null>(null);
  const [stroopLast, setStroopLast] = useState<StroopAttempt | null>(null);
  const [dotAll, setDotAll] = useState<Attempt[]>([]);
  const [stroopAll, setStroopAll] = useState<StroopAttempt[]>([]);

  useEffect(() => {
    const d = loadHistory();
    const s = loadStroopHistory();
    setDotAll(d);
    setStroopAll(s);
    setDotLast(d[0] ?? null);
    setStroopLast(s[0] ?? null);
  }, []);

  const dotBest = useMemo(() => pickBestAttempt(dotAll), [dotAll]);
  const stroopBest = useMemo(() => pickBestStroop(stroopAll), [stroopAll]);

  const totalAttempts = dotAll.length + stroopAll.length;

  return (
    <main className={page.page}>
      {/* HERO */}
      <section className={home.hero}>
        <div className={home.heroTop}>
          <div className={home.badge}>Oyuka • Cognitive Tasks</div>
          <h1 className={home.title}>Dot-Probe & Emotional Stroop</h1>
          <p className={home.subtitle}>
            2 төрлийн анхаарал/хариу үйлдлийн тест ажиллуулаад, үр дүнгээ хадгалж,
            өөрийнхөө “Best” болон өмнөх оролдлогуудтай харьцуулж үзээрэй.
          </p>

          <div className={home.ctaRow}>
            <Link className={home.primaryBtn} href="/test">
              Тест эхлэх
            </Link>
            <Link className={home.ghostBtn} href="/instructions">
              Заавар үзэх
            </Link>
            <Link className={home.ghostBtn} href="/history">
              Түүх харах
            </Link>
          </div>

          <div className={home.statsRow}>
            <div className={home.stat}>
              <div className={home.statLabel}>Нийт оролдлого</div>
              <div className={home.statValue}>{totalAttempts}</div>
            </div>
            <div className={home.stat}>
              <div className={home.statLabel}>Dot-Probe</div>
              <div className={home.statValue}>{dotAll.length}</div>
            </div>
            <div className={home.stat}>
              <div className={home.statLabel}>Stroop</div>
              <div className={home.statValue}>{stroopAll.length}</div>
            </div>
          </div>
        </div>

        <div className={home.heroSide}>
          <div className={home.previewCard}>
            <div className={home.previewHeader}>
              <div className={home.previewTitle}>Quick preview</div>
              <div className={home.previewHint}>Fixation → Stimulus → Response</div>
            </div>

            <div className={home.previewGrid}>
              <div className={home.box}>THREAT</div>
              <div className={home.plus}>+</div>
              <div className={home.box}>NEUTRAL</div>
            </div>

            <div className={home.previewFooter}>
              Хариулмагц дараагийн асуулт руу шилжинэ. Block солигдоход богино завсарлага гарна.
            </div>
          </div>

          <div className={home.noteCard}>
            <div className={home.noteTitle}>Зорилго</div>
            <ul className={home.noteList}>
              <li>Өөрийн хурд, зөв хувийг тогтмол хэмжих</li>
              <li>Best үр дүнтэйгээ харьцуулах</li>
              <li>Түүх дээр бүх оролдлого хадгалах</li>
            </ul>
          </div>
        </div>
      </section>

      {/* RESULT CARDS */}
      <section className={home.section}>
        <div className={home.sectionHead}>
          <h2 className={home.h2}>Сүүлийн / Best товч харах</h2>
          <p className={home.p}>
            Түүх хоосон бол эхлээд “Тест эхлэх” дээр дарж оролдлого үүсгээрэй.
          </p>
        </div>

        <div className={home.cards}>
          {/* Dot-Probe */}
          <div className={home.card}>
            <div className={home.cardTop}>
              <div className={home.cardTitle}>Dot-Probe</div>
              <div className={home.cardTag}>Threat vs Neutral</div>
            </div>

            <div className={home.cardGrid}>
              <div className={home.metric}>
                <div className={home.metricLabel}>Сүүлийн хугацаа</div>
                <div className={home.metricValue}>{dotLast ? formatMs(dotLast.totalMs) : "—"}</div>
              </div>
              <div className={home.metric}>
                <div className={home.metricLabel}>Сүүлийн зөв %</div>
                <div className={home.metricValue}>{dotLast ? `${dotLast.accuracyPct}%` : "—"}</div>
              </div>
              <div className={home.metric}>
                <div className={home.metricLabel}>Best хугацаа</div>
                <div className={home.metricValue}>{dotBest ? formatMs(dotBest.totalMs) : "—"}</div>
              </div>
              <div className={home.metric}>
                <div className={home.metricLabel}>Best зөв %</div>
                <div className={home.metricValue}>{dotBest ? `${dotBest.accuracyPct}%` : "—"}</div>
              </div>
            </div>

            <div className={home.cardActions}>
              <Link className={home.smallBtn} href="/test/dot-probe">Dot-Probe ажиллуулах</Link>
              <Link className={home.smallGhost} href="/history">Түүх дээр харах</Link>
            </div>
          </div>

          {/* Stroop */}
          <div className={home.card}>
            <div className={home.cardTop}>
              <div className={home.cardTitle}>Emotional Stroop</div>
              <div className={home.cardTag}>Ink color response</div>
            </div>

            <div className={home.cardGrid}>
              <div className={home.metric}>
                <div className={home.metricLabel}>Сүүлийн хугацаа</div>
                <div className={home.metricValue}>{stroopLast ? fmtStroopTime(stroopLast.totalMs) : "—"}</div>
              </div>
              <div className={home.metric}>
                <div className={home.metricLabel}>Сүүлийн зөв %</div>
                <div className={home.metricValue}>{stroopLast ? `${stroopLast.accuracyPct}%` : "—"}</div>
              </div>
              <div className={home.metric}>
                <div className={home.metricLabel}>Best I−C</div>
                <div className={home.metricValue}>{stroopBest ? `${stroopBest.interferenceMs}ms` : "—"}</div>
              </div>
              <div className={home.metric}>
                <div className={home.metricLabel}>Best зөв %</div>
                <div className={home.metricValue}>{stroopBest ? `${stroopBest.accuracyPct}%` : "—"}</div>
              </div>
            </div>

            <div className={home.cardActions}>
              <Link className={home.smallBtn} href="/test/stroop">Stroop ажиллуулах</Link>
              <Link className={home.smallGhost} href="/history">Түүх дээр харах</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section className={home.footer}>
        <div className={home.footerInner}>
          <div className={home.footerTitle}>Санал</div>
          <div className={home.footerText}>
            Ямар нэг алдаа, гацалт гарвал “Түүх” дээрх CSV таталтыг ашиглаад үр дүнгээ хадгалж болно.
          </div>
        </div>
      </section>
    </main>
  );
}
