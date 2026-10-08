'use client';
import { useEffect, useId, useRef, type RefObject } from 'react';
import { attachHeroFlow } from '@/lib/hero-flow-controller';
import { assets } from '@/lib/site-config';

export function HeroFlow({ heroRef }: { heroRef: RefObject<HTMLElement | null> }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const id = `hero-fluid-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  useEffect(() => {
    if (!heroRef.current || !svgRef.current) return;
    return attachHeroFlow(heroRef.current, svgRef.current);
  }, [heroRef]);
  return <>
    <svg ref={svgRef} className="hero-flow-reveal hero-fluid-svg" width="100%" height="100%" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" stopColor="white" stopOpacity="1"/>
          <stop offset="40%" stopColor="white" stopOpacity="1"/>
          <stop offset="70%" stopColor="white" stopOpacity=".45"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        <circle id={`${id}-shapes`} data-cursor-glow cx="0" cy="0" r="0" fill={`url(#${id}-glow)`}/>
        <mask id={`${id}-outside`} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%" style={{ maskType: 'luminance' }}>
          <rect width="100%" height="100%" fill="white"/>
          <rect data-outside-photo width="0" height="0" fill="black"/>
        </mask>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%" style={{ maskType: 'alpha' }}>
          <use href={`#${id}-shapes`}/>
        </mask>
        <clipPath id={`${id}-photo`}><rect data-photo-clip width="0" height="0"/></clipPath>
      </defs>
      <g mask={`url(#${id}-outside)`}>
        <rect width="100%" height="100%" fill="#9d52ff" opacity=".22" mask={`url(#${id})`}/>
      </g>
      <g clipPath={`url(#${id}-photo)`}><g mask={`url(#${id})`}>
        <image data-color-photo href={assets.heroLensPortrait} width="0" height="0" preserveAspectRatio="none"/>
      </g></g>
    </svg>
    <div className="hero-glow-type" aria-hidden="true">
      <span className="hero-name hero-name-back" data-glow-name="back">MARTIN</span>
      <span className="hero-name hero-name-front" data-glow-name="front">KOSTRHUN<span className="hero-name-dot">.</span></span>
    </div>
    <div className="hero-flow-hint" aria-hidden="true"><span className="pointer-hint">POHYBEM OBJEVUJ</span><span className="touch-hint">DOTYKEM OBJEVUJ</span></div>
  </>;
}

export function HeroContours() {
  return <svg className="hero-flow-contours" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <g fill="none" stroke="currentColor" strokeWidth="1.1">
      <path d="M-90 80C100-100 246 56 222 184S61 385 155 428 398 318 458 403 260 628 54 595-100 836 115 946"/>
      <path d="M320-65C444 121 324 230 469 229S695 73 819 179 1100 157 1018-25"/>
      <path d="M1510 39C1138-22 1272 221 1211 305S954 339 1042 484 1417 413 1365 660 1202 862 1478 954"/>
      <path d="M220 981C362 683 620 694 583 564S441 455 581 406 914 464 876 684 1088 813 1106 988"/>
    </g>
  </svg>;
}
