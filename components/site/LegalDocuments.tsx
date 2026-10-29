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
    <p className="legal-intro">Informace o kontaktních údajích, fungování formuláře a vašich právech.</p>
    <section aria-labelledby="privacy-controller"><h2 id="privacy-controller">1. Správce a kontakt</h2>
      <p>Pro dotazy zaslané přímo prostřednictvím kontaktů na tomto webu je kontaktní osobou a správcem údajů Martin Kostrhun.</p><Identity/>
      <p>Zpracování údajů při poskytování služeb skupiny eDO upravují samostatně <ExternalLink href={edoPrivacy}>zásady ochrany osobních údajů eDO</ExternalLink>. Pro tyto záležitosti je kontaktem pověřenec na <a href="mailto:poverenec@edofinance.cz">poverenec@edofinance.cz</a>.</p></section>
    <section aria-labelledby="privacy-data"><h2 id="privacy-data">2. Jaké údaje a za jakým účelem</h2>
      <p>Při kontaktování pracuji s údaji, které mi sami sdělíte: jménem, e-mailem nebo telefonem, zvoleným tématem a případnou zprávou. Slouží k odpovědi na dotaz, domluvě konzultace a jednání o případné spolupráci. Kontaktní údaj je potřebný, abych vám mohl odpovědět; další informace ve zprávě jsou dobrovolné.</p>
      <p>Kontaktní formulář předá zprávu službě Web3Forms, která zajišťuje její odeslání na pracovní e-mail Martina Kostrhuna. Potvrzení odeslání se zobrazí až po kladné odpovědi této služby. Při chybě nebo neaktivním doručování zůstane text vyplněný a lze použít přímý e-mail. Obsah zprávy se neukládá do trvalého úložiště prohlížeče.</p>
      <p>Jednání o službě na vaši žádost vychází z čl. 6 odst. 1 písm. b) GDPR. Vyřízení jiných dotazů může vycházet z oprávněného zájmu na komunikaci podle čl. 6 odst. 1 písm. f). Samotné použití formuláře není souhlasem se zasíláním reklamy.</p></section>
    <section aria-labelledby="privacy-providers"><h2 id="privacy-providers">3. Příjemci a provoz webu</h2>
      <p>Jméno, e-mail, téma a text kontaktní zprávy se při odeslání předávají službě <ExternalLink href="https://web3forms.com/privacy">Web3Forms</ExternalLink> pro doručení na pracovní e-mail správce. Zpětnou vazbu a souhlasy v připojené plné verzi ukládá databáze Cloudflare D1. K soukromé správě má přístup pouze oprávněný správce přes Cloudflare Access. E-mailové zprávy odeslané mimo formulář zpracovává poskytovatel e-mailové služby. Pokud naváže poskytování finanční služby prostřednictvím eDO, vztahují se na další zpracování informace o příjemcích a předávání údajů uvedené v zásadách eDO.</p>
      <p>Statickou verzi hostuje GitHub Pages; plná verze je připravena pro Cloudflare Workers a D1. Lokální náhled používá oddělenou databázi pouze na zařízení vlastníka. Podrobnosti o Cloudflare jsou na https://www.cloudflare.com/privacypolicy/. GitHub při návštěvě své hostované verze zaznamenává IP adresy pro bezpečnostní účely; podrobnosti včetně mezinárodního zpracování popisuje <ExternalLink href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">prohlášení GitHubu o ochraně soukromí</ExternalLink>.</p>
      <p>Web nepoužívá Google Analytics ani reklamní měřicí nástroje. Externí doručovací služba Web3Forms při zpracování zpráv používá vlastní ochranu proti spamu. LinkedIn a další externí stránky se otevírají pouze prostřednictvím odkazů; po přechodu se uplatní zásady jejich provozovatelů.</p></section>
    <section aria-labelledby="privacy-retention"><h2 id="privacy-retention">4. Uchovávání a zabezpečení</h2>
      <p>Údaje související s dotazem se uchovávají po dobu potřebnou k jeho vyřízení a případné navazující komunikaci. Pokud vznikne smluvní vztah nebo zákonná povinnost údaje uchovávat, platí odpovídající lhůty pro danou službu, popsané také v dokumentech eDO.</p>
      <p>Web je dostupný prostřednictvím zabezpečeného HTTPS připojení. Kontaktní zprávy zpracovává Web3Forms; její <ExternalLink href="https://web3forms.com/privacy">zásady soukromí</ExternalLink> uvádějí maximální uchování podání po dobu tří let. Informace o příjemcích a případném zpracování mimo Evropský hospodářský prostor popisuje také její <ExternalLink href="https://web3forms.com/dpa">smlouva o zpracování údajů</ExternalLink>. Zpětná vazba se ukládá na server pouze v připojené plné verzi. U veřejných odpovědí se používá omezení počtu požadavků; pro tento účel se ukládá krátkodobý hash IP adresy, nikoli její čitelná podoba. Do úvodního dotazu prosím nevkládejte kopie dokladů ani podrobné citlivé údaje.</p></section>
    <section aria-labelledby="privacy-feedback"><h2>Zpětná vazba a reference</h2><p>Zpětná vazba obsahuje jméno, soukromý e-mail, hodnocení a zkušenost. Podání není podmíněno souhlasem se zveřejněním. Pro zveřejnění na webu a použití na sociálních sítích či v prezentačních materiálech jsou samostatné dobrovolné souhlasy. Ukládá se jejich znění, verze, čas a případné odvolání. E-mail není veřejný. Souhlas lze odvolat soukromým odkazem po odeslání nebo e-mailem správci; reference bude stažena a nebude dále propagačně používána.</p><p>Pro ověřenou pozvánku správce eviduje e-mail skutečného klienta a jednorázový odkaz s dobou platnosti. Veřejný formulář sám nepotvrzuje skutečnou spolupráci. Podrobnosti jsou uvedeny u zveřejněných hodnocení.</p><p>Konkrétní doby uchování zpráv a nezveřejněné zpětné vazby musí správce určit před ostrým spuštěním. Zveřejněné reference zůstávají do odvolání souhlasu nebo ukončení účelu; údaje lze na žádost vymazat, nejsou-li dány jiné zákonné důvody uchování.</p></section><section aria-labelledby="privacy-rights"><h2 id="privacy-rights">5. Vaše práva</h2>
      <p>Za podmínek GDPR máte právo požádat o přístup k údajům, jejich opravu, výmaz, omezení zpracování a přenositelnost. Proti zpracování založenému na oprávněném zájmu můžete vznést námitku. Pokud je konkrétní zpracování založeno na souhlasu, můžete jej odvolat.</p>
      <p>Žádosti zasílejte na <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. Vyřizují se bez zbytečného odkladu, zpravidla nejpozději do jednoho měsíce; ve stanovených případech může být lhůta prodloužena. Můžete také podat stížnost u <ExternalLink href="https://uoou.gov.cz/kontakt">Úřadu pro ochranu osobních údajů</ExternalLink>, Pplk. Sochora 27, 170 00 Praha 7.</p>
      <p>Web neprovádí automatizované rozhodování ani profilování návštěvníků.</p></section>
    <section aria-labelledby="privacy-cookies"><h2 id="privacy-cookies">6. Cookies a aktualizace</h2>
      <p>Podrobnosti o ukládání údajů v prohlížeči najdete v <Link href="/dokumenty/cookies">Zásadách cookies</Link>. Tyto informace se upraví, pokud se změní funkce webu nebo způsob zpracování údajů.</p></section>
  </>;
}

export function CookiesInformation() {
  return <>
    <p className="legal-intro">Jak tento web pracuje s cookies a podobnými technologiemi.</p>
    <section aria-labelledby="cookies-intro"><h2 id="cookies-intro">1. Co jsou cookies</h2>
      <p>Cookie je malý záznam, který si web může uložit do prohlížeče a při další návštěvě znovu přečíst. Může sloužit například k zapamatování nastavení, přihlášení nebo měření návštěvnosti. Podobně může fungovat i místní úložiště prohlížeče.</p></section>
    <section aria-labelledby="cookies-used"><h2 id="cookies-used">2. Použití na tomto webu</h2>
      <p>Veřejná část nepoužívá analytické ani reklamní cookies, Google Analytics nebo reklamní pixely. Přihlášení správce používá nezbytné autentizační cookies Cloudflare Access. Lokální náhled má oddělenou přihlašovací cookie, která není součástí produkční autentizace.</p>
      <p>Animace pracují po dobu otevření stránky. Pro předání zvoleného tématu mezi částmi webu se používá dočasné sessionStorage. Formuláře neukládají vyplněné kontaktní údaje do cookies nebo trvalého místního úložiště. Spojení s externí doručovací službou Web3Forms se naváže až při odesílání zprávy; její zpracování podléhá vlastním zásadám soukromí.</p>
      <p>Proto zde není lišta pro udělení souhlasu s analytickými nebo reklamními cookies. Pokud budou takové technologie později přidány, odpovídajícím způsobem se upraví tyto zásady i správa souhlasu.</p></section>
    <section aria-labelledby="cookies-hosting"><h2 id="cookies-hosting">3. Hosting a externí odkazy</h2>
      <p>Statickou verzi hostuje GitHub Pages; plná verze je připravena pro Cloudflare. Bezpečnostní zpracování IP adres návštěvníků ze strany hostingu je popsáno v <Link href="/dokumenty/osobni-udaje">Ochraně osobních údajů</Link> a <ExternalLink href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">zásadách GitHubu</ExternalLink>.</p>
      <p>Externí služby, například LinkedIn, mají vlastní pravidla cookies. Tato pravidla se uplatní při návštěvě jejich stránek.</p></section>
    <section aria-labelledby="cookies-management"><h2 id="cookies-management">4. Správa cookies v prohlížeči</h2>
      <p>Uložené cookies můžete odstranit nebo omezit v nastavení prohlížeče. Návody poskytují jeho výrobci:</p>
      <div className="legal-links">
        <ExternalLink href="https://support.google.com/chrome/answer/95647">Google Chrome</ExternalLink>
        <ExternalLink href="https://support.mozilla.org/cs/kb/povoleni-zakazani-cookies">Mozilla Firefox</ExternalLink>
        <ExternalLink href="https://support.apple.com/cs-cz/guide/safari/sfri11471/mac">Safari</ExternalLink>
        <ExternalLink href="https://support.microsoft.com/cs-cz/microsoft-edge/odstran%C4%9Bn%C3%AD-soubor%C5%AF-cookie-v-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09">Microsoft Edge</ExternalLink>
      </div></section>
    <section aria-labelledby="cookies-contact"><h2 id="cookies-contact">5. Kontakt</h2>
      <Identity/><p>Dotazy k soukromí nebo fungování webu můžete zaslat e-mailem. Další informace a možnosti uplatnění práv obsahuje <Link href="/dokumenty/osobni-udaje">Ochrana osobních údajů</Link>.</p></section>
  </>;
}
