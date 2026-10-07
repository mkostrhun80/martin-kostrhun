import { HeroHandoff } from '@/components/site/HeroHandoff';
import { Navigation } from '@/components/site/Navigation';
import { Hero } from '@/components/site/Hero';
import { Motion } from '@/components/site/Motion';
import { Services } from '@/components/site/Services';
import { Partners } from '@/components/site/Partners';
import { MartinStatement, EditorialStory, Approach, About, Social, Contact, Footer } from '@/components/site/Sections';
export default function Home(){return <><Motion/><Navigation/><main id="main"><div className="hero-about-sequence"><Hero/><About/><HeroHandoff/></div><Approach/><MartinStatement/><EditorialStory/><Services/><Partners/><Social/><Contact/></main><Footer/></>}
