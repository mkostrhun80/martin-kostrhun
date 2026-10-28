import { pageMetadata } from '@/lib/metadata';
import { Navigation } from '@/components/site/Navigation';
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
export const metadata = pageMetadata('Martin Kostrhun | Finanční specialista');
export default function Home() { return <><script dangerouslySetInnerHTML={{ __html: homeIntroBootstrap }}/><SignatureIntro/><Navigation /><main id="main"><div className="hero-about-sequence"><Hero /><Contents /><Motion /></div><Services /><About /><Trust /><FAQ /><Contact /><Cooperation /><Partners /></main><HomeScrollReady/><ScrollContents /><Footer /></>; }
