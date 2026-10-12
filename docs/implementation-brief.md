# Implementeringsunderlag – Ledarguiden 2026/27

## Mål

Ledarguiden hjälper Moälvens IBK:s ledare att snabbt hitta rätt information inför och under en match utan att behöva läsa en ny regelbok. Första versionen prioriterar aktuell, källbelagd information för röd och blå nivå samt föreningens vilja att bidra till en bra matchmiljö.

## Målgrupp och huvudsaklig uppgift

- Primär målgrupp är Moälvens ledare.
- Huvuduppgiften är: “Jag ska leda en match – visa vad som gäller.”
- Gränssnittet utformas mobil först men fungerar även för planering på dator och utskrift.
- Språket är kort, konkret och svenskt.

## Första leveransen

Webbplatsen innehåller:

- startsida,
- nivåguide för röd nivå, division 1–5,
- nivåguide för blå nivå, division 6–7,
- Matchdagen,
- Regler och dokument.

Grön nivå visas i nivåväljaren som “Guide kommer senare”, men får ingen tom eller overifierad guide. Divisioner får inte egna sidor i första leveransen; innehållsmodellen förbereds för dem.

## Domän- och innehållsmodell

- En **nivåguide** innehåller strukturerade, källbelagda fakta som är gemensamma för en nivå.
- En **division** lagrar bara sina **divisionsanpassningar**.
- Den framtida divisionsvyn sammanfogar nivåguiden med divisionens anpassningar.
- Återkommande fakta, exempelvis spelform, matchtid, plan, mål, domare och sekretariat, lagras som validerade fält.
- Varje faktagrupp kan ha originalkälla och kontrolldatum.
- Ändringar under pågående säsong visas genom en kort uppdateringsnotis med datum och källa.

Begreppen definieras i [`GLOSSARY.md`](../GLOSSARY.md).

## Regelhierarki

Guiden skiljer visuellt och språkligt mellan:

1. **Nationell regel** från Svensk Innebandy.
2. **Distriktsanpassning** från Västernorrlands IBF.
3. **Föreningsvägledning** från Moälvens IBK.

När Västernorrland skiljer sig från den nationella utgångspunkten visas båda, tillsammans med giltig nivå eller division, originalkälla och kontrolldatum. Motstridiga aktuella källor märks “Behöver bekräftas” tills distriktet har klargjort vad som gäller.

## Säsonger

- Allt publicerat innehåll tillhör en säsong.
- Enkla adresser som `/rod` och `/bla` visar alltid den aktiva säsongen.
- Framtida arkiv använder permanenta adresser under exempelvis `/sasonger/2026-2027/rod`.
- Nästa säsong kan skapas som ett dolt utkast baserat på samma struktur, men regeluppgifter måste verifieras på nytt.
- Publicering av en ny säsong är ett medvetet beslut; den föregående blir därefter ett oföränderligt arkiv.

## Informationsarkitektur

Startsidan visar i ordning:

1. Hero med klubblogotyp, publikbild och “Ledarguide 2026/27”.
2. Nivåväljare för grön, blå och röd.
3. Snabb väg till Matchdagen.
4. Bra matchmiljö med länkar till förbundets material.
5. Regler, originalkällor och distriktsanpassningar.
6. Tidigare säsonger när ett arkiv finns.

Huvudnavigationen innehåller Hem, Nivåer, Matchdagen samt Regler och dokument. Sökning och kontakt utelämnas tills de fyller en definierad funktion.

På en nivåguide visas de viktigaste matchfakta först. Introduktion, divisionsanpassningar, uppdateringar och källor följer därefter.

## Visuell riktning

- Moälvens orange, svart och kolgrå bär föreningsidentiteten.
- Rött, blått och grönt används för nivåorientering och alltid tillsammans med text.
- Kraftig kondenserad rubrikstil kombineras med lättläst sans-serif brödtext; typsnitten lagras lokalt.
- Nivåväljaren är startsidans visuella signatur.
- Publikbilden från Skyttis används som tillfällig hero och fotografens vattenstämpel behålls.
- Layouten använder tydliga avdelare och sammanhängande nivåfält i stället för många generiska, likadana kort.

Full riktning och wireframe finns i [`design-direction.md`](design-direction.md).

## Bra matchmiljö

Första versionen beskriver en bra matchmiljö som trygg, respektfull och utvecklande. Den länkar främst till förbundets material. Föreslagna egna ledarprinciper publiceras inte som fastslagna Moälven-riktlinjer innan de har jämförts med föreningens befintliga dokument.

## Teknisk riktning

- Astro genererar en statisk webbplats utan konto, databas, CMS, sökning eller serverfunktioner.
- Innehållet lagras i en enda publicerbar och validerad innehållsstruktur; samma text dupliceras inte mellan `docs` och webbplatsen.
- Säsongs- och nivåvägar genereras statiskt från innehållet.
- Vanliga Astro-komponenter och lokal CSS används; inget klientramverk behövs för första versionen.
- Webbplatsen är hosting-oberoende. Vercel eller Netlify kan väljas senare.
- Ingen analys eller tredjepartsspårning läggs till i första versionen.

## Utanför första leveransen

- Publicering till hosting och koppling av domän.
- Administratörsgränssnitt eller CMS.
- Sökfunktion.
- Flerspråksstöd.
- Grön nivå och divisionssidor.
- Fastslagna egna handlingsråd för matchmiljö innan föreningens riktlinjer kontrollerats.

## Klart när

- alla fem beslutade sidor fungerar och länkar samman,
- grön nivå visas tydligt som kommande,
- regelhierarkin är synlig och begriplig,
- säsong, kontrolldatum och originalkällor visas,
- mobil, dator och utskrift fungerar,
- tangentbordsnavigering, synligt fokus, kontrast och reducerad rörelse fungerar,
- inga tomma eller skenbart fungerande kontroller visas,
- Astros projektkontroller och produktionsbygge går igenom.

## Öppna sakfrågor

De återstående, icke-blockerande kontrollpunkterna finns i [`open-questions.md`](open-questions.md): föreningens egna ledarprinciper för bra matchmiljö och framtida verifiering av grön nivå.
