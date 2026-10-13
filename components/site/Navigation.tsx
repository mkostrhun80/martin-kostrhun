'use client';
import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { sitePath } from '@/lib/site-path';
import { visibleSections } from '@/lib/public-data';
import { useSiteData } from './SiteData';
import { AppointmentLink } from './AppointmentLink';
export function Navigation({ isHome = true }: {
    isHome?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const target = useRef<string | null>(null);
    const choose = (id: string) => { target.current = id; setOpen(false); };
    const prefix = isHome ? '' : sitePath('/');
    const sections = visibleSections(useSiteData());
    return <><a className="skip-link" href="#main">Přejít k obsahu</a><header className="site-header"><a href={`${prefix}#domu`} className="monogram" aria-label="Martin Kostrhun – domů">MK<span>.</span></a><span className="header-identity">MARTIN KOSTRHUN<br /><span>FINANČNÍ SPECIALISTA · eDO finance</span></span><nav className="header-links" aria-label="Hlavní navigace">{sections.filter(s => ['sluzby', 'o-mne', 'otazky'].includes(s.id)).map(s => <a key={s.id} href={`${prefix}#${s.id}`}>{s.short}</a>)}</nav><AppointmentLink isHome={isHome} className="site-button header-appointment"/><Dialog open={open} onOpenChange={setOpen}><DialogTrigger className="contents-trigger">Obsah <span aria-hidden="true">＋</span></DialogTrigger><DialogContent className="contents-dialog" showCloseButton={false} onCloseAutoFocus={e => { if (isHome && target.current) { e.preventDefault(); const id = target.current; target.current = null; requestAnimationFrame(() => { const el = document.getElementById(id); el?.setAttribute('tabindex', '-1'); el?.focus({preventScroll:true}); }); } }}><DialogTitle>Na webu najdete</DialogTitle><DialogDescription>Vyberte část, která vás zajímá.</DialogDescription><nav aria-label="Obsah webu"><a href={`${prefix}#domu`} onClick={() => choose('domu')}>Úvod <span>↗</span></a>{sections.map(s => <a key={s.id} href={`${prefix}#${s.id}`} onClick={() => choose(s.id)}>{s.label}<span>↗</span></a>)}</nav><DialogClose className="site-button site-button-quiet">Zavřít obsah</DialogClose></DialogContent></Dialog></header></>;
}
