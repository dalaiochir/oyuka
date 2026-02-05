import Link from "next/link";
import page from "../../styles/Page.module.css";
import s from "../../styles/Instructions.module.css";

export default function InstructionsPage() {
  return (
    <main className={page.page}>
      <section className={s.hero}>
        <div className={s.badge}>Заавар • Oyuka</div>
        <h1 className={s.title}>Тестийн заавар</h1>
        <p className={s.subtitle}>
          Доорх 2 тестийг ажиллуулахын өмнө анхаарах зүйлс болон алхмуудыг танилцуулж байна.
          Зорилго нь хурд (reaction time) болон зөв хувийг хэмжиж, түүх дээр хадгалах юм.
        </p>

        <div className={s.ctaRow}>
          <Link className={s.primaryBtn} href="/test">
            Тест эхлэх →
          </Link>
          <Link className={s.ghostBtn} href="/history">
            Түүх харах
          </Link>
        </div>
      </section>

      <section className={s.grid}>
        {/* General tips */}
        <div className={s.card}>
          <div className={s.cardTop}>
            <div className={s.cardTitle}>Ерөнхий зөвлөмж</div>
            <div className={s.tag}>Before you start</div>
          </div>

          <ul className={s.list}>
            <li>Чимээгүй орчинд, анхаарал сарнихгүй үед ажиллуул.</li>
            <li>Гар утаснаас илүү компьютер дээр зөв (keyboard/mouse).</li>
            <li>Интернет тасалдахгүй байхад илүү найдвартай.</li>
            <li>Асуултад хурдан хариул — удаан бодох шаардлагагүй.</li>
          </ul>
        </div>

        {/* Dot-probe */}
        <div className={s.card}>
          <div className={s.cardTop}>
            <div className={s.cardTitle}>Dot-Probe Test</div>
            <div className={s.tag}>Threat vs Neutral</div>
          </div>

          <div className={s.steps}>
            <div className={s.step}>
              <div className={s.stepNum}>1</div>
              <div className={s.stepBody}>
                <div className={s.stepTitle}>2 үг гарна</div>
                <div className={s.stepText}>
                  Нэг нь <b>threat</b>, нөгөө нь <b>neutral</b> байна. Байрлал нь random.
                </div>
              </div>
            </div>

            <div className={s.step}>
              <div className={s.stepNum}>2</div>
              <div className={s.stepBody}>
                <div className={s.stepTitle}>“+” гарсны дараа эхэлнэ</div>
                <div className={s.stepText}>
                  “+” үед box/үг түр алга болж, дараа нь 2 үг хамт гарч ирнэ.
                </div>
              </div>
            </div>

            <div className={s.step}>
              <div className={s.stepNum}>3</div>
              <div className={s.stepBody}>
                <div className={s.stepTitle}>Сонгоод шууд дараагийнх руу</div>
                <div className={s.stepText}>
                  Сонгосны дараа аль нь зөв байсныг богино хугацаанд харуулна, дараагийн асуулт шууд үргэлжилнэ.
                </div>
              </div>
            </div>

            <div className={s.step}>
              <div className={s.stepNum}>4</div>
              <div className={s.stepBody}>
                <div className={s.stepTitle}>2 үе шат</div>
                <div className={s.stepText}>
                  1-р үе дуусмагц <b>3 секунд</b> countdown явна. 2-р үе мөн адил үргэлжилнэ.
                </div>
              </div>
            </div>
          </div>

          <div className={s.note}>
            <div className={s.noteTitle}>Хэмжих үзүүлэлт</div>
            <div className={s.noteText}>
              Нийт хугацаа, зөв %, threat/neutral mean RT, ABS (T − N).
            </div>
          </div>

          <div className={s.cardActions}>
            <Link className={s.smallBtn} href="/test/dot-probe">
              Dot-Probe ажиллуулах →
            </Link>
          </div>
        </div>

        {/* Stroop */}
        <div className={s.card}>
          <div className={s.cardTop}>
            <div className={s.cardTitle}>Emotional Stroop Test</div>
            <div className={s.tag}>Ink color response</div>
          </div>

          <div className={s.steps}>
            <div className={s.step}>
              <div className={s.stepNum}>1</div>
              <div className={s.stepBody}>
                <div className={s.stepTitle}>Үгийн утгыг бус, өнгийг сонго</div>
                <div className={s.stepText}>
                  Гарч ирсэн үгийг унших биш, <b>бэхний өнгө</b>-ийг сонго.
                </div>
              </div>
            </div>

            <div className={s.step}>
              <div className={s.stepNum}>2</div>
              <div className={s.stepBody}>
                <div className={s.stepTitle}>Block-ууд ээлжилнэ</div>
                <div className={s.stepText}>
                  Congruent / Incongruent / Neutral блок солигдох үед богино break гарна.
                </div>
              </div>
            </div>

            <div className={s.step}>
              <div className={s.stepNum}>3</div>
              <div className={s.stepBody}>
                <div className={s.stepTitle}>Хурд чухал</div>
                <div className={s.stepText}>
                  Аль болох хурдан, алдаа багатай сонго. Бүх оролдлого түүх дээр хадгалагдана.
                </div>
              </div>
            </div>
          </div>

          <div className={s.note}>
            <div className={s.noteTitle}>Best шалгуур</div>
            <div className={s.noteText}>
              Accuracy өндөр → I−C (interference) бага → хугацаа бага.
            </div>
          </div>

          <div className={s.cardActions}>
            <Link className={s.smallBtn} href="/test/stroop">
              Stroop ажиллуулах →
            </Link>
          </div>
        </div>

        {/* Results */}
        <div className={s.cardWide}>
          <div className={s.cardTop}>
            <div className={s.cardTitle}>Үр дүн ба Түүх</div>
            <div className={s.tag}>Compare & Export</div>
          </div>

          <div className={s.wideGrid}>
            <div className={s.wideBlock}>
              <div className={s.wideTitle}>Үр дүн</div>
              <div className={s.wideText}>
                Тест дуусмагц сүүлийн үр дүн харагдана. Best үр дүнтэй харьцуулж Δ (ялгаа) үзүүлнэ.
              </div>
            </div>

            <div className={s.wideBlock}>
              <div className={s.wideTitle}>Түүх</div>
              <div className={s.wideText}>
                Түүх дээр бүх оролдлого хадгалагдана. Test filter, Best only, Sort (Date/Accuracy/Key) ашиглаж болно.
              </div>
            </div>

            <div className={s.wideBlock}>
              <div className={s.wideTitle}>CSV татах</div>
              <div className={s.wideText}>
                Оролдлого бүрийн дэлгэрэнгүй дээрээс CSV болгон татаж авч судалгаа/тайландаа ашиглана.
              </div>
            </div>
          </div>

          <div className={s.cardActions}>
            <Link className={s.ghostBtn} href="/history">
              Түүх рүү очих →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
