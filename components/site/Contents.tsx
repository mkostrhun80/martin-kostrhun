'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, BriefcaseBusiness, Home, MessageCircle, Phone, UserRound, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { visibleSections } from '@/lib/public-data';
import { sitePath } from '@/lib/site-path';
import { useSiteData } from './SiteData';
import { AppointmentLink } from './AppointmentLink';

const icons = { domu: Home, sluzby: BriefcaseBusiness, 'o-mne': UserRound, zkusenosti: MessageCircle, otazky: MessageCircle, kontakt: Phone };
export function SectionIcon({ id }: { id: string }) {
  const Icon = icons[id as keyof typeof icons] || BookOpen;
  return <Icon size={18} strokeWidth={1.6} aria-hidden="true"/>;
}
export function Contents() {
  const sections = visibleSections(useSiteData());
  return <section id="obsah" className="index-section index-scene page-section" aria-labelledby="contents-heading">
    <div className="index-copy"><div className="section-heading"><h2 id="contents-heading">Na webu najdete<span>.</span></h2><p>Vyberte si, co vás zajímá.</p></div>
      <nav className="index-grid" aria-label="Rychlé odkazy na části webu"><span className="journey-destination" aria-hidden="true"/>{sections.map(s => <a key={s.id} href={`#${s.id}`}><span className="index-icon"><SectionIcon id={s.id}/></span><span className="index-label">{s.label}<ArrowUpRight size={18} aria-hidden="true"/></span><p>{s.description}</p></a>)}</nav>
    </div>
  </section>;
}

export function usePageProgress(enabled = true) {
  const sections = visibleSections(useSiteData());
  const [state, setState] = useState({ active: 'domu', progress: 0, positions: {} as Record<string, number> });
  const key = sections.map(s => s.id).join(',');
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      let active = 'domu';
      const positions: Record<string, number> = {};
      for (const id of key.split(',')) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        positions[id] = Math.max(0, Math.min(100, (r.top + scrollY) / max * 100));
        if (r.top <= Math.min(innerHeight * .35, 220)) active = id;
      }
      setState({ active, positions, progress: Math.max(0, Math.min(1, scrollY / max)) });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    const observer = new ResizeObserver(schedule); observer.observe(document.body);
    document.fonts.ready.then(schedule);
    addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', schedule); addEventListener('hashchange', schedule);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); removeEventListener('scroll', schedule); removeEventListener('resize', schedule); removeEventListener('hashchange', schedule); };
  }, [key, enabled]);
  return { ...state, sections };
}

/** Shared by the header and the desktop rail, with the same labels and anchors. */
export function ContentsPanel({ isHome = true, active = 'domu', progress = 0, choose }: {
  isHome?: boolean; active?: string; progress?: number; choose: (id: string) => void;
}) {
  const sections = visibleSections(useSiteData());
  const prefix = isHome ? '' : sitePath('/');
  const all = [{ id: 'domu', label: 'Úvod', description: 'Martin Kostrhun · finanční specialista' }, ...sections];
  return <><div className="contents-panel-heading"><span className="menu-symbol"><BookOpen size={22} aria-hidden="true"/></span><div><DialogTitle>Obsah webu</DialogTitle><DialogDescription>Přejděte přímo tam, kam potřebujete.</DialogDescription></div><DialogClose className="glass-close" aria-label="Zavřít obsah"><X size={20}/></DialogClose></div>{isHome && <div className="menu-progress"><span>Procházení webu</span><strong>{Math.round(progress * 100)} %</strong><div><i style={{ transform: `scaleX(${progress})` }}/></div></div>}<nav className="contents-panel-links" aria-label="Obsah webu">{all.map(s => <a key={s.id} href={`${prefix}#${s.id}`} aria-current={isHome && active === s.id ? 'location' : undefined} onClick={() => choose(s.id)}><span className="menu-link-icon"><SectionIcon id={s.id}/></span><span><strong>{s.label}</strong><small>{s.description}</small></span><ArrowUpRight size={17} aria-hidden="true"/></a>)}</nav><div className="contents-panel-contact"><AppointmentLink isHome={isHome} onNavigate={() => choose('kontakt')}/></div></>;
}

export function ScrollContents() {
  const { active, progress, positions, sections } = usePageProgress();
  const [open, setOpen] = useState(false);
  const target = useRef<string | null>(null);
  const choose = (id: string) => { target.current = id; setOpen(false); };
  const current = active === 'domu' ? 'Úvod' : sections.find(s => s.id === active)?.label || 'Úvod';
  return <aside className="scroll-contents" aria-label="Průchod webem"><Dialog open={open} onOpenChange={setOpen}><DialogTrigger className="scroll-trigger" aria-label="Otevřít postranní obsah webu"><BookOpen size={17} aria-hidden="true"/><span className="scroll-track" aria-hidden="true"><i style={{ transform: `scaleY(${progress})` }}/>{sections.map(s => <b key={s.id} className={active === s.id ? 'active' : ''} style={{ top: `${positions[s.id] ?? 0}%` }}/>)}</span><span className="scroll-percent" aria-hidden="true">{Math.round(progress * 100)}</span><span className="scroll-tooltip">{current}<small>Otevřít obsah</small></span></DialogTrigger><DialogContent className="contents-dialog side-contents-dialog" showCloseButton={false} overlayClassName="contents-overlay" onCloseAutoFocus={e => {
    if (!target.current) return;
    e.preventDefault(); const id = target.current; target.current = null;
    requestAnimationFrame(() => { const el = document.getElementById(id); el?.setAttribute('tabindex', '-1'); el?.focus({ preventScroll: true }); });
  }}><ContentsPanel active={active} progress={progress} choose={choose}/></DialogContent></Dialog></aside>;
}
