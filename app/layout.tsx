import "../styles/globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "MK 2-Stage Test",
  description: "Threat/Neutral two-choice test with history & comparison",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body>
        <Navbar />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
