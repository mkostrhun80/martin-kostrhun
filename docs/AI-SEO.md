# AI vyhledávání

Úpravy vycházejí z [návodu ai-seo](https://github.com/coreyhaines31/marketingskills/blob/main/skills/ai-seo/SKILL.md). Cílem je srozumitelně popsat Martina, jeho působiště, služby a způsob spolupráce pro návštěvníky i vyhledávače.

## Co web poskytuje

- Titulek, popis stránky a hlavní nadpis uvádějí Hradec Králové. Představení výslovně popisuje služby a možnosti osobní, online i telefonické spolupráce.
- JSON-LD na hlavní stránce propojuje `WebSite`, `WebPage`, `Person`, `FinancialService`, katalog služeb a `FAQPage`. Kontakty, IČO, adresa, služby i odpovědi vycházejí ze stejných dat jako viditelná stránka. Nevkládá ceny, hodnocení, otevírací dobu ani kvalifikace, které nejsou doložené.
- FAQ je dostupné ve statickém HTML i bez JavaScriptu. Obsahuje místo schůzky a postup ověření oprávnění s odkazem na registr ČNB.
- `/llms.txt` odkazuje na veřejné sekce a `/llms-full.txt` obsahuje textový přehled služeb, spolupráce a FAQ. Oba soubory vznikají při sestavení ze stejných dat jako web; neupravují se samostatně.
- Stávající pravidlo `User-agent: *` ponechává obsah přístupný crawlerům. Sitemap obsahuje hlavní indexovatelnou stránku. Právní dokumenty a staré přesměrovací stránky zůstávají `noindex` a do sitemap nepatří.

`llms.txt` je volitelný experimentální formát. Jeho dostupnost ani platné JSON-LD nezaručují indexaci, citace nebo doporučení v AI odpovědích. [Google nevyžaduje speciální AI soubory ani zvláštní schema](https://developers.google.com/search/docs/appearance/ai-features).

## Nasazení a údržba

`NEXT_PUBLIC_SITE_URL` musí obsahovat skutečnou HTTPS adresu webu, včetně případné cesty repozitáře. Workflow GitHub Pages ji přebírá z `configure-pages`; při ručním sestavení ji nastavte podle cílového hostingu. `NEXT_PUBLIC_BASE_PATH` řídí lokální cesty a assety. Úplná veřejná adresa se s touto cestou znovu nespojuje. Bez veřejné adresy náhled nevytváří smyšlené canonical URL ani JSON-LD identifikátory a textové soubory používají místní odkazy.

Na GitHub Pages v podadresáři leží exportované `robots.txt` pod cestou repozitáře. Crawleři standardně používají `robots.txt` v kořeni hostitele; soubor v podadresáři jej nenahrazuje. Při přechodu na vlastní doménu ověřte její kořenový `robots.txt` a skutečnou dostupnost obsahu také přes nastavení hostingu/CDN.

Kontaktní údaje a představení upravujte v `lib/site-config.ts`, služby a postup v `lib/content.ts`, FAQ v `lib/public-data.ts`. Po změně znovu sestavte web. Reference publikujte pouze se souhlasem a ověřenou spoluprací. Samotné datum sestavení není datum aktualizace obsahu.

## Jak sledovat výsledek po zveřejnění

V Google Search Console ověřte canonical hlavní stránky, požádejte o nové procházení a odešlete sitemap. Výsledky AI funkcí Googlu jsou zahrnuté v běžném reportu vyhledávání; dostupnost souborů není doklad zmínky v AI odpovědi.

Pro ruční srovnání před a po změně používejte stejné české dotazy a zaznamenejte platformu, datum, lokalitu, text odpovědi a přesnou citovanou URL:

1. Kdo je Martin Kostrhun a s čím pomáhá?
2. Finanční specialista Hradec Králové hypotéka a investice.
3. Martin Kostrhun eDO finance kontakt.
4. Kde se mohu sejít s Martinem Kostrhunem?
5. Lze s Martinem Kostrhunem řešit finance online?
6. Jak ověřit oprávnění Martina Kostrhuna u ČNB?

Každý dotaz opakujte 3–5krát na vybrané platformě. Odděleně sledujte nalezení webu, citaci, zmínku jména a doporučení ke spolupráci. Jeden výsledek není spolehlivá míra viditelnosti. Srovnání po změně má smysl až po zveřejnění a novém procházení. Tato úprava sama nezměřila současnou míru AI citací ani neprovedla externí publikaci.
