# Pět samostatných návrhů kontaktního formuláře

Otevřete index.html v prohlížeči. Všechny fonty a fotografie jsou lokální.
Návrhy jsou oddělené od hlavního webu; žádná komponenta kontaktu se nemění.

- Čisté sklo: klidná karta s trojicí polí.
- Osobní dialog: portrét, osobní oslovení a tmavé sklo.
- Dopis Martinovi: kompozice inspirovaná aplikací Mail s pevným příjemcem.
- Krok za krokem: téma → zpráva → kontaktní údaje.
- Noční sklo: tmavý formulář a živý náhled výsledného e-mailu.

Přepínač Desktop / Mobil simuluje šířku komponenty. Celá stránka funguje i na
skutečné úzké obrazovce. Každý návrh má přímý odkaz ?navrh=identifikator.
Tlačítko Vyplnit ukázku používá smyšlená data a rezervovanou doménu example.com.

Všechny formuláře ověřují jméno, e-mail a zprávu. Odeslání pouze otevře výslovně
označenou ukázku potvrzení; neprovádí žádný síťový požadavek a neposílá e-mail.
Příjemce budoucího formuláře je pevně martin.kostrhun@edofinance.cz.

## Napojení vybrané varianty

GitHub Pages hostuje statické soubory. Pro skutečné odesílání z webu bude potřeba
serverový endpoint nebo formulářová služba. Současné /api/contact ukládá zprávy
do databáze, ale e-mail Martinovi neodesílá. Při integraci doplnit doručení přes
ověřeného poskytovatele, pevného příjemce, návštěvníkův e-mail jako Reply-To,
validaci, ochranu proti spamu, omezení frekvence a poctivé hlášení úspěchu/chyby.
Přístupové údaje patří pouze do serverového prostředí.

Přibalený portrét je původní dodaný náhled včetně vodoznaku fotografa.
