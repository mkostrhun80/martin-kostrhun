# Pohyb služeb a sekce O mně podle druhé video předlohy

Předloha: `references/services-about-animation-reference.mp4` v nadřazeném pracovním projektu; původní soubor `gemini_generated_video_379212d2.mp4`.

Úprava přidává pouze animace. Komponenty `Services.tsx` a `Sections.tsx`, jejich obsah, pořadí, fotografie, rozměry a rozestupy se nemění. Nevzniká carousel ani nová připnutá scéna a neprodlužuje se stránka.

- Jednotlivé karty služeb se při prvním vstupu do záběru vynoří zmenšené a natočené v prostoru, lehce přesáhnou konečnou polohu a dosednou. Nástup trvá 1,65 sekundy.
- Fotografie služeb a portrét v O mně se jemně přetočí a zvětší do své stávající polohy během 1,8 sekundy. Obrázky, jejich výřezy a samotné rámy se nemění.
- Nadpisy a existující textové bloky nastupují po sobě s mírným posunem vzhůru. Po odhalení zůstávají viditelné i při návratu na předchozí část stránky.
- Rotující černobílý míč s hnědými odlesky navazuje na motiv ve videu. Při scrollování kreslí stopu do cikcaku, krátkou světlou stužku a drobné částice při změně směru.
- Dráha respektuje současné rozložení: na počítači je v mezeře mezi sloupci, na mobilu u pravého okraje. Stopa na tmavém pozadí zesvětlá. Dekorace nezachytává klikání a je skrytá před čtečkami obrazovky.
- Pohyb míče sleduje scroll s vyhlazením. Mimo dotčené sekce se dekorace skryje; neběží žádná nepřetržitá animace v pozadí.
- Systémové omezení pohybu ponechá obyčejný statický obsah. Klávesnicový fokus okamžitě dokončí odhalení svého bloku. Tisk dekorace skryje a zobrazí všechen text.
- Dosavadní úvodní animace, její zpomalení i chování po refreshi zůstávají zachované.

Video bylo prohlédnuto po půlsekundách a detaily nástupu karet po čtvrtsekundách. Podle pokynu uživatele nebyly spuštěny testy ani kontrola výsledku v prohlížeči. Publikační workflow provádí sestavení pro GitHub Pages.
