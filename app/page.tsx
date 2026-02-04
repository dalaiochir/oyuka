import Link from "next/link";

export default function HomePage() {
  return (
    <div className="card">
      <h1>2 үе шаттай үг таних тест</h1>
      <p>
        1) Заналхийлсэн (Threat) үг олох             2) Энгийн (Neutral) үг олох.
        Сонголт бүрийн дараа зөв/бурууг харуулж, төгсгөлд хугацаа + хувь + өмнөх шилдэгтэй харьцуулна.
      </p>

      <div className="row">
        <Link className="btn" href="/instructions">Заавар</Link>
        <Link className="btn primary" href="/test">Тест эхлүүлэх</Link>
        <Link className="btn" href="/history">Түүх</Link>
      </div>
    </div>
  );
}
