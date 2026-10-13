import { pageMetadata } from '@/lib/metadata';
import { Navigation } from '@/components/site/Navigation';
import { Footer } from '@/components/site/Sections';
import { AllReviews } from '@/components/site/FeedbackExperience';
export const metadata = pageMetadata('Zkušenosti klientů | Martin Kostrhun', 'zkusenosti/');
export default function ReviewsPage() { return <><Navigation isHome={false}/><main id="main" className="standalone-main"><h1>Zkušenosti klientů<span>.</span></h1><AllReviews /></main><Footer /></>; }
