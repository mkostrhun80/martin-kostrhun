import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Martin Kostrhun | Finanční specialista",
  description: "Finance, ve kterých máte jasno. Martin Kostrhun, finanční specialista eDO finance v Hradci Králové. Bydlení, investice, pojištění a dlouhodobý plán.",
  openGraph: { title: "Martin Kostrhun | Finanční specialista", description: "Finance, ve kterých máte jasno. Osobně. Srozumitelně. Dlouhodobě.", locale: "cs_CZ", type: "website" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="cs"><body>{children}</body></html> }
