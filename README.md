# Martin Kostrhun — osobní web

React, TypeScript, Next.js a statický export. Node **24**. Bez vlastní administrace, API, Functions nebo databáze. Podpis a proměna fotografie zůstávají součástí úvodu; obsah a pořadí řídí `lib/site-sections.ts`.

```sh
npm ci
npm run dev
```

Ověření a náhled produkčního exportu:

```sh
npm run lint
npm test
npm audit --audit-level=high
npm run build
npm run check:types
npm run release:check -- --preview
npm run preview
```

Náhled vypíše místní adresu (standardně port 4173, při obsazení zvolí volný port). Export je ve složce `out`. Výchozí základní cesta je prázdná. `build:pages` zachovává možnost exportu s cestou `/martin-kostrhun`; automatické publikování na GitHub Pages je odstraněné. GitHub Actions provádí kontroly, bez nasazení.

Formuláře doručuje Web3Forms na pracovní e-mail. hCaptcha je načítaná po povolení a u formuláře, Cal.com až po povolení v rezervaci. Web nepředstírá úspěšné odeslání. Obě služby jsou při výchozím sestavení vypnuté do ověření účtů Martinem; přímý pracovní e-mail zůstává dostupný. Nastavení je v `.env.example`.

Pro nasazení a povinná ověření účtů použijte [návod pro Martina](docs/OWNER-SETUP.md). Stav nastavení u poskytovatele nelze zjistit ani vynutit pouhým přepnutím proměnné webu.

FAQ a schválené reference jsou v `lib/public-data.ts`. Reference publikujte pouze po doložení spolupráce a souhlasu; soukromý e-mail ani podklady souhlasu do tohoto souboru nepatří. Prázdný seznam nemá náhradní vymyšlená hodnocení.

Záloha před změnami a původní rozpracovaný `scripts/preview-full.mjs` jsou lokálně v ignorovaném `work/quality-redesign-20261029/backup`. Původní skript s databází je vyřazený z projektu, jeho upravená kopie je zachovaná. Fotografie zůstávají původní; WOFF2 fonty jsou bezeztrátově zabalené ze stejných TTF (FontTools 4.68.0), s ověřenou stejnou mapou znaků.
