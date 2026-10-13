import { SiteData } from "@/components/site/SiteData";
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
import "./site-updates.css";
import "./professional.css";
export const metadata: Metadata = { description: "Martin Kostrhun, finanční specialista eDO finance. Bydlení, investice, pojištění a finanční plán.", icons: { icon: sitePath('/favicon.svg'), shortcut: sitePath('/favicon.svg') } };
export default function RootLayout({ children }: Readonly<{
    children: React.ReactNode;
}>) { return <html lang="cs"><body><SiteData>{children}</SiteData></body></html>; }
