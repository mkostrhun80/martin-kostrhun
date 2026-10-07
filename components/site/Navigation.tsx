'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { sitePath } from '@/lib/site-path';
import { siteConfig } from '@/lib/site-config';
const links=[['Domů','domu'],['Služby','sluzby'],['O mně','o-mne'],['Kontakt','kontakt']];
export function Navigation({isHome=true}:{isHome?:boolean}) {
 const [open,setOpen]=useState(false); const prefix=isHome?'':sitePath('/');
 return <><a className="skip-link" href="#main">Přejít k obsahu</a><header className="navigation"><a href={`${prefix}#domu`} className="monogram" aria-label="Martin Kostrhun – domů">MK<span>.</span></a><span className="nav-description">MARTIN KOSTRHUN<br/>FINANČNÍ SPECIALISTA</span><nav aria-label="Hlavní navigace">{links.slice(1).map(([name,id])=><a key={id} href={`${prefix}#${id}`}>{name.toUpperCase()}</a>)}<Dialog open={open} onOpenChange={setOpen}><DialogTrigger className="menu-trigger">MENU <span>＋</span></DialogTrigger><DialogContent className="fullscreen-menu" showCloseButton={false}><div className="menu-top"><a className="monogram" href={`${prefix}#domu`} onClick={()=>setOpen(false)}>MK<span>.</span></a><DialogClose className="close-link">ZAVŘÍT <span>×</span></DialogClose></div><DialogTitle className="sr-only">Navigace webu</DialogTitle><DialogDescription className="sr-only">Vyberte část webu Martina Kostrhuna.</DialogDescription><nav className="menu-links" aria-label="Rozšířená navigace">{links.map(([name,id],i)=><a key={id} href={`${prefix}#${id}`} onClick={()=>setOpen(false)}><span>0{i+1}</span>{name}</a>)}</nav><div className="menu-bottom"><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a><a href={siteConfig.linkedinUrl} target="_blank" rel="noreferrer">LINKEDIN</a><span>HRADEC KRÁLOVÉ / CZ</span></div></DialogContent></Dialog></nav></header></>;
}
