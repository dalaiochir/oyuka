"use client";

import Link from "next/link";
import styles from "../styles/Navbar.module.css";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const nav = [
    { href: "/", label: "Нүүр" },
    { href: "/instructions", label: "Заавар" },
    { href: "/test", label: "Тест" },
    { href: "/history", label: "Түүх" },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>MK Test</div>
        <nav className={styles.nav}>
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`${styles.link} ${pathname === n.href ? styles.active : ""}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
