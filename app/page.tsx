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
const sectionComponents = { 'o-mne': About, sluzby: Services, spoluprace: Cooperation, otazky: FAQ, kontakt: Contact, zkusenosti: Trust, zazemi: Partners };
export const metadata = pageMetadata('Martin Kostrhun | Finanční specialista');
export default function Home() { return <><script dangerouslySetInnerHTML={{ __html: homeIntroBootstrap }}/><SignatureIntro/><main id="main" tabIndex={-1}><div className="hero-about-sequence"><Hero /><Contents /><Motion /></div>{contentSections.map(({ id }) => { const Section = sectionComponents[id as keyof typeof sectionComponents]; return <Section key={id}/>; })}</main><HomeScrollReady/><ScrollContents /><Footer /></>; }
