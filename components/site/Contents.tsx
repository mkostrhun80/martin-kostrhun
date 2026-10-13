'use client';
import { useEffect, useRef, useState } from 'react';
import { visibleSections } from '@/lib/public-data';
import { useSiteData } from './SiteData';
import { AppointmentLink } from './AppointmentLink';
export function Contents() { const sections = visibleSections(useSiteData()); return <section id="obsah" className="index-section page-section"><div className="section-heading"><h2>Na webu najdete<span>.</span></h2><p>Vyberte si, co vás zajímá.</p></div><nav className="index-grid" aria-label="Rychlé odkazy na části webu">{sections.map(s => <a key={s.id} href={`#${s.id}`}><span className="index-label">{s.label}<span aria-hidden="true">↗</span></span><p>{s.description}</p></a>)}</nav></section>; }
export function ScrollContents() {
    const sections = visibleSections(useSiteData());
    const [active, setActive] = useState('domu');
    const [progress, setProgress] = useState(0);
    const [positions, setPositions] = useState<Record<string, number>>({});
    const [pinned, setPinned] = useState(false);
    const [hover, setHover] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [focused, setFocused] = useState(false);
    const button = useRef<HTMLButtonElement>(null);
    const key = sections.map(s => s.id).join(',');
    useEffect(() => { let frame = 0; const update = () => { frame = 0; const max = document.documentElement.scrollHeight - innerHeight; setProgress(max > 0 ? Math.min(1, scrollY / max) : 0); let current = 'domu'; const markers: Record<string, number> = {}; for (const id of key.split(',')) {
        const el = document.getElementById(id);
        if (el) {
            const rect = el.getBoundingClientRect();
            markers[id] = Math.max(0, Math.min(100, (rect.top + scrollY) / Math.max(1, max) * 100));
            if (rect.top < innerHeight * .36)
                current = id;
        }
    } setActive(current); setPositions(markers); }; const schedule = () => { if (!frame)
        frame = requestAnimationFrame(update); }; update(); const resize = new ResizeObserver(schedule); resize.observe(document.body); addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', schedule); return () => { cancelAnimationFrame(frame); resize.disconnect(); removeEventListener('scroll', schedule); removeEventListener('resize', schedule); }; }, [key]);
    const open = !dismissed && (pinned || hover || focused);
    const close = () => { setPinned(false); setHover(false); setFocused(false); setDismissed(true); button.current?.focus(); };
    const closeTo = (id: string) => { setPinned(false); setHover(false); setFocused(false); setDismissed(true); requestAnimationFrame(() => { const target = document.getElementById(id); target?.setAttribute('tabindex', '-1'); target?.focus({preventScroll:true}); }); };
    return <aside className={`scroll-contents ${open ? 'is-open' : ''}`} onMouseEnter={() => { setDismissed(false); setHover(true); }} onMouseLeave={() => setHover(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget))
        setFocused(false); }} onKeyDown={e => { if (e.key === 'Escape')
        close(); }} aria-label="Průchod webem"><button ref={button} className="scroll-trigger" aria-label={open ? "Zavřít postranní obsah" : "Otevřít obsah webu"} aria-expanded={open} aria-controls="scroll-panel" onClick={() => { if (pinned)
        close();
    else {
        setDismissed(false);
        setPinned(true);
    } }}><span className="scroll-track"><i style={{ transform: `scaleY(${progress})` }}/>{sections.map((s, i) => <b key={s.id} className={active === s.id ? 'active' : ''} style={{ top: `${positions[s.id] ?? (i + 1) / (sections.length + 1) * 100}%` }}/>)}</span><span className="scroll-word">OBSAH</span></button><div id="scroll-panel" className="scroll-panel" hidden={!open}><div className="scroll-panel-top"><strong>Na webu najdete</strong><button onClick={close} aria-label="Zavřít obsah">×</button></div><nav>{sections.map(s => <a key={s.id} href={`#${s.id}`} aria-current={active === s.id ? 'location' : undefined} onClick={() => closeTo(s.id)}>{s.label}<span aria-hidden="true">↗</span></a>)}</nav><AppointmentLink onNavigate={() => closeTo('kontakt')} /></div></aside>;
}
