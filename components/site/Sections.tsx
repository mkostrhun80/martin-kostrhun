import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { sitePath } from '@/lib/site-path';
import { assets, siteConfig } from '@/lib/site-config';
import { documents } from '@/lib/content';
import { ContactExperience } from './ContactExperience';
import { PrivacySettingsButton } from './PrivacyPreferences';
import { PictureFrame } from './PictureFrame';
import { SafeEmailLink } from './SafeEmailLink';

export function About() {
  return (
    <section id="o-mne" className="section-band band-linen" aria-labelledby="about-heading">
      <div className="section-shell about-grid">
        <div className="about-copy">
          <header className="section-header" data-reveal="mask" style={{ marginBottom: 0 }}>
            <h2 id="about-heading" className="section-heading-display">
              Martin Kostrhun.
            </h2>
            <p className="about-role-line">Finanční specialista · eDO finance · Hradec Králové</p>
          </header>

          <p>
            Pomáhám s financováním bydlení, pojištěním, investicemi i realitami. Zajímá mě, co opravdu
            potřebujete, abychom vašim financím společně dali směr podle vašich představ.
          </p>
          <p>
            Vedle práce dokončuji studium informačního managementu na Univerzitě Hradec Králové. Duší jsem
            sportovec — baví mě fotbal, fitko, cestování a objevování nových věcí.
          </p>
          <p>
            Zakládám si na férovosti a otevřené komunikaci. Chci, abyste rozuměli každému společnému kroku a
            mohli se kdykoliv zeptat. Podpis smlouvy je pro mě začátkem dlouhodobého partnerství, které se
            vyvíjí spolu s vaším životem.
          </p>

          <blockquote className="about-quote" data-reveal="mask">
            „Finance nejsou cíl, jsou prostředkem k životu podle vašich představ.“
          </blockquote>

          <div className="about-signature-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="about-signature"
              src={sitePath('/images/signature.svg')}
              alt=""
              aria-hidden="true"
              width={200}
              height={58}
              loading="lazy"
              decoding="async"
            />
            <a className="site-button" href={siteConfig.linkedinUrl} target="_blank" rel="noreferrer">
              Profil na LinkedIn <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>

          <dl className="about-meta">
            <div>
              <dt>Působnost</dt>
              <dd>Hradec Králové</dd>
            </div>
            <div>
              <dt>Forma schůzek</dt>
              <dd>Osobně i online</dd>
            </div>
            <div>
              <dt>Registrace</dt>
              <dd>IČO {siteConfig.ico}</dd>
            </div>
          </dl>
        </div>

        <figure className="editorial-media about-media" data-reveal="shutter">
          <PictureFrame spec={assets.responsive.about} className="editorial-plate" />
        </figure>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section
      id="kontakt"
      className="section-band band-navy has-contours"
      data-chapter="dark"
      aria-label="Kontakt s Martinem Kostrhunem"
    >
      <div className="section-shell">
        <ContactExperience />
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer band-navy has-contours" data-chapter="dark">
      <div className="footer-inner">
        <div className="footer-masthead-wrap">
          <p className="footer-masthead">
            Martin Kostrhun<span>.</span>
          </p>
          <p className="footer-tagline">Finanční poradenství v Hradci Králové a online.</p>
        </div>

        <div className="footer-columns">
          <div className="footer-col">
            <Link className="footer-monogram" href="/#domu" prefetch={false}>
              MK<span>.</span>
            </Link>
            <p>
              {siteConfig.name}
              <br />
              Finanční specialista
            </p>
            <SafeEmailLink />
            <a href={siteConfig.phoneHref}>{siteConfig.phone}</a>
          </div>

          <div className="footer-col">
            <h2>Identifikace</h2>
            <p>
              IČO: {siteConfig.ico}
              <br />
              Datová schránka: {siteConfig.dataBox}
            </p>
            <p>
              {siteConfig.address}
              <br />
              {siteConfig.city}
              <br />
              Česko
            </p>
            <p>
              Fyzická osoba zapsaná
              <br />
              v živnostenském rejstříku.
            </p>
          </div>

          <div className="footer-col">
            <h2>Dokumenty</h2>
            {documents.map(doc => (
              <a
                key={doc.href}
                href={sitePath(doc.href)}
                {...(doc.href.startsWith('https') ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {doc.title}
              </a>
            ))}
          </div>

          <div className="footer-col">
            <h2>Další informace</h2>
            <PrivacySettingsButton />
            <Link href="/#zpetna-vazba" prefetch={false}>
              Zanechat zpětnou vazbu
            </Link>
            <Link href="/#zkusenosti" prefetch={false}>
              Zkušenosti klientů
            </Link>
            <a href={siteConfig.registryUrl} target="_blank" rel="noreferrer">
              Registr ČNB
            </a>
            <a
              href="https://financniarbitr.cz/cs/informace-pro-verejnost/caste-otazky.html"
              target="_blank"
              rel="noreferrer"
            >
              Finanční arbitr
            </a>
            <a href="https://coi.gov.cz/informace-o-adr/" target="_blank" rel="noreferrer">
              Česká obchodní inspekce
            </a>
            <a href={siteConfig.linkedinUrl} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </div>
        </div>

        {siteConfig.originalRegulatoryFooter && (
          <p className="footer-regulatory">{siteConfig.originalRegulatoryFooter}</p>
        )}

        <div className="footer-bottom">
          <span>© 2026 Martin Kostrhun</span>
          <Link href="/#domu" prefetch={false}>
            Zpět nahoru ↑
          </Link>
        </div>
      </div>
    </footer>
  );
}
