/* eslint-disable @next/next/no-img-element */
import { assets } from '@/lib/site-config';
/** A decorative travelling photograph; the semantic originals stay in their sections. */
export function HeroHandoff() {
  return <div className="hero-photo-handoff" aria-hidden="true">
    <img className="handoff-from" src={assets.heroPortrait} alt="" width="800" height="1200"/>
    <img className="handoff-to" src={assets.aboutPortrait} alt="" width="800" height="1200"/>
  </div>;
}
