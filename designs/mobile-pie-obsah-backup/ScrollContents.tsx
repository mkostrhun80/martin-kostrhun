'use client';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, Home, List, MoreHorizontal, Route, UserRound, X } from 'lucide-react';
import { siteSections, type SectionId } from '@/lib/site-sections';

const desktopQuery = '(min-width: 901px) and (hover: hover) and (pointer: fine)';
const rowHeight = 22;
const pieOrigin = { x: 2, y: 246 };

function roundedQuarter(r1: number, g: number, rcArc: number, rcCorner: number) {
  const rOut = r1 - rcArc;
  const delta = Math.asin((g + rcArc) / rOut);
  const t1 = Math.PI / 2 - delta, t2 = delta;
  const pt = (u: number, v: number) => `${(pieOrigin.x + u).toFixed(2)},${(pieOrigin.y - v).toFixed(2)}`;
  const pLeftBottom = pt(g, g + rcCorner);
  const pLeftTop = pt(g, rOut * Math.sin(t1));
  const pArcStart = pt(r1 * Math.cos(t1), r1 * Math.sin(t1));
  const pArcEnd = pt(r1 * Math.cos(t2), r1 * Math.sin(t2));
  const pBottomRight = pt(rOut * Math.cos(t2), g);
  const pBottomLeft = pt(g + rcCorner, g);
  return `M${pLeftBottom} L${pLeftTop} A${rcArc},${rcArc} 0 0 1 ${pArcStart} A${r1},${r1} 0 0 1 ${pArcEnd} A${rcArc},${rcArc} 0 0 1 ${pBottomRight} L${pBottomLeft} A${rcCorner},${rcCorner} 0 0 1 ${pLeftBottom} Z`;
}

function quarterIncenter(r1: number, g: number) {
  const d = (r1 - g * Math.SQRT2) / (1 + Math.SQRT2);
  return { x: pieOrigin.x + g + d, y: pieOrigin.y - g - d };
}

function roundedSector(r0: number, r1: number, a1Deg: number, a2Deg: number, g1: number, g2: number, rc: number) {
  const a1 = a1Deg * Math.PI / 180, a2 = a2Deg * Math.PI / 180;
  const n1x = -Math.sin(a1), n1y = Math.cos(a1), n2x = -Math.sin(a2), n2y = Math.cos(a2);
  const rOut = r1 - rc, rIn = r0 + rc;
  const t1Out = a1 - Math.asin((g1 + rc) / rOut), t2Out = a2 + Math.asin((g2 + rc) / rOut);
  const t2In = a2 + Math.asin((g2 + rc) / rIn), t1In = a1 - Math.asin((g1 + rc) / rIn);
  const pt = (u: number, v: number) => `${(pieOrigin.x + u).toFixed(2)},${(pieOrigin.y - v).toFixed(2)}`;
  const c1OutU = rOut * Math.cos(t1Out), c1OutV = rOut * Math.sin(t1Out);
  const c2OutU = rOut * Math.cos(t2Out), c2OutV = rOut * Math.sin(t2Out);
  const c2InU = rIn * Math.cos(t2In), c2InV = rIn * Math.sin(t2In);
  const c1InU = rIn * Math.cos(t1In), c1InV = rIn * Math.sin(t1In);
  const p1InLine = pt(c1InU + rc * n1x, c1InV + rc * n1y);
  const p1OutLine = pt(c1OutU + rc * n1x, c1OutV + rc * n1y);
  const p1OutArc = pt(r1 * Math.cos(t1Out), r1 * Math.sin(t1Out));
  const p2OutArc = pt(r1 * Math.cos(t2Out), r1 * Math.sin(t2Out));
  const p2OutLine = pt(c2OutU - rc * n2x, c2OutV - rc * n2y);
  const p2InLine = pt(c2InU - rc * n2x, c2InV - rc * n2y);
  const p2InArc = pt(r0 * Math.cos(t2In), r0 * Math.sin(t2In));
  const p1InArc = pt(r0 * Math.cos(t1In), r0 * Math.sin(t1In));
  return `M${p1InLine} L${p1OutLine} A${rc},${rc} 0 0 1 ${p1OutArc} A${r1},${r1} 0 0 1 ${p2OutArc} A${rc},${rc} 0 0 1 ${p2OutLine} L${p2InLine} A${rc},${rc} 0 0 1 ${p2InArc} A${r0},${r0} 0 0 0 ${p1InArc} A${rc},${rc} 0 0 1 ${p1InLine} Z`;
}

function sectorCenter(r0: number, r1: number, a1Deg: number, a2Deg: number, g1: number, g2: number) {
  const rMid = (r0 + r1) / 2;
  const aMid = ((a1Deg + a2Deg) / 2) * Math.PI / 180 + (g2 - g1) / (2 * rMid);
  return { x: pieOrigin.x + rMid * Math.cos(aMid), y: pieOrigin.y - rMid * Math.sin(aMid) };
}

const pieTrayPath = roundedQuarter(244, 0, 20, 22);
const outerPieMeta = [
  { id: 'domu', label: 'Úvod', icon: Home },
  { id: 'o-mne', label: 'O mně', icon: UserRound },
  { id: 'sluzby', label: 'Služby', icon: BriefcaseBusiness },
  { id: 'spoluprace', label: 'Spolupráce', icon: Route },
] as const;

const pieSlices = [
  ...outerPieMeta.map((item, index) => {
    const a1 = 90 - index * 22.5, a2 = a1 - 22.5;
    const g1 = index === 0 ? 6 : 2.5, g2 = index === 3 ? 6 : 2.5;
    return { ...item, isMore: false, path: roundedSector(114, 238, a1, a2, g1, g2, 12), point: sectorCenter(114, 238, a1, a2, g1, g2) };
  }),
  {
    id: 'obsah' as SectionId,
    label: 'Více',
    icon: MoreHorizontal,
    isMore: true,
    path: roundedQuarter(109, 6, 12, 16),
    point: quarterIncenter(109, 6),
  },
] as const;

function useActiveSection() {
  const [active, setActive] = useState<SectionId>('domu');
  useEffect(() => {
    let frame = 0, dirty = true, disposed = false;
    let offsets: { id: SectionId; top: number }[] = [];
    const update = () => {
      frame = 0;
      if (disposed) return;
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
    const schedule = () => { if (!disposed && !frame) frame = requestAnimationFrame(update); };
    const measure = () => { dirty = true; schedule(); };
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', measure);
    document.fonts.ready.then(measure); update();
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); removeEventListener('scroll', schedule); removeEventListener('resize', measure); };
  }, []);
  return active;
}

export function ScrollContents() {
  const active = useActiveSection();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const root = useRef<HTMLElement>(null), rail = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null), panel = useRef<HTMLDivElement>(null);
  const markers = useRef<(HTMLAnchorElement | null)[]>([]);
  const pieLinks = useRef<(HTMLAnchorElement | null)[]>([]);
  const preview = useRef<number | null>(null), pendingPosition = useRef(0);
  const railTop = useRef<number | null>(null), frame = useRef(0), focusFrame = useRef(0);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null), closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressFocus = useRef(false);
  const changingMenu = useRef(false);
  const keyboardTrigger = useRef(false);

  const closePreview = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = closeTimer.current = null;
    cancelAnimationFrame(frame.current); frame.current = 0;
    preview.current = null; setPreviewIndex(null);
    for (const marker of markers.current) {
      marker?.style.removeProperty('--mark-scale');
      marker?.style.removeProperty('--mark-opacity');
    }
  }, []);

  function paint(position: number) {
    for (let i = 0; i < markers.current.length; i++) {
      const proximity = Math.exp(-((i - position) ** 2) / (2 * 1.35 ** 2));
      markers.current[i]?.style.setProperty('--mark-scale', String(.2 + .8 * proximity));
      markers.current[i]?.style.setProperty('--mark-opacity', String(.28 + .72 * proximity));
    }
    root.current?.style.setProperty('--preview-y', `${(Math.round(position) + .5) * rowHeight}px`);
  }
  function show(index: number) {
    preview.current = index; setPreviewIndex(current => current === index ? current : index);
  }
  function pointerMove(clientY: number) {
    if (!matchMedia(desktopQuery).matches) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
    if (railTop.current === null) railTop.current = rail.current?.getBoundingClientRect().top ?? 0;
    pendingPosition.current = Math.max(0, Math.min(siteSections.length - 1, (clientY - railTop.current) / rowHeight - .5));
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0; paint(pendingPosition.current);
      if (preview.current !== null) show(Math.round(pendingPosition.current));
      else if (!openTimer.current) openTimer.current = setTimeout(() => {
        openTimer.current = null; show(Math.round(pendingPosition.current));
      }, 140);
    });
  }
  function leave() {
    if (root.current?.contains(document.activeElement)) return;
    if (openTimer.current) clearTimeout(openTimer.current);
    openTimer.current = null;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(closePreview, 140);
  }
  function choose(id: SectionId) {
    closePreview(); setMoreOpen(false); setMenuOpen(false);
    cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(() => {
      const section = document.getElementById(id);
      section?.setAttribute('tabindex', '-1'); section?.focus({ preventScroll: true });
    });
  }

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) { closePreview(); setMoreOpen(false); setMenuOpen(false); }
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const index = preview.current;
      const restore = root.current?.contains(document.activeElement);
      closePreview(); setMoreOpen(false); setMenuOpen(false);
      if (restore) {
        suppressFocus.current = true;
        if (matchMedia(desktopQuery).matches && index !== null) markers.current[index]?.focus(); else trigger.current?.focus();
        cancelAnimationFrame(focusFrame.current);
        focusFrame.current = requestAnimationFrame(() => { suppressFocus.current = false; });
      }
    };
    let toneFrame = 0;
    const syncTone = () => {
      toneFrame = 0;
      if (!root.current) return;
      const sampleX = 56, sampleY = Math.max(0, innerHeight - 38);
      const darkRegions = document.querySelectorAll('footer, .service-chapter-protect, .feedback-panel');
      let dark = false;
      for (const region of darkRegions) {
        const rect = region.getBoundingClientRect();
        if (sampleY >= rect.top && sampleY <= rect.bottom && sampleX >= rect.left && sampleX <= rect.right) {
          const lightCard = region.querySelector('.feedback-form');
          const cardRect = lightCard?.getBoundingClientRect();
          if (cardRect && cardRect.height > 0 && sampleY >= cardRect.top && sampleY <= cardRect.bottom && sampleX >= cardRect.left && sampleX <= cardRect.right) continue;
          dark = true;
          break;
        }
      }
      root.current.dataset.tone = dark ? 'dark' : 'light';
    };
    const scheduleTone = () => { if (!toneFrame) toneFrame = requestAnimationFrame(syncTone); };
    const reset = () => { railTop.current = null; scheduleTone(); };
    const breakpoint = matchMedia(desktopQuery);
    const change = () => { closePreview(); setMoreOpen(false); setMenuOpen(false); reset(); };
    addEventListener('pointerdown', outside); addEventListener('keydown', escape);
    addEventListener('scroll', scheduleTone, { passive: true }); addEventListener('resize', reset);
    document.addEventListener('toggle', scheduleTone, true);
    breakpoint.addEventListener('change', change);
    syncTone();
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      cancelAnimationFrame(frame.current); cancelAnimationFrame(focusFrame.current); cancelAnimationFrame(toneFrame);
      removeEventListener('pointerdown', outside); removeEventListener('keydown', escape);
      removeEventListener('scroll', scheduleTone); removeEventListener('resize', reset);
      document.removeEventListener('toggle', scheduleTone, true);
      breakpoint.removeEventListener('change', change);
    };
  }, [closePreview]);
  useEffect(() => {
    if (!menuOpen) return;
    let frame = requestAnimationFrame(() => {
      // Wait for the opening visibility transition to start before moving focus.
      frame = requestAnimationFrame(() => {
        if (keyboardTrigger.current) {
          const nav = panel.current?.querySelector(moreOpen ? '.contents-rail-panel' : '.mobile-pie-picker');
          (nav?.querySelector<HTMLAnchorElement>('a[aria-current=location]') ?? nav?.querySelector<HTMLAnchorElement>('a[data-contains-active]') ?? nav?.querySelector<HTMLAnchorElement>('a'))?.focus();
        } else {
          panel.current?.focus({ preventScroll: true });
        }
        changingMenu.current = false;
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [menuOpen, moreOpen]);

  const selected = siteSections[previewIndex ?? siteSections.findIndex(section => section.id === active)];
  const activeInOuter = outerPieMeta.some(item => item.id === active);
  return <aside ref={root} className="contents-rail" data-open={menuOpen} data-preview={previewIndex !== null} aria-label="Obsah webu" style={{ '--rail-half-height': `${siteSections.length * rowHeight / 2}px` } as CSSProperties}
    onPointerEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current); closeTimer.current = null; }}
    onPointerLeave={leave}
    onBlur={event => { if (!changingMenu.current && !event.currentTarget.contains(event.relatedTarget)) { closePreview(); setMoreOpen(false); setMenuOpen(false); } }}>
    <nav ref={rail} className="contents-rail-markers" aria-label="Přeskočit na část webu"
      onPointerEnter={() => { railTop.current = null; }} onPointerMove={event => pointerMove(event.clientY)}>
      {siteSections.map((section, index) => <a key={section.id} ref={element => { markers.current[index] = element; }} className="contents-rail-marker"
        href={`#${section.id}`} aria-label={`Přejít na sekci ${section.label}`} aria-current={active === section.id ? 'location' : undefined}
        aria-describedby={previewIndex === index ? 'contents-preview-description' : undefined}
        onKeyDown={event => {
          const next = event.key === 'ArrowDown' ? Math.min(index + 1, siteSections.length - 1) : event.key === 'ArrowUp' ? Math.max(index - 1, 0) : event.key === 'Home' ? 0 : event.key === 'End' ? siteSections.length - 1 : null;
          if (next !== null) { event.preventDefault(); markers.current[next]?.focus(); }
        }}
        onFocus={() => {
          if (suppressFocus.current || !matchMedia(desktopQuery).matches) return;
          if (openTimer.current) clearTimeout(openTimer.current); openTimer.current = null;
          if (closeTimer.current) clearTimeout(closeTimer.current); closeTimer.current = null;
          paint(index); show(index);
        }} onClick={() => choose(section.id)}><span className="contents-rail-mark" aria-hidden="true"/></a>)}
    </nav>
    <a className="contents-rail-preview" href={`#${selected.id}`} tabIndex={-1} inert={previewIndex === null}
      aria-hidden={previewIndex === null} onClick={() => choose(selected.id)}>
      <span className="contents-preview-heading"><strong>{selected.label}</strong><ArrowUpRight size={17} aria-hidden="true"/></span>
      <span id="contents-preview-description" className="contents-preview-description">{selected.description}</span>
    </a>
    <nav className="quick-navigation" aria-label="Rychlé ovládání webu">
      <button ref={trigger} type="button" className="contents-rail-trigger" aria-expanded={menuOpen} aria-controls="contents-rail-panel"
        onClick={event => { closePreview(); keyboardTrigger.current = event.detail === 0; changingMenu.current = false; setMoreOpen(false); setMenuOpen(value => !value); }}>
        <span className="contents-trigger-icon" aria-hidden="true">
          <List className="trigger-icon-closed" size={16} strokeWidth={1.8}/>
          <X className="trigger-icon-open" size={16} strokeWidth={1.8}/>
        </span>
        <span>Obsah</span>
      </button>
      <a className="quick-contact" href="#kontakt" onClick={() => choose('kontakt')}><span>Kontakt</span><ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true"/></a>
    </nav>
    <div ref={panel} id="contents-rail-panel" className="mobile-pie-panel" data-more={moreOpen} tabIndex={-1} inert={!menuOpen}>
      <nav className="mobile-pie-picker" aria-label="Rychlé sekce webu" hidden={moreOpen} style={{ clipPath: `path('${pieTrayPath}')` }}>
        <svg viewBox="0 0 248 248" aria-label="Vějířová navigace">
          <path className="pie-tray-border" d={pieTrayPath} aria-hidden="true"/>
          {pieSlices.map((item, index) => {
            const Icon = item.icon;
            const isCurrent = !item.isMore && active === item.id;
            const containsActive = item.isMore && !activeInOuter;
            return <a key={item.isMore ? 'more' : item.id} ref={element => { pieLinks.current[index] = element; }} className="pie-slice" href={`#${item.id}`} tabIndex={0}
              aria-label={item.isMore ? 'Více sekcí' : item.label}
              aria-current={isCurrent ? 'location' : undefined}
              data-contains-active={containsActive || undefined}
              style={{ '--slice-index': index } as CSSProperties}
              onKeyDown={event => {
                const next = (event.key === 'ArrowRight' || event.key === 'ArrowDown') ? (index + 1) % pieSlices.length
                  : (event.key === 'ArrowLeft' || event.key === 'ArrowUp') ? (index - 1 + pieSlices.length) % pieSlices.length
                  : event.key === 'Home' ? 0 : event.key === 'End' ? pieSlices.length - 1 : null;
                if (next !== null) { event.preventDefault(); pieLinks.current[next]?.focus(); }
              }}
              onClick={event => {
                if (item.isMore) { event.preventDefault(); keyboardTrigger.current = event.detail === 0; changingMenu.current = true; setMoreOpen(true); }
                else choose(item.id);
              }}>
              <path className="pie-sector" d={item.path}/>
              <g className="pie-label" pointerEvents="none">
                <Icon x={item.point.x - 9} y={item.point.y - 17} size={18} strokeWidth={1.65} aria-hidden="true"/>
                <text x={item.point.x} y={item.point.y + 15} textAnchor="middle">{item.label}</text>
              </g>
            </a>;
          })}
        </svg>
      </nav>
      <div className="contents-rail-panel" hidden={!moreOpen}>
        <div className="contents-rail-heading">
          <button type="button" className="contents-rail-back" aria-label="Zpět na rychlý výběr" onClick={event => { keyboardTrigger.current = event.detail === 0; changingMenu.current = true; setMoreOpen(false); }}>
            <ArrowLeft size={16} aria-hidden="true"/>
          </button>
          <strong>Na webu najdete</strong>
          <button type="button" aria-label="Zavřít obsah" onClick={() => { setMoreOpen(false); setMenuOpen(false); trigger.current?.focus(); }}>
            <X size={17} aria-hidden="true"/>
          </button>
        </div>
        <nav aria-label="Části webu">{siteSections.map(section => <a key={section.id} href={`#${section.id}`} aria-current={active === section.id ? 'location' : undefined} onClick={() => choose(section.id)}><strong>{section.label}</strong><span>{section.description}</span></a>)}</nav>
      </div>
    </div>
    <noscript><style>{'.contents-rail{display:block;position:static;transform:none;padding:24px 5vw}.contents-rail-markers,.contents-rail-preview,.quick-navigation,.mobile-pie-panel{display:none!important}'}</style><nav className="contents-nojs" aria-label="Části webu bez JavaScriptu">{siteSections.map(section => <a key={section.id} href={`#${section.id}`}>{section.label}</a>)}</nav></noscript>
  </aside>;
}
