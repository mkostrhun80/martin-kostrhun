'use client';

import { useEffect, type RefObject } from 'react';

/** The reference's heading entrance and staggered text popups, only in Contents. */
export function useContentsTextPopups(ref: RefObject<HTMLDivElement | null>, sectionKey: string) {
  useEffect(() => {
    const copy = ref.current;
    if (!copy || typeof HTMLElement.prototype.animate !== 'function' || !('IntersectionObserver' in window)) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let stop = () => {};

    const enhance = () => {
      const pending = new Map<HTMLElement, Animation>();
      const finish = (element: HTMLElement) => {
        pending.get(element)?.cancel();
        pending.delete(element);
        element.classList.remove('contents-text-popup');
      };
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          pending.get(element)?.play();
          observer.unobserve(element);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: .15 });

      const prepare = (element: HTMLElement, heading: boolean, delay: number) => {
        const distance = Math.min(110, element.getBoundingClientRect().width * .24);
        const frames: Keyframe[] = heading ? [
          { opacity: 0, transform: `translate3d(${-distance}px, 26px, 0) scale(.82)`, offset: 0, easing: 'cubic-bezier(.16,1,.3,1)' },
          { opacity: 1, transform: 'translate3d(4px,-3px,0) scale(1.035)', offset: .72, easing: 'ease-out' },
          { opacity: 1, transform: 'none', offset: 1 },
        ] : [
          { opacity: 0, transform: 'translate3d(12px,26px,0) scale(.86)', offset: 0, easing: 'cubic-bezier(.16,1,.3,1)' },
          { opacity: 1, transform: 'translate3d(0,-3px,0) scale(1.025)', offset: .74, easing: 'ease-out' },
          { opacity: 1, transform: 'none', offset: 1 },
        ];
        frames.forEach(frame => { frame.transformOrigin = '0% 65%'; });
        const animation = element.animate(frames, { duration: heading ? 1250 : 950, delay, fill: 'both' });
        animation.pause();
        animation.currentTime = 0;
        element.classList.add('contents-text-popup');
        pending.set(element, animation);
        void animation.finished.then(() => finish(element)).catch(() => {});
        observer.observe(element);
      };

      const heading = copy.querySelector<HTMLElement>('h2');
      const subtitle = copy.querySelector<HTMLElement>('.section-heading > p');
      if (heading) prepare(heading, true, 0);
      if (subtitle) prepare(subtitle, false, 220);
      copy.querySelectorAll<HTMLElement>('.index-grid > a').forEach((card, index) => {
        // Animate inside each link so the existing photo-arrival transform stays intact.
        card.querySelectorAll<HTMLElement>('.index-label, p').forEach((element, part) => {
          prepare(element, false, 180 + index * 180 + part * 110);
        });
      });
      const focus = (event: FocusEvent) => {
        if (!(event.target instanceof Element)) return;
        const card = event.target.closest('.index-grid > a');
        if (card) pending.forEach((_, element) => {
          if (card.contains(element)) { finish(element); observer.unobserve(element); }
        });
      };
      copy.addEventListener('focusin', focus);
      return () => {
        observer.disconnect();
        copy.removeEventListener('focusin', focus);
        pending.forEach((_, element) => finish(element));
      };
    };
    const sync = () => { stop(); stop = preference.matches ? () => {} : enhance(); };
    sync();
    preference.addEventListener('change', sync);
    return () => { stop(); preference.removeEventListener('change', sync); };
  }, [ref, sectionKey]);
}
