'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, BriefcaseBusiness, Home, MessageCircle, Phone, Route, UserRound, X } from 'lucide-react';
import { indexSections, siteSections, type SectionId } from '@/lib/site-sections';
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
    <figure className="index-photo journey-destination"><img src={assets.contentsPortrait} alt={assets.contentsAlt} width="800" height="1200" loading="eager" draggable={false}/></figure>
    <div ref={copy} className="index-copy"><div className="section-heading"><h2 id="contents-heading">Na webu najdete<span>.</span></h2><p>Vyberte si, co vás zajímá.</p></div>
      <nav className="index-grid" aria-label="Rychlé odkazy na části webu">{indexSections.map(s => <a key={s.id} className={s.id === 'kontakt' ? 'index-contact' : 'index-card'} href={`#${s.id}`}><span className="index-icon"><SectionIcon id={s.id}/></span><span className="index-label">{s.label}<ArrowUpRight size={18} aria-hidden="true"/></span><p>{s.description}</p></a>)}</nav>
    </div>
  </section>;
}

function useActiveSection() {
  const [active, setActive] = useState<SectionId>('domu');
  useEffect(() => {
    let frame = 0, dirty = true;
    let offsets: { id: SectionId; top: number }[] = [];
    const update = () => {
      frame = 0;
      // All geometry is read together, only after a layout change.
      if (dirty) {
        offsets = siteSections.flatMap(({ id }) => {
          const el = document.getElementById(id);
          return el ? [{ id, top: el.getBoundingClientRect().top + scrollY }] : [];
        });
        dirty = false;
      }
      let id: SectionId = 'domu';
      for (const section of offsets) if (section.top <= scrollY + innerHeight * .3) id = section.id;
      setActive(current => current === id ? current : id);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const measure = () => { dirty = true; schedule(); };
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', measure);
    document.fonts.ready.then(measure); update();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); removeEventListener('scroll', schedule); removeEventListener('resize', measure); };
  }, []);
  return active;
}

export function ScrollContents() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection();
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const suppressFocus = useRef(false);
  const closeAndFocus = () => {
    suppressFocus.current = true; setOpen(false); trigger.current?.focus();
    requestAnimationFrame(() => { suppressFocus.current = false; });
  };
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        if (root.current?.contains(document.activeElement)) {
          suppressFocus.current = true; trigger.current?.focus();
          requestAnimationFrame(() => { suppressFocus.current = false; });
        }
      }
    };
    addEventListener('pointerdown', outside); addEventListener('keydown', escape);
    return () => { removeEventListener('pointerdown', outside); removeEventListener('keydown', escape); };
  }, []);
  const choose = (id: string) => {
    setOpen(false);
    requestAnimationFrame(() => { const el = document.getElementById(id); el?.setAttribute('tabindex', '-1'); el?.focus({ preventScroll: true }); });
  };
  return <aside ref={root} className="contents-rail" data-open={open} aria-label="Obsah webu"
    onMouseEnter={() => { if (matchMedia('(hover:hover) and (pointer:fine)').matches) setOpen(true); }}
    onMouseLeave={() => { if (!root.current?.contains(document.activeElement)) setOpen(false); }}
    onFocus={event => { if (event.target instanceof Element && event.target.closest('.contents-rail-panel')) setOpen(true); }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <nav className="quick-navigation" aria-label="Rychlé ovládání webu"><button ref={trigger} type="button" className="contents-rail-trigger" aria-expanded={open} aria-controls="contents-rail-panel" onClick={() => setOpen(true)} onFocus={() => { if (!suppressFocus.current) setOpen(true); }}>
      <span className="contents-ticks" aria-hidden="true">{siteSections.map(s => <i key={s.id} className={active === s.id ? 'is-current' : undefined}/>)}</span><span className="contents-mobile-label">Obsah</span><span className="sr-only contents-desktop-label">Otevřít obsah webu</span>
    </button><a className="quick-contact" href="#kontakt" onClick={() => choose('kontakt')}>Kontakt<ArrowUpRight size={16} aria-hidden="true"/></a></nav>
    <div id="contents-rail-panel" className="contents-rail-panel" inert={!open}>
      <div className="contents-rail-heading"><strong>Obsah</strong><button type="button" aria-label="Zavřít obsah" onClick={closeAndFocus}><X size={16}/></button></div>
      <nav aria-label="Části webu">{siteSections.map(s => <a key={s.id} href={`#${s.id}`} aria-current={active === s.id ? 'location' : undefined} onClick={() => choose(s.id)}>{s.label}</a>)}</nav>
    </div>
    <noscript><style>{'.contents-rail{position:static;transform:none;padding:24px 5vw}.contents-rail .quick-navigation{display:none}.contents-nojs{position:static;width:auto}'}</style><nav className="contents-nojs" aria-label="Části webu bez JavaScriptu">{siteSections.map(s => <a key={s.id} href={`#${s.id}`}>{s.label}</a>)}</nav></noscript>
  </aside>;
}
