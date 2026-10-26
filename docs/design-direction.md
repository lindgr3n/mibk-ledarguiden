# Designriktning

Ledarguiden ska kännas som Moälvens praktiska matchverktyg: tydlig, direkt och förankrad i klubbens orange/svarta identitet. Referensbilderna i `docs/references` (startsida, nivåsida, divisionssida) följs exakt i layout, rubriker, ikoner och kortstruktur. Undantag: innehållet begränsas till verifierade uppgifter, huvudmenyn har fyra val utan sök, kontakt eller "Bli medlem", och publikbilden från Skyttis är hero tills en egen bild finns i repot.

## Färger

| Token | Värde | Användning |
|---|---:|---|
| Moälven orange | `#f58220` | Varumärkesaccent, aktiva länkar och fokusdetaljer |
| Svart | `#090a0a` | Header, hero-overlay och sidfot |
| Kolgrå | `#202326` | Sekundära mörka ytor |
| Hallvit | `#f5f5f2` | Sidbakgrund |
| Bläck | `#17191a` | Brödtext |
| Linjegrå | `#d9dbd8` | Avdelare och tabellinjer |
| Röd nivå | `#b5121b` | Orientering för röd nivå |
| Blå nivå | `#0757a6` | Orientering för blå nivå |
| Grön nivå | `#087a3f` | Orientering för grön nivå |

Nivåfärg används alltid tillsammans med nivåns namn och får aldrig vara den enda betydelsebäraren.

## Typografi

- **Rubriker:** Source Sans 3 i kraftig vikt. Nivå- och divisionsrubrikerna i hero sätts i Roboto Slab, som i nivå- och divisionsreferensen.
- **Brödtext och fakta:** Source Sans 3, kompakt men tydlig i små storlekar på mobil och utskrift.
- Typsnitten lagras lokalt. Rubriker skrivs i meningsfall; versaler används inte som generell dekoration.
- Brödtext begränsas till ungefär 70 tecken per rad.

## Layout

Innehållet är vänsterställt. En bred hero med publikbild och mörk toning etablerar klubbkänslan, medan nivåväljaren bryter hero-kanten och blir sidans tydligaste handlingsyta. Nivåerna visas röd, blå, grön som i referensen och staplas i samma ordning på mobil.

```text
DESKTOP
┌──────────────────────────────────────────────────────────────┐
│ SKÖLD  Moälvens ledarguide        Nivåer Matchdagen Regler  │
├──────────────────────────────────────────────────────────────┤
│  LEDARGUIDE 2026/27              PUBLIKBILD FRÅN SKYTTIS     │
│  Hitta rätt inför matchen         med mörk läsbar toning     │
│  [Välj nivå]                                               │
├──────────────────────────────────────────────────────────────┤
│  GRÖN – kommer senare │ BLÅ – öppna │ RÖD – öppna            │
├────────────────────────┴─────────────┴────────────────────────┤
│  Matchdagen                 │ Bra matchmiljö                 │
├─────────────────────────────┴────────────────────────────────┤
│  Regler, källor och distriktsanpassningar                    │
└──────────────────────────────────────────────────────────────┘

MOBIL
┌──────────────────────────┐
│ SKÖLD  Ledarguide   Meny │
├──────────────────────────┤
│ LEDARGUIDE 2026/27       │
│ Hitta rätt inför matchen │
│ [publikbild]             │
├──────────────────────────┤
│ Välj nivå                │
│ GRÖN – kommer senare     │
│ BLÅ – öppna              │
│ RÖD – öppna              │
├──────────────────────────┤
│ Matchdagen               │
│ Bra matchmiljö           │
│ Regler och dokument      │
└──────────────────────────┘
```

## Principer

- Nivåvalet är startsidans visuella signatur och viktigaste handling.
- Den första skärmen på en nivåguide visar användbara matchfakta före förklarande text.
- Nationell regel, distriktsanpassning och föreningsvägledning har tydligt skilda visuella etiketter.
- Kontrolldatum och originalkälla är synliga där fakta används, inte gömda i sidfoten.
- Animation används endast när den förklarar en användarhandling. Tangentbordsfokus och reducerad rörelse stöds.
- Matchdagen och nivåguiderna har enkel utskriftslayout utan separat PDF.

## Självgranskning

Ett första upplägg med många likadana rundade kort hade kunnat fungera men skulle göra sidan utbytbar mot en generell informationsportal. Den beslutade riktningen använder i stället en sammanhängande nivåväljare med tydliga färgfält, raka halliknande avdelare och en enda bildmässig huvudpunkt. Övriga ytor hålls lugna så att regelhierarkin och matchinformationen förblir lättlästa.
