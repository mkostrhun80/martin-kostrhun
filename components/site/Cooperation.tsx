'use client';

import { useEffect, useRef } from 'react';
import { steps } from '@/lib/content';
import { AppointmentLink } from './AppointmentLink';
import { ButtonLabel } from './ButtonLabel';

const stepDetails = ['Osobně i online', 'Podle vašich cílů', 'Společně', 'Průběžně'];

export function Cooperation() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (!section || reduced.matches || !('IntersectionObserver' in window) ||
        typeof HTMLElement.prototype.animate !== 'function') return;

    const animations: Animation[] = [];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const card = entry.target.querySelector<HTMLElement>('.cooperation-card');
        const dot = entry.target.querySelector<HTMLElement>('.cooperation-dot');
        if (card) animations.push(card.animate([
          { opacity: 0, transform: 'translateY(26px) scale(.98)' },
          { opacity: 1, transform: 'none' },
        ], { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)' }));
        if (dot) animations.push(dot.animate([
          { opacity: 0, transform: 'scale(.5)' },
          { opacity: 1, transform: 'scale(1)' },
        ], { duration: 500, easing: 'cubic-bezier(.16,1,.3,1)' }));
      }
    }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });

    const stop = () => {
      if (!reduced.matches) return;
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
    };
    section.querySelectorAll('.cooperation-step').forEach(step => observer.observe(step));
    reduced.addEventListener('change', stop);
    return () => {
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      reduced.removeEventListener('change', stop);
    };
  }, []);

  return <section ref={ref} id="spoluprace" className="section cooperation" aria-labelledby="cooperation-heading">
    <header className="cooperation-heading">
      <p className="eyebrow cooperation-label">POSTUP SPOLUPRÁCE</p>
      <h2 id="cooperation-heading" className="display">JAK SPOLUPRÁCE<br/><em>PROBÍHÁ.</em></h2>
    </header>
    <ol className="cooperation-timeline" role="list">
      {steps.map(([title, description], index) => <li className="cooperation-step" key={title}>
        <span className="cooperation-dot" aria-hidden="true"/>
        <article className="cooperation-card" aria-labelledby={`cooperation-step-${index + 1}`}>
          <div className="cooperation-card-meta">
            <span className="cooperation-number" aria-hidden="true">{index + 1}</span>
            <span className="cooperation-detail">{stepDetails[index]}</span>
          </div>
          <h3 id={`cooperation-step-${index + 1}`}>{title}</h3>
          <p>{description}</p>
        </article>
      </li>)}
    </ol>
    <div className="cooperation-action"><AppointmentLink><ButtonLabel>DOMLUVIT SCHŮZKU</ButtonLabel></AppointmentLink></div>
  </section>;
}
