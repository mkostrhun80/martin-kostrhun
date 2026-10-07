# Martin Kostrhun — Personal Website

Osobní web Martina Kostrhuna s interaktivním Purple Lens. React, TypeScript a Vinext/Vite. Vyžaduje Node.js 22.13 nebo novější a npm.

## Development

```sh
npm install
npm run dev
```

Otevřete http://localhost:5173. Pro lokální spuštění nejsou potřeba žádné tajné klíče.

## Production build

```sh
npm run build
```

Zdrojový kód je v `app/`, `components/` a `lib/`; lokální obrázky a fonty v `public/`. Vinext používá `app/page.tsx` a `app/layout.tsx` místo samostatného `index.html`.

Fotografie, kontakty a odkazy nastavíte v `lib/site-config.ts`. Aktuální portréty jsou dodané fotografie; formulář připravuje e-mail k odeslání. Podrobnosti jsou v [IMPLEMENTATION.md](./IMPLEMENTATION.md).

## GitHub Pages

`npm run build:pages` vytvoří statický web ve složce `out/` pro cestu `/personal-web/`.
Proměnná `NEXT_PUBLIC_BASE_PATH` může cestu změnit (prázdná hodnota pro vlastní doménu).
Workflow `.github/workflows/pages.yml` publikuje web po každém pushnutí na `main`.
V nastavení GitHub Pages musí být jako zdroj vybrané GitHub Actions.
