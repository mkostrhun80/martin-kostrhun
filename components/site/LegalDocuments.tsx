import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

const edoDocuments = 'https://www.edogroup.cz/cz/ke-stazeni';
const edoPrivacy = 'https://www.edogroup.cz/cz/gdpr';
const cnbRegister = 'https://www.cnb.cz/cnb/jerrs';

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer">{children}</a>;
}

function Identity() {
  return <p>{siteConfig.name}<br/>IČO: {siteConfig.ico}<br/>
    Datová schránka: {siteConfig.dataBox}<br/>{siteConfig.address}, {siteConfig.city}, Česko<br/>
    E-mail: <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a><br/>
    Telefon: <a href={siteConfig.phoneHref}>{siteConfig.phone}</a></p>;
}

export function LegalInformation() {
  return <>
    <p className="legal-intro">Údaje o poradci, spolupráci s eDO a dokumentech k finančním službám.</p>
    <section aria-labelledby="legal-identity"><h2 id="legal-identity">Identifikace poradce</h2>
      <Identity/><p>Fyzická osoba zapsaná v živnostenském rejstříku.</p></section>
    <section aria-labelledby="legal-registration"><h2 id="legal-registration">Postavení a oprávnění</h2>
      <p>Finanční služby uvedené na tomto webu zprostředkovávám jako vázaný zástupce společnosti eDO finance, a.s., IČO 24783421, se sídlem V parku 2335/20, Chodov, 148 00 Praha 4. Společnost působí jako investiční zprostředkovatel a samostatný zprostředkovatel v dalších níže uvedených oblastech.</p>
      <ul>
        <li>Investice — zákon č. 256/2004 Sb.</li>
        <li>Spotřebitelské úvěry — zákon č. 257/2016 Sb.</li>
        <li>Pojištění — zákon č. 170/2018 Sb.</li>
        <li>Doplňkové penzijní spoření — zákon č. 427/2011 Sb.</li>
      </ul>
      <p>Aktuální registraci poradce a konkrétní rozsah oprávnění lze ověřit v <ExternalLink href={cnbRegister}>registru České národní banky</ExternalLink> pomocí jména Martin Kostrhun nebo IČO {siteConfig.ico}.</p>
</section>
    <section aria-labelledby="legal-documents"><h2 id="legal-documents">Právní dokumenty, reklamace a oznámení</h2>
      <p>Informace o službách, reklamacích, stížnostech, řešení sporů, dohledu a udržitelnosti najdete v aktuálních dokumentech eDO. Ve stejné sekci jsou zveřejněny také informace o vnitřním oznamovacím systému.</p>
      <div className="legal-links">
        <ExternalLink href={edoDocuments}>Právní dokumenty a reklamační řád eDO</ExternalLink>
        <ExternalLink href={edoDocuments}>Whistleblowing — oznamovací systém eDO</ExternalLink>
        <ExternalLink href="https://financniarbitr.cz/cs/informace-pro-verejnost/caste-otazky.html">Finanční arbitr — řešení sporů</ExternalLink>
        <ExternalLink href="https://coi.gov.cz/informace-o-adr/">Česká obchodní inspekce — mimosoudní řešení sporů</ExternalLink>
      </div></section>
    <section aria-labelledby="legal-dpo"><h2 id="legal-dpo">Ochrana osobních údajů</h2>
      <p>Zpracování údajů na tomto webu popisuje <Link href="/dokumenty/osobni-udaje">Ochrana osobních údajů</Link>. Pro zpracování údajů ve skupině eDO jsou určující její <ExternalLink href={edoPrivacy}>aktuální zásady GDPR</ExternalLink>. Pověřence eDO lze kontaktovat na <a href="mailto:poverenec@edofinance.cz">poverenec@edofinance.cz</a>.</p></section>
    <section aria-labelledby="legal-laws"><h2 id="legal-laws">Související právní předpisy</h2>
      <ul>
        <li>Zákon č. 256/2004 Sb., o podnikání na kapitálovém trhu.</li>
        <li>Zákon č. 257/2016 Sb., o spotřebitelském úvěru.</li>
        <li>Zákon č. 170/2018 Sb., o distribuci pojištění a zajištění.</li>
        <li>Zákon č. 427/2011 Sb., o doplňkovém penzijním spoření.</li>
        <li>Zákon č. 634/1992 Sb., o ochraně spotřebitele, a zákon č. 40/1995 Sb., o regulaci reklamy.</li>
        <li>Nařízení (EU) 2016/679 (GDPR) a zákon č. 110/2019 Sb., o zpracování osobních údajů.</li>
      </ul></section>
  </>;
}


export function PrivacyInformation() {
  return <>
    <p className="legal-intro">Jak pracuji s údaji z dotazů, rezervací a zpětné vazby.</p>
    <section aria-labelledby="privacy-controller"><h2 id="privacy-controller">1. Správce a kontakt</h2><Identity/><p>Správcem údajů získaných přes tento web je Martin Kostrhun. Zpracování při poskytování služeb eDO upravují samostatně <ExternalLink href={edoPrivacy}>zásady eDO</ExternalLink>; kontakt pověřence je <a href="mailto:poverenec@edofinance.cz">poverenec@edofinance.cz</a>.</p></section>
    <section aria-labelledby="privacy-contact"><h2 id="privacy-contact">2. Zprávy a zpětná vazba</h2>
      <p>Kontaktní formulář zpracuje jméno, soukromý e-mail, téma a zprávu. Použiji je k odpovědi a domluvě spolupráce. Zpětná vazba navíc obsahuje hodnocení, zkušenost a případně jméno pro zveřejnění. Oba formuláře doručuje <ExternalLink href="https://web3forms.com/privacy">Web3Forms</ExternalLink> na <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. Tento web nemá vlastní databázi podání. Formulář potvrzuje úspěch až po kladné odpovědi doručovací služby.</p>
      <p>Odeslání z webu chrání <ExternalLink href="https://www.hcaptcha.com/privacy">hCaptcha (Intuition Machines, Inc.)</ExternalLink>. Načte se až po vašem povolení; zpracuje technické údaje o zařízení a spojení a výsledek ověření. Ověřovací token předáváme Web3Forms spolu s podáním. Bez této služby můžete napsat přímo e-mailem. Vyplněná zpráva zůstává do odeslání jen v paměti otevřené stránky, ne v trvalém úložišti prohlížeče.</p>
      <p>Jednání o službě na vaši žádost vychází z čl. 6 odst. 1 písm. b) GDPR. Vyřízení jiných dotazů a soukromé zpětné vazby vychází z oprávněného zájmu na komunikaci a zlepšování služeb podle čl. 6 odst. 1 písm. f). Použití formuláře není souhlasem se zasíláním reklamy. Nevkládejte čísla smluv, kopie dokladů ani citlivé údaje.</p></section>
    <section aria-labelledby="privacy-reference"><h2 id="privacy-reference">3. Zveřejnění zkušenosti je dobrovolné</h2>
      <p>Zpětnou vazbu můžete poslat bez souhlasu se zveřejněním. Pokud jej udělíte podle čl. 6 odst. 1 písm. a) GDPR, uloží se v e-mailu také znění a verze souhlasu a čas podání. Po ověření skutečné spolupráce ručně vybírám zkušenosti ke zveřejnění. Veřejné je jen schválené jméno, hodnocení, zkušenost a datum; e-mail nezveřejňuji. Podání se nikdy nezveřejní automaticky.</p>
      <p>Souhlas můžete kdykoli odvolat na <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. Zveřejněnou referenci poté odstraním. Odvolání nemění zákonnost předchozího zpracování. Tento souhlas nezahrnuje sociální sítě ani další propagační materiály.</p></section>
    <section aria-labelledby="privacy-booking"><h2 id="privacy-booking">4. Rezervace a kalendář</h2>
      <p>Je-li na stránce dostupná online rezervace, termíny a potvrzovací zprávy zajišťuje <ExternalLink href="https://cal.com/privacy">Cal.com</ExternalLink>. Vložený kalendář se připojí až po otevření rezervace a vašem povolení. Zpracuje jméno, e-mail, termín a případné další údaje, které do rezervace zadáte. Technické potvrzení může odeslat Cal.com; pracovní kontakt poradce je {siteConfig.email}.</p>
      <p>Rezervace se zapisuje do samostatného Apple iCloud kalendáře poradce přes Apple Calendar integraci. Obsazenost jeho připojených Apple a Google kalendářů slouží k vyřazení kolidujících termínů. Údaje o schůzce tak zpracovává také Apple podle <ExternalLink href="https://www.apple.com/legal/privacy/cz/">svých zásad soukromí</ExternalLink>. Nastavení služby se ověřuje před zpřístupněním rezervací. Schůzku lze vždy domluvit přímo e-mailem.</p></section>
    <section aria-labelledby="privacy-providers"><h2 id="privacy-providers">5. Příjemci, hosting a předávání</h2>
      <p>Statické soubory webu doručuje hosting. Nová verze je připravena pro <ExternalLink href="https://www.cloudflare.com/privacypolicy/">Cloudflare Pages</ExternalLink>; kopie na adrese github.io používá <ExternalLink href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">GitHub Pages</ExternalLink>. Hosting zpracovává zejména IP adresu a provozní záznamy pro doručení a bezpečnost. Lokální náhled se veřejnému hostingu neposílá.</p>
      <p>Příjemci podání jsou správce, jeho pracovní e-mailová služba a Web3Forms. Při povolení ochrany formuláře se zapojí hCaptcha; při povolené rezervaci Cal.com a následně Apple. Tito poskytovatelé mohou pracovat s údaji mimo Evropský hospodářský prostor. Podmínky, ochranná opatření a případné předávání popisují jejich odkazované zásady a <ExternalLink href="https://web3forms.com/dpa">smlouva o zpracování údajů Web3Forms</ExternalLink>. Další zpracování při finančních službách upravují dokumenty eDO.</p>
      <p>Nepoužívám Google Analytics, reklamní pixely ani profilování. Externí odkazy například na LinkedIn se otevřou až po vašem kliknutí.</p></section>
    <section aria-labelledby="privacy-retention"><h2 id="privacy-retention">6. Uchování a zabezpečení</h2>
      <p>Dotazy a neveřejnou zpětnou vazbu uchovávám po dobu vyřízení a navazující komunikace. Po jejím skončení údaje mažu, pokud nejsou dále potřebné pro doložení souhlasu, ochranu práv nebo splnění právní povinnosti. Zveřejněné zkušenosti uchovávám do odvolání souhlasu nebo ukončení účelu. Při navázání finanční služby platí také příslušné zákonné lhůty a dokumenty eDO. Samostatné doby uchování u poskytovatelů upravují jejich zásady.</p>
      <p>Veřejná verze používá HTTPS. Veřejný odesílací klíč formuláře neumožňuje číst přijaté zprávy. Zprávy a hodnocení jsou v pracovní e-mailové schránce; web nemá veřejnou administraci ani vlastní API.</p></section>
    <section aria-labelledby="privacy-rights"><h2 id="privacy-rights">7. Vaše práva</h2>
      <p>Za podmínek GDPR máte právo na přístup, opravu, výmaz, omezení zpracování a přenositelnost údajů. Proti zpracování z oprávněného zájmu můžete vznést námitku; souhlas lze odvolat. Žádosti pošlete na <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. Vyřizuji je bez zbytečného odkladu, zpravidla do jednoho měsíce; v zákonných případech se lhůta může prodloužit.</p>
      <p>Stížnost můžete podat u <ExternalLink href="https://uoou.gov.cz/kontakt">Úřadu pro ochranu osobních údajů</ExternalLink>, Pplk. Sochora 27, 170 00 Praha 7. Web neprovádí automatizované rozhodování. Úložiště a odvolání povolení externích služeb popisují <Link href="/dokumenty/cookies">Zásady cookies</Link>.</p></section>
  </>;
}
export function CookiesInformation() {
  return <>
    <p className="legal-intro">Externí kalendář a ochranu formulářů připojím až po vašem povolení. Analytické ani reklamní měření web nepoužívá.</p>
    <section aria-labelledby="cookies-local"><h2 id="cookies-local">1. Úložiště tohoto webu</h2><p>První návštěva nevyžaduje souhlasovou lištu: volitelné externí služby jsou vypnuté. Pro základní funkce používám následující technické záznamy; neobsahují zprávu ani vaše kontaktní údaje.</p>
      <div className="legal-table-wrap"><table><thead><tr><th>Záznam</th><th>Účel</th><th>Doba</th></tr></thead><tbody>
        <tr><td>sessionStorage: mk.signature.hero.v4</td><td>Zapamatuje přehrání úvodního podpisu.</td><td>Relace dané karty</td></tr>
        <tr><td>sessionStorage: appointment-topic</td><td>Přenese vybrané téma do kontaktního formuláře.</td><td>Do předání formuláři, nejdéle relace karty</td></tr>
        <tr><td>localStorage: mk.privacy.v1</td><td>Uchová verzi, čas a vaše povolení nebo odmítnutí externích služeb.</td><td>Volba platí 180 dní; záznam lze dříve změnit nebo vymazat v prohlížeči.</td></tr>
      </tbody></table></div></section>
    <section aria-labelledby="cookies-external"><h2 id="cookies-external">2. Volitelné externí služby</h2><p><strong>Cal.com:</strong> vložený kalendář se načte až po otevření rezervace a tlačítku „Povolit a načíst kalendář“, případně na základě dříve uložené volby. Prohlížeč se spojí s poskytovatelem a může použít jeho cookies či úložiště pro rezervaci. <ExternalLink href="https://cal.com/privacy">Soukromí Cal.com</ExternalLink>.</p>
      <p><strong>hCaptcha:</strong> ochrana formuláře se načte až po povolení a přiblížení k formuláři. Poskytovatel pracuje s technickými údaji a může ukládat vlastní záznamy pro ověření proti automatům. Konkrétní záznamy se mohou lišit podle prohlížeče a způsobu ověření. <ExternalLink href="https://www.hcaptcha.com/privacy">Soukromí hCaptcha</ExternalLink>.</p>
      <p>Obě služby lze odmítnout a použít přímý e-mail. Web3Forms se kontaktuje až při odeslání formuláře. Apple iCloud se z prohlížeče návštěvníka přímo nenačítá; slouží ke kalendáři poradce. Podrobnosti o údajích a jejich příjemcích jsou v <Link href="/dokumenty/osobni-udaje">Ochraně osobních údajů</Link>.</p></section>
    <section aria-labelledby="cookies-choice"><h2 id="cookies-choice">3. Změna volby a odvolání</h2><p>V patičce zvolte „Nastavení soukromí“. Můžete rovnocenně přijmout vše, odmítnout vše nebo uložit jednotlivé volby. Odmítnutí nezpřístupní externí kalendář ani hCaptcha. Při odvolání již povolené hCaptcha se stránka obnoví, aby se odpojil i její stažený skript; rozepsanou zprávu si předem zkopírujte.</p>
      <p>Odpojení služby samo nevymaže záznamy, které už dříve uložila. Ty lze odstranit v nastavení prohlížeče. Externí stránka otevřená samostatným odkazem se řídí vlastními pravidly; nastavení na tomto webu ji neovládá.</p></section>
    <section aria-labelledby="cookies-browser"><h2 id="cookies-browser">4. Správa v prohlížeči</h2><div className="legal-links"><ExternalLink href="https://support.google.com/chrome/answer/95647">Google Chrome</ExternalLink><ExternalLink href="https://support.mozilla.org/cs/kb/povoleni-zakazani-cookies">Mozilla Firefox</ExternalLink><ExternalLink href="https://support.apple.com/cs-cz/guide/safari/sfri11471/mac">Safari</ExternalLink><ExternalLink href="https://support.microsoft.com/cs-cz/microsoft-edge">Microsoft Edge</ExternalLink></div></section>
    <section aria-labelledby="cookies-contact"><h2 id="cookies-contact">5. Kontakt</h2><Identity/><p>Kdykoli mi můžete napsat ohledně soukromí a fungování webu.</p></section>
  </>;
}
