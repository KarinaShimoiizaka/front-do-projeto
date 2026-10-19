import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-raleway",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EMPREST.AI",
  description: "Empréstimo de equipamentos de TI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={raleway.variable}
      style={
        {
          "--font-heading": "var(--font-raleway)",
          "--font-body": "var(--font-raleway)",
        } as React.CSSProperties
      }
    >
      <body className="min-h-[820px]">{children}</body>
    </html>
  );
}
