'use client';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight, Home, UserRound, BriefcaseBusiness, Route, MoreHorizontal, X } from 'lucide-react';
import { siteSections, type SectionId } from '@/lib/site-sections';

const desktopQuery = '(min-width: 901px) and (hover: hover) and (pointer: fine)';
const rowHeight = 22;
const pieItems = [
  { id: 'domu', label: 'Úvod', icon: Home },
  { id: 'o-mne', label: 'O mně', icon: UserRound },
  { id: 'sluzby', label: 'Služby', icon: BriefcaseBusiness },
  { id: 'spoluprace', label: 'Spolupráce', icon: Route },
  { id: 'obsah', label: 'Více', icon: MoreHorizontal },
] as const;
function piePoint(radius: number, angle: number) {
  const radians = angle * Math.PI / 180;
  return { x: 140 + radius * Math.cos(radians), y: 140 - radius * Math.sin(radians) };
}
function pieSector(index: number) {
  const start = 180 - index * 36 - 1, end = start - 34;
  const a = piePoint(138, start), b = piePoint(138, end), c = piePoint(44, end), d = piePoint(44, start);
  return `M${a.x},${a.y} A138,138 0 0 1 ${b.x},${b.y} L${c.x},${c.y} A44,44 0 0 0 ${d.x},${d.y} Z`;
}

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
  const preview = useRef<number | null>(null), pendingPosition = useRef(0);
  const railTop = useRef<number | null>(null), frame = useRef(0), focusFrame = useRef(0);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null), closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressFocus = useRef(false);
  const changingMenu = useRef(false);

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
    closePreview(); setMenuOpen(false);
    cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(() => {
      const section = document.getElementById(id);
      section?.setAttribute('tabindex', '-1'); section?.focus({ preventScroll: true });
    });
  }

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) { closePreview(); setMenuOpen(false); }
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const index = preview.current;
      const restore = root.current?.contains(document.activeElement);
      closePreview(); setMenuOpen(false);
      if (restore) {
        suppressFocus.current = true;
        if (matchMedia(desktopQuery).matches && index !== null) markers.current[index]?.focus(); else trigger.current?.focus();
        cancelAnimationFrame(focusFrame.current);
        focusFrame.current = requestAnimationFrame(() => { suppressFocus.current = false; });
      }
    };
    const reset = () => { railTop.current = null; };
    const breakpoint = matchMedia(desktopQuery);
    const footer = document.querySelector('footer');
    const tone = new IntersectionObserver(entries => {
      if (root.current) root.current.dataset.tone = entries.some(entry => entry.isIntersecting) ? 'dark' : 'light';
    }, { rootMargin: `${-Math.max(0, innerHeight - 80)}px 0px 0px 0px` });
    if (footer) tone.observe(footer);
    const change = () => { closePreview(); setMenuOpen(false); reset(); };
    addEventListener('pointerdown', outside); addEventListener('keydown', escape); addEventListener('resize', reset);
    breakpoint.addEventListener('change', change);
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      cancelAnimationFrame(frame.current); cancelAnimationFrame(focusFrame.current);
      removeEventListener('pointerdown', outside); removeEventListener('keydown', escape); removeEventListener('resize', reset);
      breakpoint.removeEventListener('change', change);
      tone.disconnect();
    };
  }, [closePreview]);
  useEffect(() => {
    if (!menuOpen) return;
    let frame = requestAnimationFrame(() => {
      // Wait for the opening visibility transition to start before moving focus.
      frame = requestAnimationFrame(() => {
        const nav = panel.current?.querySelector(moreOpen ? '.contents-rail-panel' : '.mobile-pie-picker');
        (nav?.querySelector<HTMLAnchorElement>('a[aria-current=location]') ?? nav?.querySelector<HTMLAnchorElement>('a'))?.focus();
        changingMenu.current = false;
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [menuOpen, moreOpen]);

  const selected = siteSections[previewIndex ?? siteSections.findIndex(section => section.id === active)];
  return <aside ref={root} className="contents-rail" data-open={menuOpen} data-preview={previewIndex !== null} aria-label="Obsah webu" style={{ '--rail-half-height': `${siteSections.length * rowHeight / 2}px` } as CSSProperties}
    onPointerEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current); closeTimer.current = null; }}
    onPointerLeave={leave}
    onBlur={event => { if (!changingMenu.current && !event.currentTarget.contains(event.relatedTarget)) { closePreview(); setMenuOpen(false); } }}>
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
      <button ref={trigger} type="button" className="contents-rail-trigger" aria-label={menuOpen ? 'Zavřít navigaci' : 'Otevřít navigaci'} aria-expanded={menuOpen} aria-controls="contents-rail-panel" onClick={() => { closePreview(); changingMenu.current = false; setMoreOpen(false); setMenuOpen(value => !value); }}>{menuOpen && <X size={20} aria-hidden="true"/>}</button>
      <a className="quick-contact" href="#kontakt" onClick={() => choose('kontakt')}>Kontakt<ArrowUpRight size={16} aria-hidden="true"/></a>
    </nav>
    <div ref={panel} id="contents-rail-panel" className="mobile-pie-panel" data-more={moreOpen} inert={!menuOpen}>
      <nav className="mobile-pie-picker" aria-label="Rychlé sekce webu" hidden={moreOpen}>
        <svg viewBox="0 0 280 144" aria-label="Půlkruhová navigace">
          {pieItems.map((item, index) => {
            const point = piePoint(94, 162 - index * 36), Icon = item.icon;
            return <a key={item.id} href={`#${item.id}`} tabIndex={0} aria-label={item.label} aria-current={active === item.id ? 'location' : undefined}
              onClick={event => { if(index === 4) { event.preventDefault(); changingMenu.current = true; setMoreOpen(true); } else choose(item.id); }}>
              <path className="pie-sector" d={pieSector(index)}/>
              <g pointerEvents="none"><Icon x={point.x - 9} y={point.y - 16} size={18} strokeWidth={1.5} aria-hidden="true"/><text x={point.x} y={point.y + 16} textAnchor="middle">{item.label}</text></g>
            </a>;
          })}
        </svg>
      </nav>
      <div className="contents-rail-panel" hidden={!moreOpen}>
      <div className="contents-rail-heading"><strong>Na webu najdete</strong><button type="button" aria-label="Zavřít obsah" onClick={() => { setMenuOpen(false); trigger.current?.focus(); }}><X size={17} aria-hidden="true"/></button></div>
      <nav aria-label="Části webu">{siteSections.map(section => <a key={section.id} href={`#${section.id}`} aria-current={active === section.id ? 'location' : undefined} onClick={() => choose(section.id)}><strong>{section.label}</strong><span>{section.description}</span></a>)}</nav>
      </div>
    </div>
    <noscript><style>{'.contents-rail{display:block;position:static;transform:none;padding:24px 5vw}.contents-rail-markers,.contents-rail-preview,.quick-navigation,.mobile-pie-panel{display:none!important}'}</style><nav className="contents-nojs" aria-label="Části webu bez JavaScriptu">{siteSections.map(section => <a key={section.id} href={`#${section.id}`}>{section.label}</a>)}</nav></noscript>
  </aside>;
}
