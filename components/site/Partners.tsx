'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import { partners, partnerCategories, partnersSource, type PartnerCategory } from '@/lib/partners';
import { advancePartners, canAutoplay, coverPose, nearbyRange } from '@/lib/partner-motion';
import { sitePath } from '@/lib/site-path';

export function Partners() {
  const [category, setCategory] = useState<PartnerCategory | 'Všichni'>('Všichni');
  const [active, setActive] = useState(0), [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const scroller = useRef<HTMLDivElement>(null), region = useRef<HTMLElement>(null);
  const shown = category === 'Všichni' ? partners : partners.filter(partner => partner.category === category);
  const manualControl = useRef<() => void>(() => {});

  useEffect(() => {
    const root = scroller.current, section = region.current;
    if (!root || !section) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>('.partner-cover-item')).map(card => ({ card, cover: card.querySelector<HTMLElement>('.partner-cover')!, center: 0, width: 1, last: '' }));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, width = 1, max = 0, direction = 1, previous = 0, autoLeft = root.scrollLeft;
    let visible = false, hovered = section.matches(':hover') && matchMedia('(hover:hover)').matches, focused = section.contains(document.activeElement), manual = false;
    let dirty = true, first = 0, last = -1, current = -1;
    root.dataset.enhanced = 'true';
    const runnable = () => canAutoplay({ playing, reduced: reduced.matches, visible, hidden: document.hidden, hovered, focused, manual });
    const measure = () => {
      width = root.clientWidth; max = Math.max(0, root.scrollWidth - width);
      const geometry = cards.map(({ card }) => ({ center: card.offsetLeft + card.offsetWidth / 2, width: card.offsetWidth }));
      cards.forEach((item, index) => { Object.assign(item, geometry[index]); item.last = ''; });
      dirty = true; wake();
    };
    const draw = () => {
      const left = root.scrollLeft;
      const [nextFirst, nextLast] = nearbyRange(cards, left, width);
      // Remove costly compositor layers/reflections from all covers leaving the small active range.
      for (let i = first; i <= last; i++) if (i < nextFirst || i > nextLast) { cards[i].card.classList.remove('is-near'); cards[i].last = ''; }
      for (let i = nextFirst; i <= nextLast; i++) {
        const item = cards[i], pose = coverPose(item, left, width, reduced.matches);
        const key = [pose.turn.toFixed(2), pose.scale.toFixed(4), pose.depth.toFixed(2)].join('/');
        if (i < first || i > last) item.card.classList.add('is-near');
        if (item.last !== key) {
          item.last = key; item.card.style.zIndex = String(pose.z);
          item.cover.style.setProperty('--cover-turn', `${pose.turn}deg`);
          item.cover.style.setProperty('--cover-scale', String(pose.scale));
          item.cover.style.setProperty('--cover-depth', `${pose.depth}px`);
        }
      }
      first = nextFirst; last = nextLast;
      const step = cards.length > 1 ? cards[1].center - cards[0].center : 1;
      const closest = Math.max(0, Math.min(cards.length - 1, Math.round((left + width / 2 - (cards[0]?.center || 0)) / step)));
      if (closest !== current) { current = closest; setActive(closest); }
    };
    function tick(now: number) {
      frame = 0;
      if (document.hidden || !visible) { previous = 0; return; }
      if (runnable()) {
        if (!previous) autoLeft = root!.scrollLeft;
        // Keep the fractional accumulator: browsers may round scrollLeft to whole pixels.
        const next = advancePartners(autoLeft, direction, max, previous ? (now - previous) / 1000 : 0);
        autoLeft = next.left; root!.scrollLeft = autoLeft; direction = next.direction; dirty = true;
      }
      previous = now;
      if (dirty) { draw(); dirty = false; }
      if (runnable() && max > 1) frame = requestAnimationFrame(tick); else previous = 0;
    }
    function wake() { if (visible && !document.hidden && !frame) frame = requestAnimationFrame(tick); }
    const scroll = () => { dirty = true; wake(); };
    // Manual interaction pauses until the visitor explicitly presses Play.
    const stopManually = () => { manual = true; setPlaying(false); wake(); };
    manualControl.current = stopManually;
    const enter = () => { hovered = true; wake(); };
    const leave = () => { hovered = false; previous = 0; wake(); };
    const focus = () => { focused = true; wake(); };
    const blur = (event: FocusEvent) => { focused = section.contains(event.relatedTarget as Node | null); previous = 0; wake(); };
    const visibility = () => { previous = 0; if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else wake(); };
    const motion = () => { setReducedMotion(reduced.matches); dirty = true; wake(); };
    const intersection = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      root.dataset.visible = String(visible);
      if (!visible) { cancelAnimationFrame(frame); frame = 0; previous = 0; } else { dirty = true; wake(); }
    });
    intersection.observe(root);
    const resize = new ResizeObserver(measure); resize.observe(root);
    section.addEventListener('pointerenter', enter); section.addEventListener('pointerleave', leave);
    section.addEventListener('focusin', focus); section.addEventListener('focusout', blur);
    root.addEventListener('scroll', scroll, { passive: true });
    root.addEventListener('pointerdown', stopManually, { passive: true });
    root.addEventListener('wheel', stopManually, { passive: true });
    document.addEventListener('visibilitychange', visibility); reduced.addEventListener('change', motion);
    queueMicrotask(() => setReducedMotion(reduced.matches)); measure();
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); intersection.disconnect();
      section.removeEventListener('pointerenter', enter); section.removeEventListener('pointerleave', leave);
      section.removeEventListener('focusin', focus); section.removeEventListener('focusout', blur);
      root.removeEventListener('scroll', scroll); root.removeEventListener('pointerdown', stopManually); root.removeEventListener('wheel', stopManually);
      document.removeEventListener('visibilitychange', visibility); reduced.removeEventListener('change', motion);
    };
  }, [category, playing]);

  const goTo = (index: number) => {
    manualControl.current();
    const root = scroller.current, card = root?.querySelectorAll<HTMLElement>('.partner-cover-item')[index];
    if (!root || !card) return;
    root.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - root.clientWidth / 2, behavior: reducedMotion ? 'instant' : 'smooth' });
  };
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const next = event.key === 'ArrowRight' ? Math.min(shown.length - 1, active + 1) : event.key === 'ArrowLeft' ? Math.max(0, active - 1) : event.key === 'Home' ? 0 : event.key === 'End' ? shown.length - 1 : null;
    if (next !== null) { event.preventDefault(); goTo(next); }
  };
  const current = shown[Math.min(active, shown.length - 1)];
  return <section ref={region} id="zazemi" className="page-section partners-new partners-coverflow" aria-labelledby="partners-heading">
    <div className="partners-summary"><div><h2 id="partners-heading">Zázemí eDO finance<span>.</span></h2><p>Možnosti napříč finančním trhem. Konkrétní nabídku posuzuji podle vaší situace.</p></div></div>
    <div className="partner-category" role="group" aria-label="Oblast partnerů">{(['Všichni', ...partnerCategories] as const).map(value => <button type="button" key={value} aria-pressed={category === value} onClick={() => { setCategory(value); if (scroller.current) scroller.current.scrollLeft = 0; }}>{value}</button>)}</div>
    <p className="sr-only" id="partner-scroll-help">Partnery posunete vodorovně prstem, posuvníkem nebo tlačítky. Po zaměření pásu fungují šipky, Home a End. Svislé kolečko posouvá stránku.</p>
    <div ref={scroller} className="partner-cover-scroller" role="region" aria-label="Partneři eDO finance" aria-describedby="partner-scroll-help" tabIndex={0} onKeyDown={keyboard}>
      <ul className="partner-cover-track">{shown.map(partner => <li key={partner.name} className="partner-cover-item"><figure className="partner-cover"><div className="partner-cover-logo">{partner.logo ? <img className={partner.logoLight ? 'logo-light' : undefined} src={sitePath(partner.logo)} alt="" width="220" height="100" loading="lazy"/> : <strong>{partner.shortName}</strong>}</div><figcaption><strong>{partner.shortName}</strong><span>{partner.category}</span></figcaption></figure></li>)}</ul>
    </div>
    <div className="partner-cover-controls"><p aria-live="off"><strong>{current?.shortName}</strong><span>{Math.min(active + 1, shown.length)} / {shown.length}</span></p><div className="partner-cover-arrows">
      <button type="button" className="partner-play" disabled={reducedMotion} aria-pressed={playing && !reducedMotion} onClick={() => setPlaying(value => !value)}>{playing && !reducedMotion ? <Pause size={17} aria-hidden="true"/> : <Play size={17} aria-hidden="true"/>}<span>{reducedMotion ? 'Pohyb omezen' : playing ? 'Pozastavit' : 'Přehrát'}</span></button>
      <button type="button" aria-label="Předchozí partner" disabled={active === 0} onClick={() => goTo(active - 1)}><ArrowLeft size={20} aria-hidden="true"/></button><button type="button" aria-label="Další partner" disabled={active >= shown.length - 1} onClick={() => goTo(active + 1)}><ArrowRight size={20} aria-hidden="true"/></button>
    </div></div>
    <a className="text-inline" href={partnersSource} target="_blank" rel="noreferrer">Úplné informace o partnerech eDO finance <ArrowUpRight size={16} aria-hidden="true"/></a>
  </section>;
}
