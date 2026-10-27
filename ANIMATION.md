# Animace podle video předlohy

Druhá sekce už nevjíždí přirozeným posunem stránky s jednoduchým odhalením karet. První dvě sekce tvoří jednu připnutou scénu, která přehrává hlavní fáze předlohy podle scrollování a po jejich dokončení přejde do běžného toku stránky.

- Jméno je ve dvou vycentrovaných řádcích, úzký portrét před ním. Podpisový úvod a skutečná fotografie zůstávají zachované.
- Portrét se lehce zvětší a stáhne do hnědé kuličky; jméno a obrysové pozadí mizí.
- Kulička nejprve klesá doleva, vykrouží smyčku se širokou měkkou stužkou a dopadne dole uprostřed.
- Dopad ji zmáčkne a vystřelí organické hnědé a krémové části. Tím začíná pop-up druhé sekce.
- Celá kompozice druhé sekce vyroste z hloubky a krátce přesáhne konečnou velikost. Jednotlivá písmena přiletí od místa dopadu a složí dvouřádkový nadpis. Podtitulek se připojí vzápětí.
- Kulička vystřelí doprava a odskočí; teprve potom se postupně objeví čtyři karty. Každá vyroste z malé, natočené plochy, vyklopí se v prostoru a lehce zapruží do své konečné polohy.
- Karty mají stejně jako v předloze ikonu a název. Jejich rozmístění zůstává 2 × 2; na mobilu je nadpis nad nimi.
- Druhá sekce se během nástupu neposouvá mimo obrazovku. Na závěr je celá kompozice ještě krátce připnutá a až následně pokračuje běžný scroll k dalšímu obsahu.
- Menší obrazovky používají kompaktnější rozložení. Pokud se obsah do výšky obrazovky nevejde, scéna se prodlouží tak, aby se žádné odkazy neořízly.
- Pohyb funguje při scrollování oběma směry, bez zachytávání kolečka nebo dotyků. Přímý odkaz na obsah přeskočí na dokončenou scénu.
- Průběh je roztažený na trojnásobnou délku scrollování oproti původní scéně, tedy ještě o polovinu delší než předchozí zpomalená verze. Prudší posun uvnitř scény nepřeskakuje vyhlazení; přímé přechody před scénu nebo za ni se nadále okamžitě srovnají s pozicí stránky.
- Obnovení stránky začíná nahoře u úvodu, včetně odstranění staré kotvy z adresy při refreshi. Automatické obnovení scrollu je vypnuté do dokončení načtení a následného rozvržení. Jakmile návštěvník začne ovládat stránku, pozdější reset už jeho pohyb nepřepisuje. Běžné otevření přímého odkazu na sekci a návrat historií tento reset nepoužívají.
- Připnutá scéna má předem rezervovanou délku a neúčastní se automatického kotvení scrollu při změně rozložení. Její přeměření tak nemá posouvat návštěvníka za animaci.
- Při omezení pohybu nebo nenačtení fotografie zůstává statický obsah v běžném toku. Klávesnicový fokus zviditelní celou dostupnou navigaci.

Původní záloha: značka `backup/pre-animation-20261027`, commit `936c6b1c34890a628ce3a5fd2cbf1a75097fe3f4`. V pracovním projektu je navíc `backups/pre-animation-20261027/source.zip`, `history.bundle` a `OBNOVA.md`.

Verze před tímto přepracováním: commit `a24ceea9138d101c6c4a2293ca84cc221acd3569`.

Video předloha byla znovu prohlédnuta po půlsekundách a nástup druhé sekce po čtvrtsekundách. Na přání uživatele nebyly spuštěny testy ani kontrola implementace v prohlížeči. Publikační workflow provádí sestavení potřebné pro GitHub Pages.
