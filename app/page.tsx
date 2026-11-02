import { pageMetadata } from '@/lib/metadata';
import { Hero } from '@/components/site/Hero';
import { Contents, ScrollContents } from '@/components/site/Contents';
import { Motion } from '@/components/site/Motion';
import { Services } from '@/components/site/Services';
import { About, Contact, Footer } from '@/components/site/Sections';
import { Trust, FAQ } from '@/components/site/TrustAndFAQ';
import { Partners } from '@/components/site/Partners';
import { SignatureIntro } from '@/components/site/SignatureIntro';
import { homeIntroBootstrap } from '@/lib/home-intro';
import { HomeScrollReady } from '@/components/site/HomeScrollReady';
import { Cooperation } from '@/components/site/Cooperation';
import { contentSections } from '@/lib/site-sections';
import { siteConfig } from '@/lib/site-config';
import { homeStructuredData, serializeStructuredData } from '@/lib/structured-data';
const sectionComponents = { 'o-mne': About, sluzby: Services, spoluprace: Cooperation, otazky: FAQ, kontakt: Contact, zkusenosti: Trust, zazemi: Partners };
export const metadata = pageMetadata(siteConfig.title);
export default function Home() {
  const structuredData = homeStructuredData();
  return <>{structuredData && <script id="home-structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(structuredData) }}/>}<script dangerouslySetInnerHTML={{ __html: homeIntroBootstrap }}/><SignatureIntro/><main id="main" tabIndex={-1}><div className="hero-about-sequence"><Hero /><Contents /><Motion /></div>{contentSections.map(({ id }) => { const Section = sectionComponents[id as keyof typeof sectionComponents]; return <Section key={id}/>; })}</main><HomeScrollReady/><ScrollContents /><Footer /></>;
}
