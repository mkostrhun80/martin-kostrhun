# Popupy služeb a sekce O mně

Video předloha: `references/services-about-animation-reference.mp4` v nadřazeném pracovním projektu; původní soubor `gemini_generated_video_379212d2.mp4`. Styl popupů navazuje na animaci mezi první a druhou sekcí.

Úprava přidává pouze animace. Komponenty `Services.tsx` a `Sections.tsx`, jejich obsah, pořadí, fotografie, rozměry a rozestupy se nemění. Nevzniká carousel ani nová připnutá scéna a neprodlužuje se stránka.

- Kulička má stejný světle hnědý gradient jako úvodní animace: krémový odlesk, `--light-brown` a tmavší hnědý okraj. Černobílý vzor míče je odstraněný.
- Fotografie a karty skutečně začínají v místě kuličky. Jejich původní rozměry zůstávají v rozložení rezervované, zatímco samotný prvek se pomocí transformace zmenší na malou kouli a přesune do místa emise.
- Hnědý povrch při růstu mizí a odkryje fotografii nebo obsah karty. Prvek současně vyletí do své původní pozice, prostorově se vyklopí a s lehkým přesahem dosedne. Fotografie se otevírají 1,95 sekundy a karty 1,75 sekundy.
- Několik současně nastupujících prvků vychází ze společného místa s krátkým odstupem. Kulička při emisi přiletí do tohoto bodu a rozptýlí drobné hnědé části, potom pokračuje svou dráhou.
- Nadpisy a ostatní textové bloky mají výraznější popup z malé velikosti, posun vzhůru a měkké zapružení. Po odhalení zůstávají viditelné při návratu na předchozí část stránky.
- Cikcak stopa a měkká stužka zůstávají. Na tmavém pozadí stopa zesvětlá; samotná kulička stále zůstává hnědá.
- Běžná dráha respektuje současné rozložení mezi sloupci nebo u mobilního okraje. Při popupu se kulička propojí přímo s místem vzniku fotografie nebo karty. Dekorace nezachytává klikání a je skrytá před čtečkami obrazovky.
- Systémové omezení pohybu ponechá obyčejný statický obsah. Klávesnicový fokus okamžitě dokončí odhalení svého bloku. Tisk dekorace skryje a zobrazí všechen text.
- Dosavadní úvodní animace, její zpomalení i chování po refreshi zůstávají zachované.

Podle pokynu uživatele nebyly spuštěny testy ani kontrola výsledku v prohlížeči. Publikační workflow provádí sestavení pro GitHub Pages.
