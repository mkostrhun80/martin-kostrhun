import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/site/Navigation';
import { Footer } from '@/components/site/Sections';
import { LegalInformation, PrivacyInformation, CookiesInformation } from '@/components/site/LegalDocuments';

const pages = {
  'pravni-informace': { title: 'Právní informace', Content: LegalInformation },
  'osobni-udaje': { title: 'Ochrana osobních údajů', Content: PrivacyInformation },
  'cookies': { title: 'Zásady cookies', Content: CookiesInformation },
};

export function generateStaticParams() {
  return Object.keys(pages).map(slug => ({ slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug as keyof typeof pages];
  return { title: page ? `${page.title} | Martin Kostrhun` : 'Stránka nenalezena', robots: { index: false, follow: true } };
}
export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug as keyof typeof pages];
  if (!page) notFound();
  const { Content } = page;
  return <><Navigation isHome={false}/><main id="main" className="legal-main">
    <p className="eyebrow">MARTIN KOSTRHUN / DOKUMENTY</p>
    <h1>{page.title}</h1>
    <nav className="legal-navigation" aria-label="Právní dokumenty">
      {Object.entries(pages).map(([id, document]) => <Link key={id} href={`/dokumenty/${id}`} aria-current={id === slug ? 'page' : undefined}>{document.title}</Link>)}
    </nav>
    <div className="legal-content"><Content/></div>
    <p className="legal-updated">Poslední aktualizace: <time dateTime="2026-10-09">9. října 2026</time></p>
    <Link className="back" href="/">← ZPĚT NA WEB</Link>
  </main><Footer/></>;
}
