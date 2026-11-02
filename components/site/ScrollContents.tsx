'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { siteSections, type SectionId } from '@/lib/site-sections';

const rowHeight = 22;

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
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement>(null), rail = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null), mobileTrigger = useRef<HTMLButtonElement>(null);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusFrame = useRef(0);
  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);
  const close = useCallback(() => { cancelClose(); setOpen(false); }, [cancelClose]);
  function reveal() { cancelClose(); setOpen(true); }
  function leave() {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      if (!root.current?.querySelector(':focus-visible')) setOpen(false);
    }, 200);
  }
  function focusTrigger() {
    const button = matchMedia('(max-width:900px), (hover:none), (pointer:coarse)').matches ? mobileTrigger.current : trigger.current;
    button?.focus();
  }
  function choose(id: SectionId) {
    close();
    cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(() => {
      const section = document.getElementById(id);
      section?.setAttribute('tabindex', '-1'); section?.focus({ preventScroll: true });
    });
  }
  function focusLink(index: number) {
    reveal();
    cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(() => links.current[index]?.focus());
  }
  function magnify(clientY: number) {
    const top = rail.current?.getBoundingClientRect().top ?? 0;
    const position = Math.max(0, Math.min(siteSections.length - 1, (clientY - top) / rowHeight - .5));
    rail.current?.querySelectorAll<HTMLElement>('.contents-rail-marker').forEach((marker, i) => {
      const proximity = Math.exp(-((i - position) ** 2) / (2 * 1.35 ** 2));
      marker.style.setProperty('--mark-scale', String(.2 + .8 * proximity));
      marker.style.setProperty('--mark-opacity', String(.28 + .72 * proximity));
    });
  }
  function resetMarks() {
    rail.current?.querySelectorAll<HTMLElement>('.contents-rail-marker').forEach(marker => {
      marker.style.removeProperty('--mark-scale'); marker.style.removeProperty('--mark-opacity');
    });
  }
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) close();
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && open) { event.preventDefault(); close(); focusTrigger(); }
    };
    let toneFrame = 0;
    const syncTone = () => {
      toneFrame = 0;
      if (!root.current) return;
      const darkRegions = document.querySelectorAll('footer, .service-chapter-protect, .feedback-panel');
      const isDarkAt = (x: number, y: number) => {
        for (const region of darkRegions) {
          const rect = region.getBoundingClientRect();
          if (y < rect.top || y > rect.bottom || x < rect.left || x > rect.right) continue;
          const card = region.querySelector('.feedback-form')?.getBoundingClientRect();
          if (card && card.height > 0 && y >= card.top && y <= card.bottom && x >= card.left && x <= card.right) continue;
          return true;
        }
        return false;
      };
      root.current.dataset.tone = isDarkAt(56, Math.max(0, innerHeight - 46)) ? 'dark' : 'light';
      const control = root.current.querySelector('.contents-rail-controls')?.getBoundingClientRect();
      root.current.dataset.controlsTone = isDarkAt(control ? control.left + control.width / 2 : innerWidth - 36, control ? control.top + 22 : innerHeight / 2) ? 'dark' : 'light';
      const panel = root.current.querySelector('.contents-rail-panel')?.getBoundingClientRect();
      root.current.dataset.panelTone = isDarkAt(panel && panel.width ? panel.left + panel.width / 2 : innerWidth - 220, innerHeight / 2) ? 'dark' : 'light';
    };
    const scheduleTone = () => { if (!toneFrame) toneFrame = requestAnimationFrame(syncTone); };
    const reset = () => { scheduleTone(); };

    addEventListener('pointerdown', outside); addEventListener('keydown', escape);
    addEventListener('scroll', scheduleTone, { passive: true }); addEventListener('resize', reset);
    document.addEventListener('toggle', scheduleTone, true);
    syncTone();
    return () => {
      cancelClose(); cancelAnimationFrame(toneFrame);
      removeEventListener('pointerdown', outside); removeEventListener('keydown', escape);
      removeEventListener('scroll', scheduleTone); removeEventListener('resize', reset);
      document.removeEventListener('toggle', scheduleTone, true);
    };
  }, [open, close, cancelClose]);
  useEffect(() => () => cancelAnimationFrame(focusFrame.current), []);
  const triggerKeys = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); focusLink(event.key === 'ArrowDown' ? 0 : siteSections.length - 1);
    }
  };
  return <aside ref={root} className="contents-rail" data-open={open} aria-label="Obsah webu"
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}>
    <div className="contents-rail-controls" onPointerEnter={event => { if (event.pointerType === 'mouse' && matchMedia('(min-width:901px) and (hover:hover) and (pointer:fine)').matches) reveal(); }}
      onPointerLeave={event => { if (event.pointerType === 'mouse') { resetMarks(); leave(); } }}>
      <button ref={trigger} className="contents-rail-label" type="button" aria-expanded={open} aria-controls="contents-section-list"
        onClick={event => { cancelClose(); setOpen(value => event.detail > 0 ? true : !value); }} onKeyDown={triggerKeys}>Obsah</button>
      <nav ref={rail} className="contents-rail-markers" aria-label="Přeskočit na část webu"
        onPointerMove={event => { if (event.pointerType === 'mouse') magnify(event.clientY); }}>
        {siteSections.map((section, index) => <a key={section.id} className="contents-rail-marker" tabIndex={open ? -1 : 0} href={`#${section.id}`}
          aria-label={`Přejít na sekci ${section.label}`} aria-current={active === section.id ? 'location' : undefined}
          onFocus={event => { if (event.currentTarget.matches(':focus-visible')) reveal(); }}
          onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); focusLink(index); } }}
          onClick={() => choose(section.id)}><span className="contents-rail-mark" aria-hidden="true"/></a>)}
      </nav>
      <button ref={mobileTrigger} className="contents-rail-mobile" type="button" aria-label="Obsah" aria-expanded={open} aria-controls="contents-section-list"
        onClick={() => { cancelClose(); setOpen(value => !value); }} onKeyDown={triggerKeys}>
        <span className="contents-mobile-label">Obsah</span>
        <span className="contents-mobile-marks" aria-hidden="true">{siteSections.map(section => <span key={section.id} className="contents-rail-marker" data-active={active === section.id}><span className="contents-rail-mark"/></span>)}</span>
      </button>
    </div>
    <nav id="contents-section-list" className="contents-rail-panel" aria-label="Sekce webu" hidden={!open}
      onPointerEnter={cancelClose} onPointerLeave={event => { if (event.pointerType === 'mouse') leave(); }} onFocusCapture={cancelClose}>
      {siteSections.map((section, index) => <a key={section.id} ref={element => { links.current[index] = element; }}
        href={`#${section.id}`} aria-current={active === section.id ? 'location' : undefined} onClick={() => choose(section.id)}
        onKeyDown={event => {
          const next = event.key === 'ArrowDown' ? Math.min(index + 1, siteSections.length - 1) : event.key === 'ArrowUp' ? Math.max(index - 1, 0) : event.key === 'Home' ? 0 : event.key === 'End' ? siteSections.length - 1 : null;
          if (next !== null) { event.preventDefault(); links.current[next]?.focus(); }
        }}><span>{section.label}</span><ArrowUpRight size={16} aria-hidden="true"/></a>)}
    </nav>
    <nav className="quick-navigation" aria-label="Rychlé ovládání webu">
      <a className="quick-contact" href="#kontakt" onClick={() => choose('kontakt')}>Kontakt<ArrowUpRight size={16} aria-hidden="true"/></a>
    </nav>
    <noscript><style>{'.contents-rail{display:block;position:static;transform:none;padding:24px 5vw}.contents-rail-controls,.contents-rail-panel,.quick-navigation{display:none!important}'}</style><nav className="contents-nojs" aria-label="Části webu bez JavaScriptu">{siteSections.map(section => <a key={section.id} href={`#${section.id}`}>{section.label}</a>)}</nav></noscript>
  </aside>;
}
