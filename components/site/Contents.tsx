'use client';
/* eslint-disable @next/next/no-img-element */
import { useRef } from 'react';
import { ArrowUpRight, BookOpen, BriefcaseBusiness, Home, MessageCircle, Phone, Route, UserRound } from 'lucide-react';
import { indexSections } from '@/lib/site-sections';
import { assets } from '@/lib/site-config';
import { useContentsTextPopups } from './useContentsTextPopups';

const icons = { domu: Home, sluzby: BriefcaseBusiness, 'o-mne': UserRound, zkusenosti: MessageCircle, otazky: MessageCircle, kontakt: Phone, spoluprace: Route };
export function SectionIcon({ id }: { id: string }) {
  const Icon = icons[id as keyof typeof icons] || BookOpen;
  return <Icon size={18} strokeWidth={1.6} aria-hidden="true"/>;
}
export function Contents() {
  const copy = useRef<HTMLDivElement>(null);
  useContentsTextPopups(copy, indexSections.map(section => section.id).join(','));
  return <section id="obsah" className="index-section index-scene index-balanced page-section" aria-labelledby="contents-heading">
    <figure className="index-photo journey-destination"><img src={assets.contentsPortrait} alt={assets.contentsAlt} width="1600" height="900" loading="eager" draggable={false}/></figure>
    <div ref={copy} className="index-copy"><div className="section-heading"><h2 id="contents-heading">Na webu najdete<span>.</span></h2><p>Vyberte si, co vás zajímá.</p></div>
      <nav className="index-grid" aria-label="Rychlé odkazy na části webu">{indexSections.map(s => <a key={s.id} className={s.id === 'kontakt' ? 'index-contact' : 'index-card'} href={`#${s.id}`}><span className="index-icon"><SectionIcon id={s.id}/></span><span className="index-label">{s.label}<ArrowUpRight size={18} aria-hidden="true"/></span><p>{s.description}</p></a>)}</nav>
    </div>
  </section>;
}

export { ScrollContents } from './ScrollContents';
