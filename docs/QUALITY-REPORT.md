# Ověření úprav — 29. října 2026

## Doplnění po mobilní revizi 30. října 2026

Úvodní rozcestník opět nabízí jen pět hlavních cílů; partnerská sekce a zpětná vazba zůstávají na stránce a v úplném obsahu. Překrývání portrétu a jména v původním breakpointu 761–1000 px bylo nahrazeno oddělenými gridovými oblastmi, včetně mobilu naležato. Mobilní kontakt skládá nadpis, celou fotografii v poměru 3:2 a formulář pod sebe; na úzkém telefonu jsou i jméno a e-mail pod sebou. Zpětná vazba má samostatnou tmavou kartu s odstupem a nativní rozbalovací formulář. Starý hluboký odkaz jej otevře přímo; zavření zachová rozepsaný obsah.

V prohlížeči byly kontrolovány šířky 320, 390, 768, 844, 1000 a 1440 px: bez vodorovného přetékání a bez překryvu jména s portrétem. Ověřeno také rozbalení klávesnicí, hluboký odkaz a předání fotografie při scrollu tam/zpět. Taste kontrola na 1440/768/390 neměla chyby konzole ani výtky ke kontrastu či přetékání; jeho zbývající obecná estetická pravidla mají stejné značkové výjimky jako níže. Původní výkonnostní čísla nebyla kvůli těmto změnám znovu měřena.

## Rozsah

Výchozí Martinova verze: `9142e1a1b2628c90e2f625dbae9207c0e3fe6fc4`. Zdrojový archiv, binární patch místních změn a upravený původní náhledový skript jsou zachované v ignorovaném `work/quality-redesign-20261029/backup`. Aktuální web má statický export, společný seznam sekcí, minimální desktopový obsah a mobilní plovoucí navigaci Obsah / Kontakt. Při editaci polí se mobilní navigace schová. Úvodní animace zůstává; hluboké odkazy a opakované návštěvy ji přeskakují.

## Měření plynulosti

Windows, Chrome 156, viewport 1440 × 900, stejný monitor s přibližně 240Hz obnovováním, viditelná karta. Tři průchody každého režimu od O mně k partnerům a zpět, rychlost přibližně 1100 px/s. Po změně pořadí sekcí je nová trasa delší; jde o pozorování snímků při průchodu stejnými částmi, ne o izolovaný GPU benchmark. Záznam rAF, Long Tasks a Long Animation Frames není měření skutečných návštěvníků.

| Režim | Před: průměr fps v jednotlivých bězích | Po: průměr fps v jednotlivých bězích |
| --- | --- | --- |
| Běžné prostorové karty | 24,2 / 20,9 / 23,0 | 235,3 / 230,3 / 229,4 |
| Bez odrazů | 25,0 / 24,7 / 24,3 | 230,3 / 229,6 / 229,6 |
| Bez prostorových efektů a stínů | 238,7 / 238,1 / 239,4 | 235,2 / 238,0 / 237,8 |

V běžném režimu se 95. percentil intervalu snímků změnil z 50–63 ms na přibližně 4,3 ms. Nové běhy neměly zaznamenané dlouhé úlohy ani dlouhé animační snímky. Žádný běh neměl skrytou kartu. Srovnání podporuje nápravu prostorových vrstev mimo obrazovku; samotné odstranění odrazů nestačilo. Karty ani odrazy nebyly plošně odstraněny. Ve skutečném prohlížeči bylo následně ověřeno automatické posouvání, omezený počet aktivních karet (7–13 v kontrolovaných polohách) a zastavení po ručním ovládání. Rychlost používá desetinný akumulátor, aby se neztrácela na displejích s vysokou frekvencí.

Surová data: `work/quality-redesign-20261029/measurements/{before,after}-desktop.json`. Výsledky nelze vydávat za záruku stejného fps na telefonu.

## Načítání

Lighthouse 13.6.0, tři běhy desktopu a tři běhy mobilního profilu se šířkou 390 px, stejné místní servery s Brotli kompresí textových souborů. Komprese odpovídá způsobu doručování statických souborů, ale nejde o měření skutečného Cloudflare deploymentu. Místní RTT a Lighthouse simulace nejsou reálná mobilní síť.

| Metrika | Před: medián (rozsah) | Po: medián (rozsah) |
| --- | --- | --- |
| Desktop LCP | 0,95 s (0,83–1,20) | 1,20 s (0,91–1,21) |
| Mobil LCP | 1,96 s (1,82–2,01) | 2,19 s (2,09–2,27) |
| CLS | 0 ve všech bězích | 0 ve všech bězích |
| Mobil TBT | 31,5 ms (15–32) | 39,5 ms (37,5–54,5) |

Načítání se ve srovnání nezrychlilo; nová stránka obsahuje další formulář. Oba profily v těchto bězích splnily cíl LCP 2,5 s a CLS 0,1. Lighthouse Performance po změně: desktop 92–97, mobil 94–96; Accessibility 97–100. Občasná kontrastní výtka u tlačítka úvodu souvisela se zachycením probíhajícího odkrytí. TBT není INP. **INP a další data skutečných návštěvníků nejsou dostupná.** Po nasazení je potřeba ověřit skutečné doručení, hlavičky a provozní metriky.

První kontrola bez komprese měla mobilní LCP 3,75–3,90 s; není zaměňovaná s výsledky Brotli ani se skutečným hostingem. CSS má omezené Tailwind zdroje, fonty jsou stejné tváře převedené z TTF do WOFF2 (součet 182 kB → 63 kB). Staré fonty a originální fotografie zůstávají zachované.

Surová data: `work/quality-redesign-20261029/lighthouse/*-br-*.json`. Číselné běhy vznikly před posledními drobnými úpravami mobilní lišty a textového kontrastu; finální změny prošly sestavením a následnou vizuální/funkční kontrolou.

## Taste — vizuální revize a výjimky

Taste Skill `design-taste-frontend` byl nainstalovaný z `Leonxlnx/taste-skill`. Inspektor běžel před/po na 1440, 768 a 390 px, se snímky celé stránky a průchodu. Konzole při těchto kontrolách neměla chyby. Nejde o úplné splnění jeho estetických pravidel: zadání výslovně zachovává Martinovu značku, prostorové karty a stávající části webu.

ROUND 1

Seen in one second: Martinův podpis, velké jméno, světlá plocha a portrét.

Idea (one sentence): Osobní, srozumitelná finanční spolupráce s průběžným fotografickým motivem.

Live thing: Podpis, proměna fotografie a prostorový pás partnerů.

Layout words by section: hero=typografie+portrét / rozcestník=fotografie+odkazy / o mně=portrét+text / služby=dvě kapitoly / spolupráce=postup / FAQ=rozbalení / kontakt=formulář / zpětná vazba=soukromý formulář / zázemí=prostorový pás.

Scores: design 6 · usability 6 · creativity 6 · content 7 → overall 6.2.

Caps applied: Přísný inspektor stále hlásí FAIL kvůli existujícím malým štítkům, kartám, linkám, stínům a záměrně skrytému obsahu zavřené navigace. Nejde o certifikaci přístupnosti ani tvrzení nulového počtu výtek.

Top three problems:

1. Původní velká navigace překrývala horní části snímků a opakovala obsah. Nahrazena úzkým desktopovým sloupcem a malou mobilní lištou bez rezervovaného místa nahoře.
2. Pás partnerů vytvářel prostorové vrstvy i hluboko mimo obrazovku. Efekty jsou omezené na okolí viewportu; měření výše dokládá rozdíl. Pole mimo obrazovku nemění styl každým snímkem.
3. Béžová část nadpisu spolupráce měla nízký kontrast. Textový akcent ztmaven ve stejné barevné rodině; popisky partnerů sjednoceny nejméně na 13 px.

Výjimky podle schváleného zadání: béžovo-modrá paleta; původní jemné kontury, skleněné povrchy a stíny; karty v rozcestníku a prostorové karty partnerů; číslovaný postup spolupráce; vstupní podpis a jeho načasování. Kvůli metrikám Taste nebyly přidávány další animace. Zavřený `inert` obsah navigace se záměrně nezobrazuje ani při omezeném pohybu; ovládací tlačítko zůstává dostupné. Záměrné horizontální scrollování je uvnitř partnerů a filtrů, ne na celé stránce.

Snímky a reporty: `work/quality-redesign-20261029/taste/{before,after}`. Závěrečná mobilní lišta je ověřena také samostatnými snímky v `work/quality-redesign-20261029/screenshots`.

## Funkce, soukromí a bezpečnost

- Prošly testy trasy fotografie, hranic a obráceného scrollu, formulářového transportu, klasifikace chyb, souhlasů, omezení aktivních karet a podmínek pauzy. Regresní test renderuje skutečné formuláře s aktivovaným příznakem a kontroluje bezpečné serverové HTML bez JavaScriptu.
- V prohlížeči proběhla **místní simulace** hCaptcha a Web3Forms: chybné doručení zachovalo text, úspěch byl potvrzen až po odpovědi, token po odeslání/expiraci přestal platit a zpětná vazba bez souhlasu měla výslovný zákaz zveřejnění. Simulace neposílala zprávy ven a nenahrazuje test u poskytovatele.
- Odmítnutí všech volitelných služeb odstranilo iframe a nebyly vložené externí skripty. Vlastní úložiště jsou podpisový příznak, dočasné téma a verzovaná volba soukromí; zprávy se trvale do prohlížeče neukládají. Úplná inventura skutečných cookies hCaptcha/Cal.com po interakci a nastavení hostingu patří k Martinovu živému ověření.
- Nezávislá revize zdrojů našla možnost nativního GET odeslání soukromé zpětné vazby při výpadku JavaScriptu. Opraveno explicitním POST a deaktivovaným odesláním do získání CAPTCHA tokenu; opravený zdroj znovu posoudil nezávislý auditor a prošel regresním testem. Žádný další doložený nález nezůstal v tomto rozsahu otevřený. Nejde o záruku absolutní bezpečnosti ani audit účtů poskytovatelů.
- Audit závislostí po aktualizaci: **0 známých nálezů**. Next.js 16.4.3, esbuild 0.28.2 a opravené závislosti lintování. Veřejné odesílací a CAPTCHA klíče nejsou administrátorská hesla.
- Navigace byla kontrolována na 390 × 844, 844 × 390 a 1440 × 900, včetně otevření, odkazu do sekce, zavření, Escape a přetékání. Kontroly v prohlížeči jsou emulace velikostí; fyzický Android a Safari/iOS nejsou tímto záznamem certifikované.

## Co zbývá Martinovi

Podrobný postup je v [OWNER-SETUP.md](OWNER-SETUP.md). Povinné CAPTCHA ověřování ve Web3Forms, skutečné doručení na pracovní adresu, identita Cal.com, ověření zájemce, dvě budoucí rezervace, iCloud životní cyklus a reálné Cloudflare preview **nejsou označeny jako splněné**. Do ověření zůstává příslušná integrace vypnutá a funguje přímý pracovní e-mail. Produkce se nepřepíná pouhým dokončením místního návrhu.
