import { Navigation } from '@/components/site/Navigation';
import { Footer } from '@/components/site/Sections';
import { FeedbackExperience } from '@/components/site/FeedbackExperience';
export const metadata = { title: 'Zpětná vazba | Martin Kostrhun', robots: { index: false, follow: true } };
export default function FeedbackPage() { return <><Navigation isHome={false}/><main id="main" className="standalone-main"><h1>Vaše zpětná vazba<span>.</span></h1><p>Zajímá mě, co vám spolupráce přinesla a co mohu zlepšit.</p><FeedbackExperience /></main><Footer /></>; }
