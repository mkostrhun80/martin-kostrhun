# Spuštění plné verze

## Stav

Redesign vznikl na větvi `redesign/professional-presentation`; statická verze se publikuje na GitHub Pages sloučením do `main`. Serverové ukládání a administrace vyžadují následnou aktivaci Cloudflare. Před redesignem byl vytvořen záložní tag, Git bundle a archiv zdrojů včetně fotografií. Přesná identita a kontrolní součty jsou v předaném manifestu zálohy.

Lokální náhled používá oddělenou SQLite databázi se stejnými tabulkami jako D1. Administrační data ani klíč nejsou součástí Gitu. Záznamy z lokálních testů se nepřenášejí do produkce.

## 1. Kontaktní formulář a FormSubmit

Kontaktní sekce má pět vzhledů přepínaných bublinami 1–5. Sdílejí rozepsanou
zprávu, validaci a doručování přes FormSubmit na martin.kostrhun@edofinance.cz.
Rezervační kalendář byl z veřejného kontaktu odstraněný.

1. Po nasazení odeslat jednu aktivační/testovací zprávu z veřejného webu.
2. Martin ve své pracovní schránce otevře aktivační e-mail FormSubmit a potvrdí
   příjem zpráv. Pokud zpráva nepřijde, zkontrolovat také spam.
3. Poté odeslat test znovu a ověřit skutečné doručení do schránky i Reply-To.

Příjemce je pevný v lib/email-contact.ts. E-mail návštěvníka je Reply-To.
HTTP 200 samo o sobě nestačí: web kontroluje boolean nebo řetězec success=true,
a odlišuje čekající aktivaci od odeslání. Při chybě údaje zůstávají vyplněné.
Klíč ani registrace nejsou potřeba; příjemce musí sám potvrdit svou adresu.
Údaje nejsou ukládané do místního úložiště prohlížeče. Odesílání nepoužívá
neaktivní Cloudflare API ani nevyžaduje server na GitHub Pages.

Oficiální dokumentace: https://formsubmit.co/ajax-documentation

## 2. Cloudflare a D1

Vytvořit databázi D1 pro web a její skutečné ID doplnit v `server/wrangler.jsonc`. Lokální ukázkové ID není určeno k produkci. Cloudflare účet nebyl automaticky vytvořen ani měněn.

Až po dokončení konfigurace a souhlasu se spuštěním:

```sh
wrangler d1 migrations apply martin-kostrhun --remote --config server/wrangler.jsonc
```

Migrace nesmí být přepsána po aplikování. Další změny patří do nového SQL souboru. Návrat staré prezentační verze nevyžaduje mazání databáze; nové zprávy uchovejte.

Vytvořit Cloudflare Access aplikaci pro `/sprava*` i `/api/admin/*`, povolit jen vlastníka a nastavit:

- `ACCESS_TEAM_DOMAIN` – skutečná doména týmu Cloudflare Access;
- `ACCESS_AUD` – publikum aplikace Access;
- `ADMIN_EMAIL` – povolený vlastník;
- `RATE_SALT` – náhodné serverové tajemství přes Wrangler secrets.

Worker nepřijímá lokální přihlašovací cookie. Bez platného Access JWT zůstávají administrační data uzavřená i při přímém přístupu přes adresu Workeru.

## 3. Obsah před zveřejněním

V administraci doplnit pouze skutečný počet unikátních klientů a datum; lze ponechat prázdné. Recenze se nezveřejňují bez souhlasu. Pro zařazení do vybraných referencí je nutné doložit skutečnou spolupráci.

Doplnit a ověřit odpovědi na přípravu schůzky a cenu/odměnu. Dosud neznámé odpovědi nejsou veřejné. Určit dobu uchování zpráv a nezveřejněné zpětné vazby. Správce může provést export a cílené smazání nebo úklid podle nastavené doby. Veřejné reference se úklidem neodstraňují.

## 4. Doména a sestavení

`martinkostrhun.cz` je návrh, její dostupnost ani vlastnictví nebyly potvrzené. Nákup a DNS jsou samostatný krok. Nastavit `NEXT_PUBLIC_SITE_URL` na skutečnou adresu včetně případné základní cesty. Bez tohoto nastavení web nevytváří smyšlené canonical URL ani sitemap pro cizí doménu.

```sh
NEXT_PUBLIC_SITE_URL=https://SKUTECNA-DOMENA npm run build:full
npm run build:worker
```

Soukromé klíče, lokální databáze, testy a zálohy se nepublikují. Hostování plné verze připravuje `server/wrangler.jsonc`; nasazení po schválení proběhne samostatně přes Wrangler. Tento dokument nepředstavuje pokyn k automatickému nasazení.

## Ověření

Serverové testy pokrývají podpisy a oprávnění, soukromá data, ukládání a opakování zpráv, souhlasy, kritické recenze, odvolání, jednorázové pozvánky, statistiky, FAQ, rate limit a databázovou perzistenci. Migrace byla ověřena také v lokálním Cloudflare D1. Reálné Cal.com/iCloud testy zůstávají součástí aktivace.
