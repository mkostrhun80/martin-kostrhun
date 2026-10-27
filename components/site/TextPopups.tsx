'use client';

import { useEffect } from 'react';

const targets = '#main h2, #main h3, #main h4, #main p, #main .motion-title-line, #main .index-label';
const excluded = '.hero-signature, .sr-only, form, details, [role="alert"], [role="status"], .email-notice, .form-error, .form-status';

/** Animate the existing text nodes without splitting words or changing layout. */
export function TextPopups() {
  useEffect(() => {
    const main = document.getElementById('main');
    if (!main || typeof HTMLElement.prototype.animate !== 'function') return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let stop = () => {};

    function enhance() {
      const seen = new WeakSet<HTMLElement>();
      const pending = new Map<HTMLElement, Animation | null>();
      let disposed = false;
      function complete(element: HTMLElement) {
        pending.get(element)?.cancel();
        pending.delete(element);
        element.classList.remove('text-popup-pending', 'text-popup-running');
      }
      function play(element: HTMLElement, delay: number) {
        if (!pending.has(element) || pending.get(element)) return;
        const heading = element.matches('h2, h3, h4, .motion-title-line');
        const x = heading ? Math.min(110, element.getBoundingClientRect().width * .23) : 0;
        const frames: Keyframe[] = heading ? [
          { opacity: 0, transform: `translate3d(${-x}px, 34px, 0) scale(.84)`, filter: 'blur(3px)', offset: 0, easing: 'cubic-bezier(.16,1,.3,1)' },
          { opacity: 1, transform: 'translate3d(5px,-4px,0) scale(1.035)', filter: 'blur(0)', offset: .68, easing: 'ease-out' },
          { opacity: 1, transform: 'translate3d(-1px,1px,0) scale(.997)', filter: 'blur(0)', offset: .86, easing: 'ease-out' },
          { opacity: 1, transform: 'none', filter: 'blur(0)', offset: 1 },
        ] : [
          { opacity: 0, transform: 'translate3d(0,22px,0) scale(.95)', filter: 'blur(2px)', offset: 0, easing: 'cubic-bezier(.16,1,.3,1)' },
          { opacity: 1, transform: 'translate3d(0,-2px,0) scale(1.008)', filter: 'blur(0)', offset: .76, easing: 'ease-out' },
          { opacity: 1, transform: 'none', filter: 'blur(0)', offset: 1 },
        ];
        element.classList.replace('text-popup-pending', 'text-popup-running');
        const animation = element.animate(frames, { duration: heading ? 1350 : 1050, delay, fill: 'both' });
        pending.set(element, animation);
        void animation.finished.then(() => { if (!disposed) complete(element); }).catch(() => {});
      }
      const observer = new IntersectionObserver(changes => {
        const groups = new Map<Element, number>();
        changes.forEach(change => {
          if (!change.isIntersecting) return;
          const element = change.target as HTMLElement;
          const group = element.closest('.section-heading, .services-intro, .service-item, .about-copy, .cooperation-brief li, .partners-summary, .scene') ?? element.parentElement!;
          const order = groups.get(group) ?? 0;
          groups.set(group, order + 1);
          const card = element.closest<HTMLElement>('.index-grid > a');
          const cardOrder = card?.parentElement ? Array.from(card.parentElement.children).indexOf(card) : 0;
          const delay = card ? cardOrder * 150 + (element.matches('p') ? 110 : 0) : Math.min(order * 100, 350);
          play(element, delay);
          observer.unobserve(element);
        });
      }, { rootMargin: '0px 0px -5% 0px', threshold: .08 });

      function prepare(element: HTMLElement) {
        if (seen.has(element) || element.closest(excluded) || !element.textContent?.trim()) return;
        // The about heading already has two block lines; animate each line once.
        if (element.matches('h2') && element.querySelector('.motion-title-line')) return;
        seen.add(element);
        pending.set(element, null);
        element.classList.add('text-popup-pending');
        observer.observe(element);
      }
      function scan(node: HTMLElement) {
        if (node.matches(targets)) prepare(node);
        node.querySelectorAll<HTMLElement>(targets).forEach(prepare);
      }
      scan(main!);
      const updates = new MutationObserver(changes => {
        changes.forEach(change => change.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) scan(node);
        }));
      });
      updates.observe(main!, { childList: true, subtree: true });
      const focus = (event: FocusEvent) => {
        if (!(event.target instanceof Node)) return;
        const target = event.target;
        const link = target instanceof Element ? target.closest('a, button') : null;
        pending.forEach((_, element) => {
          if (element.contains(target) || link?.contains(element)) {
            complete(element);
            observer.unobserve(element);
          }
        });
      };
      document.addEventListener('focusin', focus);
      return () => {
        disposed = true;
        observer.disconnect(); updates.disconnect();
        document.removeEventListener('focusin', focus);
        pending.forEach((_, element) => complete(element));
      };
    }
    const sync = () => { stop(); stop = preference.matches ? () => {} : enhance(); };
    sync();
    preference.addEventListener('change', sync);
    return () => { stop(); preference.removeEventListener('change', sync); };
  }, []);
  return null;
}
