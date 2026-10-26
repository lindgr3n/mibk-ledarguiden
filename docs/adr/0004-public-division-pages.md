# Publika divisionssidor följer referensbilderna

Referensbilderna i `docs/references` (startsida, nivåsida och divisionssida) visar en sida per division, och beslutet är att de följs. Det ersätter första leveransens avgränsning "inga publika divisionssidor" (ADR 0002 förberedde modellen för just detta).

- Varje division i röd och blå nivå får en sida under nivåns adress, till exempel `/rod/division-5/`. Grön nivå får ingen sida förrän materialet är verifierat.
- Sidan sammanfogar nivåguidens gemensamma fakta för divisionen med divisionens egna anpassningar vid bygge. Inget lagras två gånger.
- Division utan verifierade uppgifter får en sida som bara visar att uppgifterna inte är verifierade ännu och länkar till originalkällan. Overifierade uppgifter publiceras aldrig.
- Sök, kontakt, "Bli medlem" och extra huvudmenyval i referensbilderna ingår inte; huvudmenyn förblir Hem, Nivåer, Matchdagen samt Regler och dokument.
