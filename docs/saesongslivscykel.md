# Säsongslivscykel

Gäller [ADR 0001](adr/0001-seasoned-content-with-current-aliases.md). En **säsong** har status i `src/content/sasonger/<säsong>.yaml`:

| Status | Publiceras? | Adress |
| --- | --- | --- |
| `utkast` | Nej, aldrig. Inga sidor genereras och ingenting länkas. | – |
| `aktiv` | Ja, exakt en säsong. | Stabila adresser: `/rod/`, `/bla/`, `/matchdagen/`, `/regler/` |
| `arkiverad` | Ja, skrivskyddad och markerad "Arkiv – gällde säsong X". | `/sasonger/<säsong>/<nivå>/`, t.ex. `/sasonger/2026-2027/rod/` |

Aktivering är alltid ett manuellt beslut (en ändring av `status`). Inget styrs av datum.

## Starta nästa säsong som dolt utkast

```
npm run ny-saeson -- 2026-2027 2027-2028
```

Skriptet (`scripts/starta-saeson.mjs`) kopierar nivåguider och divisionsanpassningar från den gamla säsongen och:

- skapar `sasonger/2027-2028.yaml` med `status: utkast`
- sätter alla faktagrupper, divisionsanpassningar och regeluttalanden till `status: overifierad`
- tar bort uppdateringsnotiser
- behåller kontrolldatum och originalkällor som utgångspunkt. Skriptet verifierar ingenting och skapar inget kontrolldatum.
- skriver aldrig över en säsong som redan finns

Utkastet publiceras inte, så sajten byggs som vanligt medan arbetet pågår.

Matchdagen (`matchdagen/<säsong>.yaml`) och Regler och dokument (`reglerochdokument/<säsong>.yaml`) har ingen verifieringsstatus och kopieras därför inte. Skriv dem för den nya säsongen (utgå från föregående års fil) när uppgifterna kontrollerats.

## Verifiera och aktivera

1. Kontrollera varje faktagrupp, divisionsanpassning och regeluttalande mot originalkällan. Ändra `status` till `verifierad`, sätt `checked` till dagens datum och uppdatera `appliesTo` vid behov.
2. Varje nivåguide måste ha verifierade fakta för `spelform`, `matchtid`, `plan`, `mal`, `domare` och `sekretariat`. Annars misslyckas bygget vid aktivering.
3. Skapa Matchdagen och Regler och dokument för den nya säsongen.
4. Aktivera i en och samma ändring: den gamla säsongens `status` till `arkiverad` och den nya till `aktiv`. Bygget misslyckas om det inte finns exakt en aktiv säsong.

Efter aktivering visar de stabila adresserna den nya säsongen och den gamla finns kvar på `/sasonger/<gammal säsong>/<nivå>/`.

## Vad som arkiveras

Nivåguiderna arkiveras (en sida per nivå): reglerna och matchfakta ändras mellan säsonger, och det ska gå att se vad som gällde. Matchdagen och Regler och dokument får inga arkivsidor: de är checklistor och länkar till förbundets aktuella dokument, och en gammal version riktar bara fel ledare mot föråldrade dokument. Deras filer finns kvar i repot (och git-historiken). Arkivet kan utökas om behov uppstår.

Med bara en riktig säsong genererar arkivrutten inga sidor i produktionsbygget.
