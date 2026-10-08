'use client';
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { portraitHandoff } from '@/lib/portrait-handoff';

/** Native document scrolling; sticky content never adds artificial scroll distance. */
export function Motion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    let alive = true, refreshFrame = 0;
    media.add({ all: '(min-width: 0px)', mobile: '(max-width: 760px)', reduce: '(prefers-reduced-motion: reduce)' }, context => {
      const { mobile, reduce } = context.conditions!;
      if (reduce) return;
      const distance = mobile ? 18 : 55;
      const hero = document.querySelector<HTMLElement>('.hero')!;
      const sequence = document.querySelector<HTMLElement>('.hero-about-sequence')!;
      const origin = hero.querySelector<HTMLElement>(':scope > .hero-artwork > .hero-photo-layer')!;
      const destination = sequence.querySelector<HTMLElement>('.about-portrait')!;
      const handoff = sequence.querySelector<HTMLElement>('.hero-photo-handoff')!;
      const destinationImage = handoff.querySelector<HTMLElement>('.handoff-to')!;
      const sourceImage = handoff.querySelector<HTMLElement>('.handoff-from')!;
      const drawHandoff = (progress: number) => {
        const from = origin.getBoundingClientRect(), to = destination.getBoundingClientRect();
        const size = mobile ? 76 : 104;
        const margin = mobile ? 18 : 32;
        const corner = { x: margin, y: (window.innerHeight - size) / 2, size };
        const { x, y, width, height, roundness, reveal, phase } = portraitHandoff(progress, from, to, corner);
        handoff.dataset.phase = phase;
        const active = progress > 0 && progress < 1;
        const photoRadius = parseFloat(getComputedStyle(origin).borderTopLeftRadius) || 0;
        const radiusX = photoRadius + (width / 2 - photoRadius) * roundness;
        const radiusY = photoRadius + (height / 2 - photoRadius) * roundness;
        handoff.style.borderRadius = `${radiusX}px / ${radiusY}px`;
        gsap.set(handoff, { x, y, width, height,
          '--handoff-tint': roundness * .58, '--handoff-ring': `${roundness * (mobile ? 5 : 7)}px`,
          visibility: active ? 'visible' : 'hidden' });
        gsap.set(sourceImage, { opacity: 1 - reveal });
        gsap.set(destinationImage, { opacity: reveal });
        sequence.dataset.handoff = active ? 'moving' : progress >= 1 ? 'complete' : 'start';
      };
      const handoffState = { progress: 0 };
      gsap.to(handoffState, { progress: 1, ease: 'none', onUpdate: () => drawHandoff(handoffState.progress),
        scrollTrigger: { trigger: hero, start: 'top top', endTrigger: '.about-layout', end: mobile ? 'top 12%' : 'top top', scrub: 1.4,
          onRefresh: () => drawHandoff(handoffState.progress) } });
      gsap.to(hero, { '--hero-scroll-back': mobile ? '-8vw' : '-16vw', '--hero-scroll-front': mobile ? '6vw' : '14vw',
        '--hero-scroll-meta': '-14px', '--hero-scroll-progress': 1, ease: 'none',
        scrollTrigger: { id: 'hero-scene', trigger: hero, start: 'top top', end: 'bottom 15%', scrub: .55 } });
      gsap.fromTo('.about', { backgroundColor: '#eae6ef' }, { backgroundColor: '#e9e5ed', ease: 'none',
        scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'top 25%', scrub: .5 } });
      gsap.utils.toArray<HTMLElement>('.about-copy .motion-title-line').forEach((line, i) => {
        gsap.from(line, { clipPath: 'inset(0 100% 0 0)', x: (i ? 1 : -1) * distance,
          scrollTrigger: { trigger: '.about-copy', start: 'top 58%', end: 'top 24%', scrub: .5 } });
      });
      gsap.from('.statement .motion-line > span', { yPercent: 108, stagger: .17, ease: 'power3.out',
        scrollTrigger: { trigger: '.statement', start: 'top 85%', end: 'top 20%', scrub: .6 } });
      gsap.from('.statement-rule strong', { x: -distance, color: '#111014', ease: 'none',
        scrollTrigger: { trigger: '.statement-rule', start: 'top 85%', end: 'top 35%', scrub: .5 } });
      gsap.from('.statement-bottom', { x: mobile ? 0 : 30, opacity: .5,
        scrollTrigger: { trigger: '.statement-bottom', start: 'top 90%', end: 'top 65%', scrub: .5 } });
      gsap.from('.editorial-sticky figure', { clipPath: 'inset(0% 100% 0% 0%)', ease: 'power3.inOut',
        scrollTrigger: { trigger: '.editorial', start: 'top 90%', end: 'top 20%', scrub: .7 } });
      gsap.fromTo('.editorial-sticky img', { y: mobile ? 8 : 25, scale: 1.73 }, { y: mobile ? -8 : -25, scale: 1.65,
        ease: 'none', scrollTrigger: { trigger: '.editorial', start: 'top bottom', end: 'bottom top', scrub: .9 } });
      gsap.utils.toArray<HTMLElement>('.story-steps > div').forEach((step, index) => {
        gsap.from(step.querySelector('h2'), { x: (index % 2 ? -1 : 1) * distance, opacity: .45, ease: 'power2.out',
          scrollTrigger: { trigger: step, start: 'top 88%', end: 'top 28%', scrub: .6 } });
      });
      gsap.from('.services-statement', { clipPath: 'inset(0 0 100% 0)', y: 30, ease: 'power3.out',
        scrollTrigger: { trigger: '.services-statement', start: 'top 90%', end: 'top 45%', scrub: .5 } });
      gsap.utils.toArray<HTMLElement>('.service-chapter').forEach((chapter, i) => {
        gsap.from(chapter.querySelector('h2'), { x: i ? 35 : -35, ease: 'power2.out',
          scrollTrigger: { trigger: chapter, start: 'top 90%', end: 'top 42%', scrub: .5 } });
        gsap.from(chapter.querySelector('figure'), { clipPath: 'inset(0 0 100% 0)', ease: 'power3.out',
          scrollTrigger: { trigger: chapter, start: 'top 90%', end: 'top 38%', scrub: .55 } });
      });
      gsap.utils.toArray<HTMLElement>('.service-item').forEach(item => {
        gsap.to(item, { '--item-progress': 1, ease: 'none', scrollTrigger: {
          trigger: item, start: 'top 82%', end: 'top 35%', scrub: .35 } });
        gsap.from(item.querySelector('.service-item-number'), { y: 20, opacity: .35,
          scrollTrigger: { trigger: item, start: 'top 88%', end: 'top 50%', scrub: .4 } });
      });
      const approach = document.querySelector<HTMLElement>('.approach')!;
      gsap.utils.toArray<HTMLElement>('.steps article').forEach((article, index) => {
        gsap.fromTo(article.querySelector('.step-number'), { x: -15, color: '#b8aec3' }, { x: 0, color: '#7821d9', scrollTrigger: {
          trigger: article, start: 'top 83%', end: 'top 45%', scrub: .35,
          onEnter: () => updateStep(index), onEnterBack: () => updateStep(index),
        } });
      });
      function updateStep(active: number) {
        approach.querySelectorAll('.process-progress li').forEach((el,i)=>el.classList.toggle('is-current',i<=active));
      }
      gsap.fromTo('.process-progress-fill', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: {
        trigger: '.steps', start: 'top 80%', end: 'bottom 65%', scrub: .3 } });
      gsap.from('.social h2', { x: -distance / 2, scrollTrigger: {
        trigger: '.social', start: 'top 90%', end: 'top 30%', scrub: .6 } });
      const contact = gsap.timeline({ scrollTrigger: { trigger: '.contact', start: 'top 96%', end: 'top 18%', scrub: .6 } });
      contact.from('.contact-curtain', { clipPath: 'inset(15% 0 0 0)', duration: .5, ease: 'power3.out' }, 0)
        .from('.contact-composition .motion-title-line', { clipPath: 'inset(0 0 100% 0)', y: 28, stagger: .12, duration: .5, ease: 'power3.out' }, .12)
        .from('.contact-composition figure', { clipPath: 'inset(0% 0% 100% 0%)', duration: .5, ease: 'power3.inOut' }, .2);
      return () => {
        delete sequence.dataset.handoff;
        delete handoff.dataset.phase;
        handoff.removeAttribute('style');
        sourceImage.removeAttribute('style');
        destinationImage.removeAttribute('style');
        approach.querySelectorAll('.process-progress li').forEach(el=>el.classList.remove('is-current'));
      };
    });
    document.fonts.ready.then(() => { if (alive) refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh()); });
    return () => { alive = false; cancelAnimationFrame(refreshFrame); media.revert(); };
  }, []);
  return null;
}
