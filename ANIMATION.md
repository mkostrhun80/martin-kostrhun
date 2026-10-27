# Animace podle video předlohy

Převádí dodanou video předlohu na skutečný pohyb prvků webu při scrollování. Nepřehrává video celé stránky uvnitř webu.

- Stávající podpisový úvod a reálný portrét zůstávají součástí webu.
- Portrét se mírně zvětší, zaoblí a přejde do světle hnědé kuličky.
- Kulička proletí po dvou navazujících křivkách s jemnou stužkou a pěti menšími částicemi.
- Na konci přechodu se postupně rozvinou karty obsahu. Sekce má nadpis vlevo a karty vpravo, na mobilu pod sebou.
- Pohyb je řízený scrollováním v obou směrech. Na mobilu jsou dráha, stopa a odhalení karet střídmější.
- Omezení pohybu používá statický obsah; při chybě načtení portrétu zůstane dostupný běžný obsah. Animace neblokuje scroll ani ovládání kontaktu. Klávesnicový fokus odkryje všechny odkazy v obsahu.

Záloha před touto úpravou: značka `backup/pre-animation-20261027`, commit `936c6b1c34890a628ce3a5fd2cbf1a75097fe3f4`. V pracovním projektu je navíc `backups/pre-animation-20261027/source.zip`, `history.bundle` a `OBNOVA.md`.

Na přání uživatele nebyly spuštěny testy ani vizuální kontroly. Publikační workflow provádí sestavení potřebné pro GitHub Pages.
