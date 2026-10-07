import type { Metadata } from "next";
import { sitePath } from "@/lib/site-path";
import "./globals.css";
import "./photography.css";
import "./motion.css";
import "./hero-flow.css";
import "./service-motion.css";
import "./process-layout.css";
import "./partners.css";
import "./refinement.css";
import "./interaction-patch.css";
export const metadata: Metadata = {
  title: "Martin Kostrhun | Finanční specialista",
  description: "Finance, ve kterých máte jasno. Martin Kostrhun, finanční specialista eDO finance v Hradci Králové. Bydlení, investice, pojištění a dlouhodobý plán.",
  openGraph: { title: "Martin Kostrhun | Finanční specialista", description: "Finance, ve kterých máte jasno. Osobně. Srozumitelně. Dlouhodobě.", locale: "cs_CZ", type: "website" },
  icons: { icon: sitePath("/favicon.svg"), shortcut: sitePath("/favicon.svg") },
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="cs"><body>{children}</body></html> }
