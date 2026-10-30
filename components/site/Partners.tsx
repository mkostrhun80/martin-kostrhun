'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Pause, Play } from 'lucide-react';
import { partners, partnerCategories, partnersSource, type PartnerCategory } from '@/lib/partners';
import { advancePartners, canAutoplay, coverPose, partnerCardStep, partnerLoopSlots, wrapPartnerPhase } from '@/lib/partner-motion';
import { sitePath } from '@/lib/site-path';

export function Partners() {
  const [category, setCategory] = useState<PartnerCategory | 'Všichni'>('Všichni');
  const [playing, setPlaying] = useState(true), [reducedMotion, setReducedMotion] = useState(false);
  const orbit = useRef<HTMLDivElement>(null), phase = useRef(0), playingRef = useRef(true);
  const wakeRef = useRef<() => void>(() => {});
  const shown = category === 'Všichni' ? partners : partners.filter(partner => partner.category === category);
  // Short categories repeat only enough cells to fill the bounded 1360px stage.
  // The complete 68-partner list needs no duplicate DOM.
  const copies = shown.length ? Math.max(1, Math.ceil(24 / shown.length)) : 1;

  useEffect(() => { playingRef.current = playing; wakeRef.current(); }, [playing]);
  useEffect(() => {
    const root = orbit.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>('.partner-cover-item')).map(card => ({ card, cover: card.querySelector<HTMLElement>('.partner-cover')!, last: '' }));
    cards.forEach(({ card }) => card.classList.remove('is-near'));
    const count = category === 'Všichni' ? partners.length : partners.filter(partner => partner.category === category).length;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, previous = 0, width = 1, step = 1, visible = false, dirty = true, disposed = false;
    let near = new Set<number>();
    phase.current = 0;
    const runnable = () => count > 1 && canAutoplay({ playing: playingRef.current, reduced: reduced.matches, visible, hidden: document.hidden });
    const draw = () => {
      if (reduced.matches) return;
      const slots = partnerLoopSlots(phase.current, count, cards.length, width, step);
      const next = new Set(slots.map(slot => slot.index));
      for (const index of near) if (!next.has(index)) { cards[index].card.classList.remove('is-near'); cards[index].last = ''; }
      for (const { index, offset } of slots) {
        const item = cards[index], pose = coverPose({ center: width / 2 + offset, width: step }, 0, width);
        const key = offset.toFixed(3);
        if (!near.has(index)) item.card.classList.add('is-near');
        if (item.last !== key) {
          item.last = key;
          item.card.style.transform = `translate3d(${offset - step / 2}px, 0, 0)`;
          item.card.style.zIndex = String(pose.z);
          item.cover.style.setProperty('--cover-turn', `${pose.turn}deg`);
          item.cover.style.setProperty('--cover-scale', String(pose.scale));
          item.cover.style.setProperty('--cover-depth', `${pose.depth}px`);
        }
      }
      near = next;
    };
    function tick(now: number) {
      frame = 0;
      if (disposed || !visible || document.hidden) { previous = 0; return; }
      if (runnable()) { phase.current = advancePartners(phase.current, count * step, previous ? (now - previous) / 1000 : 0); dirty = true; }
      previous = now;
      if (dirty) { draw(); dirty = false; }
      if (runnable()) frame = requestAnimationFrame(tick); else previous = 0;
    }
    function wake() { if (!disposed && visible && !document.hidden && !frame) frame = requestAnimationFrame(tick); }
    wakeRef.current = wake;
    const measure = () => {
      const oldStep = step;
      root.dataset.loop = String(!reduced.matches);
      // Read geometry together; draw only writes cached poses.
      width = root.clientWidth;
      step = partnerCardStep(cards[0]?.cover.offsetWidth || 1);
      phase.current = wrapPartnerPhase(phase.current / oldStep * step, count * step);
      root.style.setProperty('--cover-step', `${step}px`);
      cards.forEach(card => { card.last = ''; });
      dirty = true; wake();
    };
    const motion = () => { setReducedMotion(reduced.matches); previous = 0; measure(); };
    const visibility = () => { previous = 0; if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else wake(); };
    const intersection = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      root.dataset.visible = String(visible);
      if (!visible) { cancelAnimationFrame(frame); frame = 0; previous = 0; } else { dirty = true; wake(); }
    });
    intersection.observe(root);
    const resize = new ResizeObserver(measure); resize.observe(root);
    reduced.addEventListener('change', motion); document.addEventListener('visibilitychange', visibility);
    queueMicrotask(() => { if (!disposed) setReducedMotion(reduced.matches); }); measure();
    return () => { disposed = true; cancelAnimationFrame(frame); intersection.disconnect(); resize.disconnect(); reduced.removeEventListener('change', motion); document.removeEventListener('visibilitychange', visibility); wakeRef.current = () => {}; };
  }, [category]);

  return <section id="zazemi" className="page-section partners-new partners-coverflow" aria-labelledby="partners-heading">
    <div className="partners-summary"><div><h2 id="partners-heading">Zázemí eDO finance<span>.</span></h2><p>Možnosti napříč finančním trhem. Konkrétní nabídku posuzuji podle vaší situace.</p></div></div>
    <div className="partner-category" role="group" aria-label="Oblast partnerů">{(['Všichni', ...partnerCategories] as const).map(value => <button type="button" key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button>)}</div>
    <div ref={orbit} className="partner-orbit" aria-hidden="true">
      <ul className="partner-cover-track">{Array.from({ length: copies }, (_, copy) => shown.map(partner => <li key={`${copy}-${partner.name}`} className="partner-cover-item" data-copy={copy > 0 ? 'true' : undefined}><figure className="partner-cover"><div className="partner-cover-logo">{partner.logo ? <img className={partner.logoLight ? 'logo-light' : undefined} src={sitePath(partner.logo)} alt="" width="220" height="100" loading="lazy"/> : <strong>{partner.shortName}</strong>}</div><figcaption><strong>{partner.shortName}</strong><span>{partner.category}</span></figcaption></figure></li>))}</ul>
    </div>
    <ul className="sr-only" aria-label="Seznam partnerů eDO finance">{shown.map(partner => <li key={partner.name}>{partner.name} — {partner.category}</li>)}</ul>
    <div className="partner-orbit-controls">
      <a className="text-inline" href={partnersSource} target="_blank" rel="noreferrer">Úplné informace o partnerech eDO finance <ArrowUpRight size={16} aria-hidden="true"/></a>
      <button type="button" className="partner-play" disabled={reducedMotion} aria-pressed={playing && !reducedMotion} onClick={() => setPlaying(value => !value)}>{playing && !reducedMotion ? <Pause size={16} aria-hidden="true"/> : <Play size={16} aria-hidden="true"/>}{reducedMotion ? 'Pohyb omezen' : playing ? 'Pozastavit pohyb' : 'Spustit pohyb'}</button>
    </div>
  </section>;
}
