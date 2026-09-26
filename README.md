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

Fotografie, kontakty a odkazy nastavíte v `lib/site-config.ts`. Aktuální portréty jsou ilustrační placeholdery; formulář připravuje e-mail k odeslání. Podrobnosti jsou v [IMPLEMENTATION.md](./IMPLEMENTATION.md).
