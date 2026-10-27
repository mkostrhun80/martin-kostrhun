# Animace podle video předlohy

Převádí dodanou video předlohu na skutečný pohyb prvků webu při scrollování. Nepřehrává video celé stránky uvnitř webu.

- Stávající podpisový úvod a reálný portrét zůstávají součástí webu.
- Úvod přebírá kompozici předlohy: dvě vycentrované řádky jména a úzký svislý portrét uprostřed před oběma řádky. Doplňkové bloky kolem portrétu jsou odstraněné; kontakt zůstává v navigaci.
- Portrét se nejprve zvětší, zaoblí a přejde do světle hnědé kuličky. Jméno při odletu úplně zmizí.
- Kulička proletí po dvou navazujících křivkách s jemnou stužkou a pěti menšími částicemi.
- Kulička míří k pravému okraji stránky. Karty se začnou rozvíjet v polovině přechodu a jsou úplně odkryté před jeho koncem.
- Konec přechodu je navázaný na začátek druhé sekce pod navigací. Její výška odečítá prostor navigace a svislé mezery jsou menší, aby nadpis i všechny čtyři karty byly společně v záběru při běžné výšce obrazovky. Na nízké obrazovce nebo s delším obsahem sekce přirozeně roste.
- Sekce má nadpis vlevo a karty vpravo, na mobilu pod sebou. Odkrytí karet sleduje skutečný posun stránky bez zpoždění vyhlazované trajektorie.
- Pohyb je řízený scrollováním v obou směrech. Na mobilu jsou dráha, stopa a odhalení karet střídmější.
- Omezení pohybu používá statický obsah; při chybě načtení portrétu zůstane dostupný běžný obsah. Animace neblokuje scroll ani ovládání kontaktu. Klávesnicový fokus odkryje všechny odkazy v obsahu.

Záloha před touto úpravou: značka `backup/pre-animation-20261027`, commit `936c6b1c34890a628ce3a5fd2cbf1a75097fe3f4`. V pracovním projektu je navíc `backups/pre-animation-20261027/source.zip`, `history.bundle` a `OBNOVA.md`.

Na přání uživatele nebyly spuštěny testy ani vizuální kontroly. Publikační workflow provádí sestavení potřebné pro GitHub Pages.
