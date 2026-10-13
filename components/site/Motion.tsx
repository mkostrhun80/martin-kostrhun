'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { syncHeroPhotoType } from '@/lib/hero-photo-type';
import { assets } from '@/lib/site-config';
import { clamp, ease, travelPoint, sampleRoute, routePoint, photoFrame } from '@/lib/traveller';
export function Motion() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const hero = document.querySelector<HTMLElement>('.hero');
      const photo = document.querySelector<HTMLElement>('.hero > .hero-artwork > .hero-photo-layer');
      const contents = document.querySelector<HTMLElement>('#obsah');
      const target = document.querySelector<HTMLElement>('.journey-destination');
      const root = ref.current;
      if (!hero || !photo || !contents || !target || !root) return;
      const scene = hero.closest<HTMLElement>('.hero-about-sequence')!;
      const main = root.querySelector<HTMLElement>('.traveller-main')!;
      const images = main.querySelectorAll('img');
      const tails = Array.from(root.querySelectorAll<HTMLElement>('.traveller-tail'));
      let source = {left:0,top:0,width:0,height:0};
      let route = sampleRoute(p => ({x:p,y:p}));
      let collapseEnd = 1, travelEnd = 2, expandEnd = 3;
      const measure = () => {
        [photo.querySelector('img')!, target.querySelector('img')!].forEach((image, i) => {
          const style = getComputedStyle(image);
          images[i].style.objectPosition = style.objectPosition;
          images[i].style.filter = style.filter;
        });
        const r = photo.getBoundingClientRect(), cr = contents.getBoundingClientRect();
        source = {left:r.left, top:r.top + scrollY, width:r.width, height:r.height};
        const parent = target.parentElement!;
        const position = parent.style.position;
        parent.style.position = 'static';
        const tr = target.getBoundingClientRect();
        const endPoint = {x:tr.left+tr.width/2,y:tr.top+scrollY+tr.height/2};
        parent.style.position = position;
        route = sampleRoute(p => travelPoint(p, innerWidth, cr.top+scrollY, cr.bottom+scrollY, endPoint));
        collapseEnd = hero.offsetHeight * .55;
        travelEnd = Math.max(collapseEnd+250, tr.top+scrollY-innerHeight*.65);
        expandEnd = Math.max(travelEnd+220, tr.top+scrollY-innerHeight*.12);
      };
      const draw = () => {
        const y = scrollY, shrinking = y < collapseEnd, travelling = y >= collapseEnd && y < travelEnd;
        const finished = y >= expandEnd;
        scene.dataset.handoff = y > 0 ? 'moving' : 'idle';
        root.style.visibility = y > 0 && !finished ? 'visible' : 'hidden';
        photo.style.opacity = y > 0 ? '0' : '1';
        target.style.opacity = finished || y <= 0 ? '1' : '0';
        const distance = clamp((y-collapseEnd)/(travelEnd-collapseEnd))*route.length;
        const dot = routePoint(route, distance);
        let frame;
        if(shrinking){
          const start = routePoint(route,0);
          frame = photoFrame(source, {left:start.x-7,top:start.y-7,width:14,height:14}, y/collapseEnd);
          frame.top -= y;
          images[0].style.opacity = String(1-ease((y/collapseEnd-.55)/.45));
          images[1].style.opacity = '0';
        } else if(travelling){
          frame = {left:dot.x-7,top:dot.y-y-7,width:14,height:14,radius:7};
          images[0].style.opacity = images[1].style.opacity = '0';
        } else {
          const tr=target.getBoundingClientRect(), end=routePoint(route,route.length);
          const p=clamp((y-travelEnd)/(expandEnd-travelEnd));
          frame=photoFrame({left:end.x-7,top:end.y-y-7,width:14,height:14},tr,p,true);
          images[0].style.opacity='0';images[1].style.opacity=String(ease(p*1.7));
        }
        syncHeroPhotoType(hero, shrinking ? frame : {left:0,top:-100,width:0,height:0}, frame.radius);
        gsap.set(main,{x:frame.left,y:frame.top,width:frame.width,height:frame.height,borderRadius:frame.radius});
        tails.forEach((tail,i)=>{
          const pos=routePoint(route,Math.max(0,distance-[18,32,43,52][i]));
          const size=9-i*1.8;
          gsap.set(tail,{x:pos.x-size/2,y:pos.y-y-size/2,width:size,height:size,opacity:travelling?(.38-i*.075)*clamp(distance/65)*clamp((route.length-distance)/70):0});
        });
      };
      measure();draw();
      const trigger=ScrollTrigger.create({start:0,end:()=>expandEnd,onUpdate:draw,onRefresh:()=>{measure();draw();}});
      const observer=new ResizeObserver(()=>ScrollTrigger.refresh());observer.observe(contents);observer.observe(hero);
      const refresh=()=>ScrollTrigger.refresh();
      document.fonts.ready.then(refresh);addEventListener('resize',refresh);
      return()=>{observer.disconnect();removeEventListener('resize',refresh);trigger.kill();photo.style.removeProperty('opacity');target.style.removeProperty('opacity');root.style.visibility='hidden';delete scene.dataset.handoff;syncHeroPhotoType(hero,photo.getBoundingClientRect(),12);};
    });
    return()=>media.revert();
  },[]);
  return <div ref={ref} className="portrait-traveller" aria-hidden="true"><div className="traveller-main"><img src={assets.heroPortrait} alt=""/><img className="journey-arrival" src={assets.editorialPortrait01} alt=""/></div>{[0,1,2,3].map(i=><i key={i} className="traveller-tail"/>)}</div>;
}
