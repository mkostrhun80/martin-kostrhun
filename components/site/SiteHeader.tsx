'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { indexSections, siteSections, type SectionId } from '@/lib/site-sections';
import { siteConfig } from '@/lib/site-config';
import { sitePath } from '@/lib/site-path';
import { AppointmentLink } from './AppointmentLink';
import { SafeEmailLink } from './SafeEmailLink';

function sectionHref(id: string, isHome: boolean) {
  return `${isHome ? '' : sitePath('/')}#${id}`;
}

export function SiteHeader({ isHome = false }: { isHome?: boolean }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<SectionId>('domu');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!isHome) return;
    const ids = siteSections.map(s => s.id);
    const elements = ids
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!elements.length) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const current = ids.find(id => visible.has(id));
        if (current) setActive(current);
      },
      { rootMargin: '-22% 0px -55% 0px', threshold: 0 },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [isHome]);

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) {
        wasOpen.current = false;
        triggerRef.current?.focus();
      }
      return;
    }
    wasOpen.current = true;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => closeRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 900) setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return (
    <>
      <header className="site-header" data-header-theme={isHome ? 'dark' : 'light'}>
        <div className="site-header-inner">
          <a className="header-brand" href={sectionHref('domu', isHome)} aria-label="Martin Kostrhun — úvod">
            <span className="header-monogram">
              MK<span>.</span>
            </span>
            <span className="header-brand-name">Martin Kostrhun</span>
          </a>

          <nav className="header-nav-desktop" aria-label="Hlavní navigace">
            {indexSections.map(section => (
              <a
                key={section.id}
                href={sectionHref(section.id, isHome)}
                aria-current={isHome && active === section.id ? 'location' : undefined}
              >
                {section.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <AppointmentLink className="site-button header-cta" isHome={isHome}>
              Domluvit schůzku
            </AppointmentLink>
            <AppointmentLink className="site-button header-cta-mobile" isHome={isHome}>
              Schůzka
            </AppointmentLink>
            <button
              ref={triggerRef}
              type="button"
              className="mobile-menu-trigger"
              aria-expanded={open}
              aria-controls="mobile-nav-drawer"
              onClick={() => setOpen(value => !value)}
            >
              <Menu size={18} aria-hidden="true" />
              <span>Menu</span>
            </button>
          </div>
        </div>
        {isHome && <div className="scroll-progress-bar" aria-hidden="true" />}
      </header>

      <div
        id="mobile-nav-drawer"
        className="mobile-drawer-backdrop"
        hidden={!open}
        aria-hidden={!open}
        onClick={event => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigace webu">
          <div className="mobile-drawer-top">
            <span className="mobile-drawer-label">Navigace</span>
            <button
              ref={closeRef}
              type="button"
              className="mobile-drawer-close"
              onClick={() => setOpen(false)}
              aria-label="Zavřít menu"
            >
              <X size={18} aria-hidden="true" />
              <span>Zavřít</span>
            </button>
          </div>

          <nav className="mobile-drawer-nav" aria-label="Sekce webu">
            {siteSections.map(section => (
              <a
                key={section.id}
                href={sectionHref(section.id, isHome)}
                aria-current={isHome && active === section.id ? 'location' : undefined}
                onClick={() => setOpen(false)}
              >
                <span>{section.label}</span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            ))}
            <a href={sectionHref('kalkulacka', isHome)} onClick={() => setOpen(false)}>
              <span>Orientační kalkulačka</span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </nav>

          <div className="mobile-drawer-footer">
            <div className="mobile-drawer-contact">
              <a href={siteConfig.phoneHref}>{siteConfig.phone}</a>
              <SafeEmailLink />
            </div>
            <AppointmentLink
              className="site-button"
              isHome={isHome}
              onNavigate={() => setOpen(false)}
            >
              Domluvit konzultaci
            </AppointmentLink>
          </div>
        </div>
      </div>

      <noscript>
        <nav className="header-nojs-nav" aria-label="Navigace bez JavaScriptu">
          {siteSections.map(section => (
            <a key={section.id} href={sectionHref(section.id, isHome)}>
              {section.label}
            </a>
          ))}
        </nav>
      </noscript>
    </>
  );
}
