# Martin Kostrhun — osobní web

React, TypeScript, Next/Vinext a GSAP. Fotografické soubory a fonty jsou původní. Redesign pracuje s nativním scrollováním, jedním seznamem sekcí a kontaktem dostupným v navigaci.

## Plný lokální náhled

Vyžaduje Node.js 24.13 nebo novější (lokální SQLite).

```sh
npm ci
npm run build:full
npm run preview:full
```

Web: http://localhost:4173/ · Administrace: http://localhost:4173/sprava/
Přístupový klíč najdete v ignorovaném `work/local-preview/admin-key`.
Zprávy a zpětná vazba se ukládají do `work/local-preview/data.sqlite`. Tyto soubory nesmí být zveřejněné. Lokální přihlašování není součástí produkčního Workeru.

## Kontroly

```sh
npm test
npm run lint
npm run check:types
npm run build:worker
npm run build:pages
```

`npm test` zahrnuje serverové scénáře, novou trasu fotografie i původní testy. `npm run build:pages` zachovává cestu `/martin-kostrhun/`; `build:full` vytváří export v kořeni. Na samostatných GitHub Pages jsou bez připojeného serveru dostupné přímé kontakty a prezentační obsah, formuláře úspěch nepředstírají.

## Produkční plná verze

Samostatný Worker v `server/worker.mjs` obsluhuje veřejné soubory z `out/`, API a chráněnou administraci. Databáze D1 používá verzované SQL v `server/migrations/`. Přístup ke správě ověřuje podpis Cloudflare Access JWT, vydavatele, publikum, platnost i vlastníka.

Před spuštěním postupujte podle `SPUSTENI.md`. Produkce nebyla nasazená, DNS nebylo změněné a rezervace nebyly připojené k iCloudu.

Původní vývojové příkazy Vinext (`npm run dev`, `npm run build`) zůstávají k dispozici; pro plnou verzi s tímto samostatným Workerem použijte výše uvedený postup.
