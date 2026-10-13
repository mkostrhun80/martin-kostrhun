'use client';
import { useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { sitePath } from '@/lib/site-path';
import { AppointmentLink } from './AppointmentLink';
import { ContentsPanel, usePageProgress } from './Contents';

export function Navigation({ isHome = true }: { isHome?: boolean }) {
  const [open, setOpen] = useState(false);
  const target = useRef<string | null>(null);
  const choose = (id: string) => { target.current = id; setOpen(false); };
  const prefix = isHome ? '' : sitePath('/');
  const { sections, active, progress } = usePageProgress(isHome);
  return <><a className="skip-link" href="#main">Přejít k obsahu</a><header className="site-header"><a href={`${prefix}#domu`} className="monogram" aria-label="Martin Kostrhun – domů">MK<span>.</span></a><nav className="header-links" aria-label="Hlavní navigace">{sections.filter(s => ['sluzby', 'o-mne', 'otazky'].includes(s.id)).map(s => <a key={s.id} href={`${prefix}#${s.id}`} aria-current={isHome && active === s.id ? 'location' : undefined}>{s.short}</a>)}</nav><AppointmentLink isHome={isHome} className="site-button header-appointment"/><Dialog open={open} onOpenChange={setOpen}><DialogTrigger className="contents-trigger"><Menu size={18} aria-hidden="true"/>Obsah</DialogTrigger><DialogContent className="contents-dialog" showCloseButton={false} overlayClassName="contents-overlay" onCloseAutoFocus={e => {
    if (isHome && target.current) { e.preventDefault(); const id = target.current; target.current = null; requestAnimationFrame(() => { const el = document.getElementById(id); el?.setAttribute('tabindex', '-1'); el?.focus({ preventScroll: true }); }); }
  }}><ContentsPanel isHome={isHome} active={active} progress={progress} choose={choose}/></DialogContent></Dialog></header></>;
}
