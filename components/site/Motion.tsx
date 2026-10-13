'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { assets } from '@/lib/site-config';
import { clamp, ease, travelPoint } from '@/lib/traveller';
export function Motion() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        media.add('(prefers-reduced-motion: no-preference)', () => {
            const hero = document.querySelector<HTMLElement>('.hero'), photo = document.querySelector<HTMLElement>('.hero > .hero-artwork > .hero-photo-layer'), index = document.querySelector<HTMLElement>('#obsah'), target = document.querySelector<HTMLElement>('#service-dot'), root = ref.current;
            if (!hero || !photo || !index || !target || !root)
                return;
            const main = root.querySelector<HTMLElement>('.traveller-main')!, image = main.querySelector('img')!, tails = Array.from(root.querySelectorAll<HTMLElement>('.traveller-tail'));
            let from = { left: 0, top: 0, width: 0, height: 0 }, top = 0, bottom = 0, point = { x: 0, y: 0 }, end = 1;
            const state = { p: 0 };
            const measure = () => { const rect = photo.getBoundingClientRect(), ir = index.getBoundingClientRect(), tr = target.getBoundingClientRect(); from = { left: rect.left, top: rect.top + scrollY, width: rect.width, height: rect.height }; top = ir.top + scrollY; bottom = ir.bottom + scrollY; point = { x: tr.left + tr.width / 2, y: tr.top + scrollY + tr.height / 2 }; end = Math.max(1, point.y - innerHeight * .35); };
            const draw = () => {
                const p = clamp(state.p), small = 14;
                root.style.visibility = p > 0 && p < 1 ? 'visible' : 'hidden';
                photo.style.opacity = p > 0 ? '0' : '1';
                target.style.opacity = p >= 1 ? '1' : '0';
                let x, y, w, h, round;
                if (p < .35) {
                    const t = ease(p / .35), start = travelPoint(0, hero.clientWidth, top, bottom, point);
                    x = from.left + (start.x - small / 2 - from.left) * t;
                    y = from.top + (start.y - small / 2 - from.top) * t;
                    w = from.width + (small - from.width) * t;
                    h = from.height + (small - from.height) * t;
                    round = t;
                    image.style.opacity = String(1 - ease((t - .45) / .55));
                }
                else {
                    const pos = travelPoint((p - .35) / .65, hero.clientWidth, top, bottom, point);
                    x = pos.x - small / 2;
                    y = pos.y - small / 2;
                    w = h = small;
                    round = 1;
                    image.style.opacity = '0';
                }
                gsap.set(main, { x, y: y - scrollY, width: w, height: h, borderRadius: round * w / 2, backgroundColor: '#6b6572' });
                tails.forEach((tail, i) => { const t = (p - .35) / .65 - (i + 1) * .025; const pos = travelPoint(Math.max(0, t), hero.clientWidth, top, bottom, point); gsap.set(tail, { x: pos.x - (10 - i * 2) / 2, y: pos.y - scrollY - (10 - i * 2) / 2, width: 10 - i * 2, height: 10 - i * 2, opacity: p > .37 && p < .99 ? (.42 - i * .08) * clamp(t * 8) : 0 }); });
            };
            measure();
            const tween = gsap.to(state, { p: 1, ease: 'none', onUpdate: draw, scrollTrigger: { trigger: hero, start: 'top top', end: () => `+=${end}`, scrub: .45, onRefresh: () => { measure(); draw(); }, onUpdate: draw } });
            const resize = new ResizeObserver(() => ScrollTrigger.refresh());
            resize.observe(index);
            document.fonts.ready.then(() => ScrollTrigger.refresh());
            return () => { resize.disconnect(); tween.kill(); photo.style.removeProperty('opacity'); target.style.removeProperty('opacity'); root.style.visibility = 'hidden'; };
        });
        return () => media.revert();
    }, []);
    return <div ref={ref} className="portrait-traveller" aria-hidden="true"><div className="traveller-main"><img src={assets.heroPortrait} alt=""/></div>{[0, 1, 2, 3].map(i => <i key={i} className="traveller-tail"/>)}</div>;
}
