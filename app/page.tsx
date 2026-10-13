import { pageMetadata } from '@/lib/metadata';
import { Navigation } from '@/components/site/Navigation';
import { Hero } from '@/components/site/Hero';
import { Contents, ScrollContents } from '@/components/site/Contents';
import { Motion } from '@/components/site/Motion';
import { Services } from '@/components/site/Services';
import { About, Contact, Footer } from '@/components/site/Sections';
import { Trust, FAQ } from '@/components/site/TrustAndFAQ';
import { Partners } from '@/components/site/Partners';
export const metadata = pageMetadata('Martin Kostrhun | Finanční specialista');
export default function Home() { return <><Navigation /><main id="main"><div className="hero-about-sequence"><Hero /><Contents /><Services /><Motion /></div><About /><Trust /><FAQ /><Contact /><Partners /></main><ScrollContents /><Footer /></>; }
