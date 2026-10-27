# Utkast: Grön nivå 2026/27 (issue #15)

Status: **overifierat utkast. Byggs och publiceras inte.** Filerna ligger i `docs/utkast/`, inte i `src/content`, så sajten är oförändrad och grön nivå visas fortfarande som "Kommer senare".

| Fil | Innehåll |
| --- | --- |
| `gron.yaml` | Nivåguide för division 8–9 (faktagrupper, lokal regel) |
| `gron-8.yaml`, `gron-9.yaml` | Divisionsanpassning: målvakt (ADR 0002) |

Filerna följer innehållsschemat i `src/content.config.ts`. De har provbyggts tillfälligt i `src/content` utan fel, och kopian är borttagen. Alla uppgifter har `status: overifierad`.

## Källor

1. **Västernorrlands ungdomsmatris 2026/27** (publik): [sida 1](https://www.innebandy.se/media/bjoi2qrd/matris-ungdom-2026-27-med-arvoden.pdf#page=1), rad "8.9", och [sida 2](https://www.innebandy.se/media/bjoi2qrd/matris-ungdom-2026-27-med-arvoden.pdf#page=2) för lokal regel. Alla matchfakta i utkastet kommer härifrån, avlästa 2026-10-27.
2. **SIBF: Spelarutvecklingsplan för förening, Grön nivå (6–9 år)**, mall 2025 (`spel-och-spelarutvecklingsplan-gron-2025.pptx` i Drive). Pedagogiskt underlag. Innehåller inga matchfakta och används **inte** i utkastet (se nedan).
3. **VIBF Innebandyutveckling: Uppstart Grön, 2026-09-22** (PDF i Drive). Handlar om föreningarnas utvecklingsarbete och uppstart av nya lag, inte om matchregler.

## Kontrollista innan något publiceras

Kontrollera varje punkt mot matrisen och sätt sedan `status: verifierad` och nytt `checked`-datum.

- [ ] **Plan:** "3 × 6/7 sargbitar + hörn" är skrivet så som cellen lyder. Tolkningen (antal sargbitar per sida, hörn) är inte kontrollerad. Skriv om till begriplig text.
- [ ] **Mål:** matrisen anger "Små (ca 60×40 cm). Med MV: 120 × 90". Utkastet antar att division 8 (med målvakt) använder 120 × 90 och division 9 (utan målvakt) de små målen. Bekräfta.
- [ ] **Spelform:** "Lokala sammandrag, div 8: 3 mot 3 med MV, div 9 utan MV". Bekräfta att det inte är div 9 som har andra spelregler än målvaktens frånvaro.
- [ ] **Tutbyte 90 sek** och rullande tid 1 × 15 min.
- [ ] **Resultat:** matrisens kolumn "Resultatavla" är "Nej" och "Tabell" är "Nej". Utkastet påstår bara "Ingen tabell". Kontrollera om resultat ska rapporteras eller inte.
- [ ] **Ledarlicens:** "GU B&U + Steg 1 Grön".
- [ ] **Lokal regel** (sida 2): "Inga mål får göras från egen planhalva/halva plan." Meningen om att ledare ska stötta föreningsdomarna är omskriven. Kontrollera ordalydelsen.
- [ ] Kontrollera mot regelboken och den nationella handboken för spelformer ("Nationell handbok för spelformer och regler tillämpas"), enligt `docs/open-questions.md`.

## Avklarat (bekräftat av innehållsansvarig 2026-10-27)

- **Mål och målvakt:** division 9 är första året (3 mot 3 utan målvakt, små mål ca 60 × 40 cm), division 8 andra året (3 mot 3 med målvakt, mål 120 × 90 cm). Faktagruppen "Mål" och divisionsanpassningarna är satta till `verifierad`.
- **SIBF:s "inga fasta målvakter"** betyder att målvakterna roteras i laget. Det motsäger inte matrisen.
- **Tabell:** ingen tabell och ingen resultattavla.

## Åldern: inte med i utkastet

Matrisen anger rek. ålder 7–10 och SIBF-mallen 6–9 år. Innehållsansvarigs förståelse är division 9 ≈ 6–7 år, division 8 ≈ 7–8 år, och det kan också vara 9 år eftersom säsongen går över nyår. Det är inte belagt i en källa och står därför inte i guiden. Lägg till först om en källa bekräftar det.

## Fortfarande öppet

- **Plan:** "3 × 6/7 sargbitar + hörn" är oförändrad. Faktagruppen "Plan" är `overifierad` tills texten är begriplig och kontrollerad.
- **Regelboken** och nationella handboken för spelformer är inte kontrollerade.
- Övriga rader i kontrollistan ovan är inte uttryckligen bekräftade än.

## Medvetet utelämnat

Följande ur SIBF-mallen är rekommendationer i en förenings-mall, inte regler, och är inte antagna av Moälven. De hör till föreningsvägledning och beror på besluten i #16: träningar per vecka, passfördelning (lek/koordination/småplanspel), ledare per spelare, "ingen selektering till 15 år". Avgifter (serie- och domaravgift) och walk over-avgift är utelämnade med avsikt.

## Så publiceras det (efter verifiering)

1. Flytta `gron.yaml` till `src/content/nivaguider/2026-2027/` och `gron-8.yaml`, `gron-9.yaml` till `src/content/divisionsanpassningar/2026-2027/`. Verifiera uppgifterna.
2. Lägg till sidan `src/pages/gron.astro` (som `bla.astro`) och ersätt `GRON_PLACEHOLDER` i `src/lib/nivaguide.ts` med en guide-länk.
3. Uppdatera de acceptanstester som kräver "Kommer senare" (`startsida.spec.ts`, `tillganglighet.spec.ts`) och lägg till en acceptanstest för grön nivå.
4. Kör `npm test` och ta bort `docs/utkast/gron/`.
