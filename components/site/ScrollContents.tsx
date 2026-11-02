'use client';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
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
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const root = useRef<HTMLElement>(null), rail = useRef<HTMLElement>(null);
  const markers = useRef<(HTMLAnchorElement | null)[]>([]);
  const preview = useRef<number | null>(null), pendingPosition = useRef(0);
  const railTop = useRef<number | null>(null), frame = useRef(0), focusFrame = useRef(0);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null), closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressFocus = useRef(false);
  const lastPointerType = useRef('mouse');
  const tapOpenedPreview = useRef(false);
  const touchGesture = useRef<{ id: number; startY: number; startIndex: number; scrubbed: boolean } | null>(null);
  const suppressClickAfterScrub = useRef(false);

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

  function positionAt(clientY: number) {
    if (railTop.current === null) railTop.current = rail.current?.getBoundingClientRect().top ?? 0;
    return Math.max(0, Math.min(siteSections.length - 1, (clientY - railTop.current) / rowHeight - .5));
  }
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
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
    pendingPosition.current = positionAt(clientY);
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0; paint(pendingPosition.current);
      if (preview.current !== null) show(Math.round(pendingPosition.current));
      else if (!openTimer.current) openTimer.current = setTimeout(() => {
        openTimer.current = null; show(Math.round(pendingPosition.current));
      }, 140);
    });
  }
  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }
  function leave(pointerType: string) {
    if (pointerType !== 'mouse') return;
    if (rail.current?.contains(document.activeElement)) return;
    if (openTimer.current) clearTimeout(openTimer.current);
    openTimer.current = null;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(closePreview, 140);
  }
  function choose(id: SectionId) {
    closePreview();
    cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(() => {
      const section = document.getElementById(id);
      section?.setAttribute('tabindex', '-1'); section?.focus({ preventScroll: true });
    });
  }

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) closePreview();
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const index = preview.current;
      const restore = root.current?.contains(document.activeElement);
      closePreview();
      if (restore && index !== null) {
        suppressFocus.current = true;
        markers.current[index]?.focus();
        cancelAnimationFrame(focusFrame.current);
        focusFrame.current = requestAnimationFrame(() => { suppressFocus.current = false; });
      }
    };
    let toneFrame = 0;
    const syncTone = () => {
      toneFrame = 0;
      if (!root.current) return;
      const sampleX = 56, sampleY = Math.max(0, innerHeight - 46);
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
    addEventListener('pointerdown', outside); addEventListener('keydown', escape);
    addEventListener('scroll', scheduleTone, { passive: true }); addEventListener('resize', reset);
    document.addEventListener('toggle', scheduleTone, true);
    syncTone();
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      cancelAnimationFrame(frame.current); cancelAnimationFrame(focusFrame.current); cancelAnimationFrame(toneFrame);
      removeEventListener('pointerdown', outside); removeEventListener('keydown', escape);
      removeEventListener('scroll', scheduleTone); removeEventListener('resize', reset);
      document.removeEventListener('toggle', scheduleTone, true);
    };
  }, [closePreview]);

  const selected = siteSections[previewIndex ?? siteSections.findIndex(section => section.id === active)];
  return <aside ref={root} className="contents-rail" data-preview={previewIndex !== null} aria-label="Obsah webu" style={{ '--rail-half-height': `${siteSections.length * rowHeight / 2}px` } as CSSProperties}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) closePreview(); }}>
    <nav ref={rail} className="contents-rail-markers" aria-label="Přeskočit na část webu"
      onPointerEnter={() => { railTop.current = null; cancelClose(); }}
      onPointerLeave={event => leave(event.pointerType)}
      onPointerDown={event => {
        if (!event.isPrimary) return;
        suppressClickAfterScrub.current = false;
        lastPointerType.current = event.pointerType;
        if (event.pointerType === 'mouse') return;
        if (openTimer.current) clearTimeout(openTimer.current);
        if (closeTimer.current) clearTimeout(closeTimer.current);
        openTimer.current = closeTimer.current = null;
        railTop.current = null;
        const pos = positionAt(event.clientY), idx = Math.round(pos);
        tapOpenedPreview.current = preview.current !== idx;
        touchGesture.current = { id: event.pointerId, startY: event.clientY, startIndex: idx, scrubbed: false };
        paint(pos); show(idx);
      }}
      onPointerMove={event => {
        lastPointerType.current = event.pointerType;
        if (event.pointerType === 'mouse') { pointerMove(event.clientY); return; }
        const gesture = touchGesture.current;
        if (!gesture || gesture.id !== event.pointerId) return;
        const position = positionAt(event.clientY);
        if (!gesture.scrubbed && (Math.abs(event.clientY - gesture.startY) > 5 || Math.round(position) !== gesture.startIndex)) {
          gesture.scrubbed = true;
          rail.current?.setPointerCapture(event.pointerId);
        }
        pendingPosition.current = position;
        if (frame.current) return;
        frame.current = requestAnimationFrame(() => {
          frame.current = 0; paint(pendingPosition.current); show(Math.round(pendingPosition.current));
        });
      }}
      onPointerUp={event => {
        const gesture = touchGesture.current;
        if (!gesture || gesture.id !== event.pointerId) return;
        touchGesture.current = null;
        if (rail.current?.hasPointerCapture(event.pointerId)) rail.current.releasePointerCapture(event.pointerId);
        // Use the release position, even if the last preview animation frame has not run yet.
        const index = Math.round(positionAt(event.clientY));
        if (!gesture.scrubbed && Math.abs(event.clientY - gesture.startY) <= 5 && index === gesture.startIndex) return;
        markers.current[index]?.click();
        suppressClickAfterScrub.current = true;
      }}
      onPointerCancel={event => {
        if (touchGesture.current?.id === event.pointerId) {
          if (rail.current?.hasPointerCapture(event.pointerId)) rail.current.releasePointerCapture(event.pointerId);
          touchGesture.current = null;
          closePreview();
        }
      }}
      onClickCapture={event => {
        // A browser may still synthesize a click for the original touch after a drag.
        if (!suppressClickAfterScrub.current || event.detail === 0) return;
        suppressClickAfterScrub.current = false;
        event.preventDefault();
        event.stopPropagation();
      }}>
      {siteSections.map((section, index) => <a key={section.id} ref={element => { markers.current[index] = element; }} className="contents-rail-marker"
        href={`#${section.id}`} aria-label={`Přejít na sekci ${section.label}`} aria-current={active === section.id ? 'location' : undefined}
        aria-describedby={previewIndex === index ? 'contents-preview-description' : undefined}
        onKeyDown={event => {
          const next = event.key === 'ArrowDown' ? Math.min(index + 1, siteSections.length - 1) : event.key === 'ArrowUp' ? Math.max(index - 1, 0) : event.key === 'Home' ? 0 : event.key === 'End' ? siteSections.length - 1 : null;
          if (next !== null) { event.preventDefault(); markers.current[next]?.focus(); }
        }}
        onFocus={event => {
          if (suppressFocus.current || !event.currentTarget.matches(':focus-visible')) return;
          if (openTimer.current) clearTimeout(openTimer.current); openTimer.current = null;
          if (closeTimer.current) clearTimeout(closeTimer.current); closeTimer.current = null;
          paint(index); show(index);
        }}
        onClick={event => {
          if (lastPointerType.current !== 'mouse' && event.detail !== 0 && tapOpenedPreview.current) {
            event.preventDefault();
            tapOpenedPreview.current = false;
            paint(index); show(index);
            return;
          }
          choose(section.id);
        }}><span className="contents-rail-mark" aria-hidden="true"/></a>)}
    </nav>
    <a className="contents-rail-preview" href={`#${selected.id}`} tabIndex={-1} inert={previewIndex === null}
      aria-hidden={previewIndex === null}
      onPointerEnter={cancelClose}
      onPointerLeave={event => leave(event.pointerType)}
      onClick={() => choose(selected.id)}>
      <span className="contents-preview-heading"><strong>{selected.label}</strong><ArrowUpRight size={17} aria-hidden="true"/></span>
      <span id="contents-preview-description" className="contents-preview-description">{selected.description}</span>
    </a>
    <nav className="quick-navigation" aria-label="Rychlé ovládání webu">
      <a className="quick-contact" href="#kontakt" onClick={() => choose('kontakt')}>Kontakt<ArrowUpRight size={16} aria-hidden="true"/></a>
    </nav>
    <noscript><style>{'.contents-rail{display:block;position:static;transform:none;padding:24px 5vw}.contents-rail-markers,.contents-rail-preview,.quick-navigation{display:none!important}'}</style><nav className="contents-nojs" aria-label="Části webu bez JavaScriptu">{siteSections.map(section => <a key={section.id} href={`#${section.id}`}>{section.label}</a>)}</nav></noscript>
  </aside>;
}
