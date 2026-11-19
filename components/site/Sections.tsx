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
    <section id="o-mne" className="section-band band-stone" aria-labelledby="about-heading">
      <div className="section-shell about-grid">
        <figure className="editorial-media">
          <PictureFrame spec={assets.responsive.about} />
        </figure>

        <div className="about-copy">
          <h2 id="about-heading" className="section-heading-display">
            O mně.
          </h2>
          <h3 className="about-subhead">Ahoj, já jsem Martin.</h3>
          <p>
            Jsem finanční poradce v eDO finance, a.s., v Hradci Králové. Pomáhám s financováním bydlení,
            pojištěním, investicemi i realitami. Zajímá mě, co opravdu potřebujete, abychom vašim financím
            společně dali směr podle vašich představ.
          </p>
          <p>
            Vedle práce dokončuji studium informačního managementu na Univerzitě Hradec Králové. Duší jsem
            sportovec — baví mě fotbal, fitko, cestování a objevování nových věcí.
          </p>
          <p>
            Zakládám si na férovosti a otevřené komunikaci. Chci, abyste rozuměli každému společnému kroku a mohli se
            kdykoliv zeptat. Podpis smlouvy je pro mě začátkem dlouhodobého partnerství, které se vyvíjí spolu s
            vaším životem.
          </p>
          <blockquote className="about-quote">
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
              LinkedIn <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
          <div className="about-meta">
            <span>Hradec Králové</span>
            <span>Osobně i online</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section
      id="kontakt"
      className="section-band band-alabaster"
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
    <footer className="site-footer">
      <div className="footer-inner">
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
